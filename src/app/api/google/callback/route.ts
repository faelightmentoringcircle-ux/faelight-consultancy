import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, fetchGoogleEmail, saveIntegration, allowedGoogleEmails } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Google redirects back here with ?code. We verify the CSRF state, exchange the
// code for tokens, confirm the Google account is on the allowlist, and store the
// refresh token (server-side, service-role). Then back to Settings.
export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const back = (status: string) => {
    const res = NextResponse.redirect(new URL(`/admin/settings?google=${status}`, origin));
    res.cookies.delete("g_oauth_state");
    return res;
  };

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("g_oauth_state")?.value;
  if (!code || !state || !cookieState || state !== cookieState) return back("error");

  const tokens = await exchangeCode(code);
  // No refresh_token means Google didn't issue one (already-granted consent). We
  // force prompt=consent on connect, so this should only happen on odd re-tries.
  if (!tokens?.refresh_token) return back("noretoken");

  const email = await fetchGoogleEmail(tokens.access_token);
  if (email && !allowedGoogleEmails().includes(email.toLowerCase())) return back("denied");

  const storeErr = await saveIntegration(tokens.refresh_token, email);
  if (storeErr) return back("storefail");
  return back("connected");
}
