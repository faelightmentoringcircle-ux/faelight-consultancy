// =====================================================================
// Simulated availability engine. Stands in for Google Calendar FreeBusy
// (spec §5). Busy blocks are generated deterministically per day so the
// "calendar" is stable across renders, then merged with real demo
// bookings. Swap generateBusyBlocks() for a FreeBusy API call to go live.
// =====================================================================
import { Booking, Settings, CalendarEvent, ymd } from "./store";

export interface Slot {
  start: string; // ISO
  end: string; // ISO
  label: string; // "10:00 AM"
}

interface BusyBlock {
  start: number; // minutes from midnight
  end: number;
}

// Simple deterministic hash so the same date always yields the same busy map
function seedFromDate(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function pseudo(seed: number): () => number {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

// Pretend Maia already has some meetings on any given working day.
function generateBusyBlocks(date: Date, settings: Settings): BusyBlock[] {
  const rng = pseudo(seedFromDate(date));
  const blocks: BusyBlock[] = [];
  const dayStart = settings.startHour * 60;
  const dayEnd = settings.endHour * 60;

  // 0–3 existing meetings, each 30–90 min, snapped to :00/:30
  const count = Math.floor(rng() * 4);
  for (let i = 0; i < count; i++) {
    const span = dayEnd - dayStart - 60;
    let start = dayStart + Math.floor((rng() * span) / 30) * 30;
    const len = [30, 60, 90][Math.floor(rng() * 3)];
    blocks.push({ start, end: Math.min(start + len, dayEnd) });
  }
  // A recurring "lunch / deep work" hold most days
  if (rng() > 0.35) {
    blocks.push({ start: 12 * 60, end: 13 * 60 });
  }
  return blocks;
}

function sameLocalDay(iso: string, date: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
}

function minutesOfDay(iso: string): { start: number; end: number } {
  const d = new Date(iso);
  return { start: d.getHours() * 60 + d.getMinutes(), end: 0 };
}

export function isWorkingDay(date: Date, settings: Settings): boolean {
  return settings.workingDays.includes(date.getDay());
}

export function withinBookingWindow(date: Date, settings: Settings): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);
  return target >= today && target <= maxDate;
}

// Produce the open slots for a given local date.
export function getAvailableSlots(
  date: Date,
  durationMin: number,
  settings: Settings,
  bookings: Booking[],
  events: CalendarEvent[] = []
): Slot[] {
  if (!isWorkingDay(date, settings)) return [];
  if (!withinBookingWindow(date, settings)) return [];
  if (settings.blockedDates.includes(ymd(date))) return []; // admin blocked this day

  const busy = generateBusyBlocks(date, settings);

  // Fold real bookings for this day into busy blocks
  bookings
    .filter((b) => b.status !== "cancelled" && sameLocalDay(b.startsAt, date))
    .forEach((b) => {
      const s = new Date(b.startsAt);
      const e = new Date(b.endsAt);
      busy.push({
        start: s.getHours() * 60 + s.getMinutes(),
        end: e.getHours() * 60 + e.getMinutes(),
      });
    });

  // Fold calendar events (personal holds + synced external events) for this day
  const key = ymd(date);
  events
    .filter((ev) => ev.date === key)
    .forEach((ev) => busy.push({ start: ev.startMin, end: ev.endMin }));

  const dayStart = settings.startHour * 60;
  const dayEnd = settings.endHour * 60;
  const step = 30; // offer slots on the half hour
  const buffer = settings.bufferMin;

  const now = new Date();
  const minStart = new Date(now.getTime() + settings.minNoticeHours * 3600_000);

  const slots: Slot[] = [];
  for (let t = dayStart; t + durationMin <= dayEnd; t += step) {
    const slotStart = t;
    const slotEnd = t + durationMin;

    // Respect buffer around any busy block
    const clash = busy.some(
      (b) => slotStart < b.end + buffer && slotEnd + buffer > b.start
    );
    if (clash) continue;

    const startDate = new Date(date);
    startDate.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);
    if (startDate < minStart) continue;

    const endDate = new Date(date);
    endDate.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);

    slots.push({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      label: startDate.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    });
  }
  return slots;
}

// Re-check a specific slot right before confirming (race handling, §5.6)
export function slotStillOpen(
  slot: Slot,
  durationMin: number,
  settings: Settings,
  bookings: Booking[],
  events: CalendarEvent[] = []
): boolean {
  const date = new Date(slot.start);
  const open = getAvailableSlots(date, durationMin, settings, bookings, events);
  return open.some((s) => s.start === slot.start);
}

// Build the list of selectable dates for the date picker
export function selectableDates(settings: Settings): Date[] {
  const out: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i <= settings.maxAdvanceDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
}
