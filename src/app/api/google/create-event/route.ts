import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Create a real Google Calendar event for a booking (with a Meet link + invite).
// Called from the public booking flow. If Google isn't connected it just returns
// {ok:false} and the booking proceeds with the built-in meet link.
export async function POST(req: NextRequest) {
  let body: { summary?: string; description?: string; startISO?: string; endISO?: string; attendeeEmail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.summary || !body.startISO || !body.endISO) return NextResponse.json({ ok: false }, { status: 400 });
  // basic sanity: valid dates, event under 24h, not absurdly far out
  const start = Date.parse(body.startISO);
  const end = Date.parse(body.endISO);
  if (isNaN(start) || isNaN(end) || end <= start || end - start > 24 * 3600_000) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ev = await createCalendarEvent({
    summary: body.summary.slice(0, 300),
    description: body.description?.slice(0, 2000),
    startISO: body.startISO,
    endISO: body.endISO,
    attendeeEmail: body.attendeeEmail,
  });
  if (!ev) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, meetLink: ev.meetLink, htmlLink: ev.htmlLink, eventId: ev.id });
}
