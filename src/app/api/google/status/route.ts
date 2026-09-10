import { NextResponse } from "next/server";
import { checkIntegration, googleConfigured } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Whether Google Calendar is connected + which account. `debug` carries any
// Supabase read error (e.g. a wrong service-role key) to aid setup — no secret.
export async function GET() {
  if (!googleConfigured()) return NextResponse.json({ configured: false, connected: false, email: null });
  const { connected, email, error } = await checkIntegration();
  return NextResponse.json({ configured: true, connected, email, debug: error });
}
