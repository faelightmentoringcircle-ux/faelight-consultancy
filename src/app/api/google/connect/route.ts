import { NextRequest, NextResponse } from "next/server";
import { googleConfigured, buildAuthUrl } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Starts the Google OAuth flow: sets a short-lived CSRF cookie and redirects to
// Google's consent screen. The real protection against a stranger connecting is
// the email allowlist checked in the callback.
export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/admin/settings?google=notconfigured", origin));
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(buildAuthUrl(state));
  res.cookies.set("g_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
