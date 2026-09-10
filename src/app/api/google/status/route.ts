import { NextResponse } from "next/server";
import { getIntegration, googleConfigured } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Whether Google Calendar is connected + which account. No secret is exposed.
export async function GET() {
  if (!googleConfigured()) return NextResponse.json({ configured: false, connected: false, email: null });
  const integ = await getIntegration();
  return NextResponse.json({ configured: true, connected: !!integ, email: integ?.email ?? null });
}
