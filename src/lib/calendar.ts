// =====================================================================
// Availability engine. Open slots come from the admin's per-day booking
// hours (settings.availability), minus real bookings and calendar holds/
// events. (The old deterministic "fake busy" generator was removed — a real
// business shouldn't show phantom conflicts.)
// =====================================================================
import { Booking, Settings, CalendarEvent, ymd, dayHoursFor } from "./store";

export interface Slot {
  start: string; // ISO
  end: string; // ISO
  label: string; // "10:00 AM"
}

interface BusyBlock {
  start: number; // minutes from midnight
  end: number;
}

function sameLocalDay(iso: string, date: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
}

export function isWorkingDay(date: Date, settings: Settings): boolean {
  const dh = settings.availability?.[date.getDay()];
  if (dh) return dh.enabled && dh.intervals.length > 0;
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

  // Busy = real bookings + calendar holds/synced events for this day.
  const busy: BusyBlock[] = [];
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
  const key = ymd(date);
  events
    .filter((ev) => ev.date === key)
    .forEach((ev) => busy.push({ start: ev.startMin, end: ev.endMin }));

  const intervals = dayHoursFor(settings, date.getDay()).intervals;
  const step = 30; // offer slots on the half hour
  const buffer = settings.bufferMin;

  const now = new Date();
  const minStart = new Date(now.getTime() + settings.minNoticeHours * 3600_000);

  const slots: Slot[] = [];
  const seen = new Set<string>();
  for (const iv of intervals) {
    for (let t = iv.start; t + durationMin <= iv.end; t += step) {
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

      const iso = startDate.toISOString();
      if (seen.has(iso)) continue; // overlapping intervals shouldn't double-offer
      seen.add(iso);

      const endDate = new Date(date);
      endDate.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);

      slots.push({
        start: iso,
        end: endDate.toISOString(),
        label: startDate.toLocaleTimeString("en-PH", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      });
    }
  }
  slots.sort((a, b) => (a.start < b.start ? -1 : 1));
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
