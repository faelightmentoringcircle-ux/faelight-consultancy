import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deleteIntegration } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_ADMINS = [
  "faelightmentoringcircle@gmail.com",
  "villanueva.berlyd@gmail.com",
  "eva.bdimalanta@gmail.com",
];
function admins(): string[] {
  const env = (process.env.INVITE_ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return env.length ? env : FALLBACK_ADMINS;
}

// Remove the stored Google connection. Admin only (verified via Supabase token).
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ ok: false, error: "Not configured." }, { status: 500 });

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  const supa = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: caller } = await supa.auth.getUser(token);
  const email = caller?.user?.email?.toLowerCase();
  if (!email || !admins().includes(email)) return NextResponse.json({ ok: false, error: "Admins only." }, { status: 403 });

  await deleteIntegration();
  return NextResponse.json({ ok: true });
}
