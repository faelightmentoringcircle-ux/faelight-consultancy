// =====================================================================
// Google Calendar — SERVER ONLY (imported by /api/google/* routes). Never
// import this from a client component: it uses the service-role key + the
// Google client secret. Needs these Vercel env vars:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
//   SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL
//   GOOGLE_ALLOWED_EMAILS (optional, comma-separated allowlist)
// =====================================================================
import { createClient } from "@supabase/supabase-js";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CAL_TZ = "Asia/Manila";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
].join(" ");

export function googleConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export function buildAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${p.toString()}`;
}

export async function exchangeCode(code: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
      code,
    }),
  });
  if (!res.ok) return null;
  return (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };
}

export async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const j = await res.json();
  return (j.email as string) ?? null;
}

export async function saveIntegration(refresh_token: string, email: string | null) {
  await admin().from("google_integration").upsert({ id: "default", refresh_token, email, updated_at: new Date().toISOString() });
}
export async function getIntegration() {
  const { data } = await admin()
    .from("google_integration")
    .select("refresh_token,email,calendar_id")
    .eq("id", "default")
    .maybeSingle();
  return (data as { refresh_token: string; email: string | null; calendar_id: string } | null) ?? null;
}
export async function deleteIntegration() {
  await admin().from("google_integration").delete().eq("id", "default");
}

/** A fresh access token from the stored refresh token (Google refreshes cheaply). */
async function getAccessToken(): Promise<string | null> {
  const integ = await getIntegration();
  if (!integ?.refresh_token) return null;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: integ.refresh_token,
    }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  return (j.access_token as string) ?? null;
}

/** Create a calendar event with a Google Meet link and invite the attendee. */
export async function createCalendarEvent(opts: {
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
  attendeeEmail?: string;
}): Promise<{ htmlLink: string; meetLink: string; id: string } | null> {
  const token = await getAccessToken();
  const integ = await getIntegration();
  if (!token || !integ) return null;
  const calId = integ.calendar_id || "primary";
  const event = {
    summary: opts.summary,
    description: opts.description,
    start: { dateTime: opts.startISO, timeZone: CAL_TZ },
    end: { dateTime: opts.endISO, timeZone: CAL_TZ },
    attendees: opts.attendeeEmail ? [{ email: opts.attendeeEmail }] : undefined,
    conferenceData: { createRequest: { requestId: `fae-${Date.now()}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
  };
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(event) },
  );
  if (!res.ok) return null;
  const j = await res.json();
  return {
    htmlLink: (j.htmlLink as string) || "",
    meetLink: (j.hangoutLink as string) || j.conferenceData?.entryPoints?.[0]?.uri || "",
    id: (j.id as string) || "",
  };
}

/** Busy intervals for a time window (real availability via FreeBusy). */
export async function freeBusy(timeMin: string, timeMax: string): Promise<{ start: string; end: string }[]> {
  const token = await getAccessToken();
  const integ = await getIntegration();
  if (!token || !integ) return [];
  const calId = integ.calendar_id || "primary";
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin, timeMax, timeZone: CAL_TZ, items: [{ id: calId }] }),
  });
  if (!res.ok) return [];
  const j = await res.json();
  return (j.calendars?.[calId]?.busy as { start: string; end: string }[]) ?? [];
}

/** Google accounts allowed to connect (protects the callback from a stranger). */
export function allowedGoogleEmails(): string[] {
  const env = (process.env.GOOGLE_ALLOWED_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return env.length
    ? env
    : ["faelightmentoringcircle@gmail.com", "villanueva.berlyd@gmail.com", "eva.bdimalanta@gmail.com"];
}
