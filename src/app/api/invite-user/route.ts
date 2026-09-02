import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Server-only route. Uses the Supabase SERVICE-ROLE key (never exposed to the
// browser) to send a login invite email. The invited person clicks the link
// and sets their own password on /reset — no admin ever opens Supabase.
//
// Required env vars on Vercel (Server, NOT NEXT_PUBLIC):
//   SUPABASE_SERVICE_ROLE_KEY   — Supabase → Settings → API → service_role
// Reuses the existing public URL var:
//   NEXT_PUBLIC_SUPABASE_URL
// Optional: INVITE_ADMIN_EMAILS — comma-separated admin emails allowed to invite.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admins permitted to send invites. Overridable via env; falls back to the
// real founder/admin logins so it works out of the box.
const FALLBACK_ADMINS = [
  "faelightmentoringcircle@gmail.com",
  "villanueva.berlyd@gmail.com",
  "eva.bdimalanta@gmail.com",
];

function adminAllowlist(): string[] {
  const env = (process.env.INVITE_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return env.length ? env : FALLBACK_ADMINS;
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy." },
      { status: 500 },
    );
  }

  // Parse input
  let body: { email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "A valid email is required." }, { status: 400 });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Verify the caller is a signed-in admin (defense-in-depth; the UI already
  // hides the button from non-admins).
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  const { data: caller, error: callerErr } = await admin.auth.getUser(token);
  if (callerErr || !caller?.user?.email) {
    return NextResponse.json({ ok: false, error: "Your session has expired — sign in again." }, { status: 401 });
  }
  if (!adminAllowlist().includes(caller.user.email.toLowerCase())) {
    return NextResponse.json({ ok: false, error: "Only an admin can send invites." }, { status: 403 });
  }

  // Send the invite. The link returns to /reset so they set a password.
  const origin = req.headers.get("origin") || `https://${req.headers.get("host")}`;
  const redirectTo = `${origin}/reset/`;
  const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });

  if (error) {
    // Most common: the person already has an account.
    const already = /already|registered|exists/i.test(error.message);
    return NextResponse.json(
      {
        ok: false,
        error: already
          ? "That email already has a login. Ask them to use “Forgot password?” instead."
          : error.message,
      },
      { status: already ? 409 : 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
