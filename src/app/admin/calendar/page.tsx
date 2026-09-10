"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getSettings, saveSettings, getBookings, getEvents, addEvent, removeEvent,
  toggleBlockedDate, isDateBlocked, onStoreChange, ymd, updateBooking,
  calendarReady, CALENDAR_LABELS, saveAvailability, dayHoursFor, defaultWeeklyAvailability,
  Settings, Booking, BookingStatus, CalendarEvent, EventSource, DayHours,
} from "@/lib/store";
import { isWorkingDay } from "@/lib/calendar";
import { formatTime } from "@/lib/format";
import { AdminHeader, Panel } from "@/components/admin/ui";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

function minToHHMM(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
function hhmmToMin(v: string) {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
}
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

export default function CalendarPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [selected, setSelected] = useState<Date | null>(null);

  useEffect(() => {
    const sync = () => { setSettings(getSettings()); setBookings(getBookings()); setEvents(getEvents()); };
    sync();
    return onStoreChange(sync);
  }, []);

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(cursor.y, cursor.m, d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  if (!settings) return null;

  const today = startOfToday();
  const bookingsOn = (d: Date) => bookings.filter((b) => b.status !== "cancelled" && ymd(new Date(b.startsAt)) === ymd(d));
  const eventsOn = (d: Date) => events.filter((e) => e.date === ymd(d));

  const shiftMonth = (delta: number) => {
    setCursor((c) => {
      const m = c.m + delta;
      return { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });
  };

  const toggleWeekend = (day: number) => {
    const cur = dayHoursFor(settings, day);
    const av = { ...(settings.availability || defaultWeeklyAvailability()) };
    av[day] = cur.enabled
      ? { ...cur, enabled: false }
      : { enabled: true, intervals: cur.intervals.length ? cur.intervals : [{ start: 9 * 60, end: 17 * 60 }] };
    saveAvailability(av);
  };

  return (
    <>
      <AdminHeader
        title="Schedule & Availability"
        subtitle="Block days, add personal holds, and manage what the public booking page offers."
        action={
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            calendarReady(settings) ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}>
            {calendarReady(settings) ? "Booking live" : "Booking paused"}
          </span>
        }
      />

      {/* Sync strip — real Google Calendar status */}
      <SyncStrip />

      {/* Booking hours — the window the public booking page offers */}
      <div className="mt-6">
        <BookingHours settings={settings} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-forest-deep">{MONTHS[cursor.m]} {cursor.y}</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => shiftMonth(-1)} className="grid h-8 w-8 place-items-center rounded-lg border border-firefly/25 text-forest hover:border-firefly">‹</button>
              <button onClick={() => { const d = new Date(); setCursor({ y: d.getFullYear(), m: d.getMonth() }); }} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:border-firefly">Today</button>
              <button onClick={() => shiftMonth(1)} className="grid h-8 w-8 place-items-center rounded-lg border border-firefly/25 text-forest hover:border-firefly">›</button>
            </div>
          </div>

          {/* weekday header + weekend toggles */}
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {WD.map((d, i) => {
              const off = !settings.workingDays.includes(i);
              return (
                <button
                  key={d}
                  onClick={() => toggleWeekend(i)}
                  title={off ? "Non-working day — click to enable" : "Working day — click to block"}
                  className={`rounded-md py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
                    off ? "bg-stone-100 text-stone-400 line-through" : "text-ink-faint hover:bg-firefly/10"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* day grid */}
          <div className="mt-1.5 grid grid-cols-7 gap-1.5">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const past = d < today;
              const isToday = ymd(d) === ymd(today);
              const nonWorking = !isWorkingDay(d, settings);
              const blocked = isDateBlocked(settings, d);
              const bk = bookingsOn(d).length;
              const ev = eventsOn(d).length;
              const isSel = selected && ymd(d) === ymd(selected);
              const unavailable = blocked || nonWorking;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(d)}
                  className={`relative flex min-h-[62px] flex-col rounded-lg border p-1.5 text-left transition ${
                    isSel ? "border-forest ring-1 ring-forest/30" : "border-firefly/15 hover:border-firefly/50"
                  } ${past ? "opacity-45" : ""} ${
                    blocked ? "bg-rose-50" : nonWorking ? "bg-stone-50" : "bg-parchment-card"
                  }`}
                >
                  <span className={`text-xs font-semibold ${isToday ? "grid h-5 w-5 place-items-center rounded-full bg-forest text-parchment" : "text-forest-deep"}`}>
                    {d.getDate()}
                  </span>
                  <div className="mt-auto flex flex-wrap gap-0.5">
                    {blocked && <Dot className="bg-rose-500" title="Blocked" />}
                    {nonWorking && !blocked && <Dot className="bg-stone-400" title="Non-working" />}
                    {bk > 0 && <Pill className="bg-forest/15 text-forest">{bk}◷</Pill>}
                    {ev > 0 && <Pill className="bg-firefly/25 text-firefly-deep">{ev}✦</Pill>}
                  </div>
                  {unavailable && !past && (
                    <span className="pointer-events-none absolute right-1 top-1 text-[9px] text-rose-400">✕</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* legend */}
          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-ink-faint">
            <Legend className="bg-rose-500" label="Blocked day" />
            <Legend className="bg-stone-400" label="Non-working" />
            <Legend className="bg-forest/40" label="◷ Bookings" />
            <Legend className="bg-firefly" label="✦ Holds / events" />
          </div>
        </Panel>

        {/* Day detail */}
        <DayDetail
          date={selected}
          settings={settings}
          bookings={selected ? bookingsOn(selected) : []}
          events={selected ? eventsOn(selected) : []}
        />
      </div>
    </>
  );
}

function Dot({ className, title }: { className: string; title: string }) {
  return <span title={title} className={`h-1.5 w-1.5 rounded-full ${className}`} />;
}
function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`rounded px-1 text-[9px] font-semibold leading-tight ${className}`}>{children}</span>;
}
function Legend({ className, label }: { className: string; label: string }) {
  return <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${className}`} />{label}</span>;
}

// Live Google Calendar status (reads /api/google/status). Also keeps the stored
// settings honest so the header "Booking live" badge + booking engine match reality.
function SyncStrip() {
  const [st, setSt] = useState<{ loading: boolean; configured: boolean; connected: boolean; email: string | null }>({
    loading: true, configured: false, connected: false, email: null,
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setSt({ loading: false, configured: !!j.configured, connected: !!j.connected, email: j.email ?? null });
        if (j.configured) {
          const cur = getSettings();
          const wantConnected = !!j.connected;
          const wantEmail = j.email ?? "";
          if (cur.googleConnected !== wantConnected || cur.googleAccount !== wantEmail) {
            saveSettings({
              googleConnected: wantConnected,
              googleAccount: wantEmail,
              ...(wantConnected ? { calendarProvider: "google" as const } : {}),
            });
          }
        }
      })
      .catch(() => { if (alive) setSt((s) => ({ ...s, loading: false })); });
    return () => { alive = false; };
  }, []);

  const row = "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

  if (st.loading) {
    return <Panel><p className="text-xs text-ink-faint">Checking Google Calendar connection…</p></Panel>;
  }

  if (st.configured && st.connected) {
    return (
      <Panel>
        <div className={row}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-twilight to-forest text-firefly-bright">⇄</span>
            <div>
              <p className="text-sm font-semibold text-forest-deep">Two-way sync · Google Calendar</p>
              <p className="text-xs text-ink-soft">
                Confirmed bookings create real Google events with a Meet link on <strong>{st.email}</strong>; blocks &amp; holds you set here keep the public slots clear.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">● Connected</span>
            <Link href="/admin/settings" className="btn-ghost !px-3 !py-2 text-xs">Manage</Link>
          </div>
        </div>
      </Panel>
    );
  }

  if (st.configured && !st.connected) {
    return (
      <Panel>
        <div className={row}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">⇄</span>
            <div>
              <p className="text-sm font-semibold text-forest-deep">Google Calendar not connected</p>
              <p className="text-xs text-ink-soft">Bookings still work on the built-in calendar. Connect Google to auto-create real events + Meet links.</p>
            </div>
          </div>
          <Link href="/admin/settings" className="btn-primary !px-3 !py-2 text-xs">Connect in Settings</Link>
        </div>
      </Panel>
    );
  }

  // Server env not configured — built-in calendar only.
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-stone-500">⇄</span>
        <div>
          <p className="text-sm font-semibold text-forest-deep">Built-in Faelight calendar</p>
          <p className="text-xs text-ink-soft">Using the built-in calendar — nothing external to sync. Google Calendar isn’t set up on the server yet.</p>
        </div>
      </div>
    </Panel>
  );
}

// Per-day booking availability (Calendly-style). Each weekday can be off or
// have one+ time ranges; these are exactly the windows the public booking page
// offers. Buffer / min-notice / max-advance stay in Settings → Booking Rules.
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const APPT_OPTS = [
  { v: 30, label: "30 min" }, { v: 45, label: "45 min" }, { v: 60, label: "1 hr" },
  { v: 90, label: "1.5 hr" }, { v: 120, label: "2 hr" },
];
const TIME_OPTS: { v: number; label: string }[] = (() => {
  const out: { v: number; label: string }[] = [];
  for (let m = 6 * 60; m <= 21 * 60; m += 30) {
    const h = Math.floor(m / 60), mm = m % 60;
    const ap = h < 12 ? "AM" : "PM";
    const h12 = ((h + 11) % 12) + 1;
    out.push({ v: m, label: `${h12}:${String(mm).padStart(2, "0")} ${ap}` });
  }
  return out;
})();

function BookingHours({ settings }: { settings: Settings }) {
  const appt = settings.appointmentMinutes || 60;
  const av = settings.availability || defaultWeeklyAvailability();

  const setDay = (day: number, dh: DayHours) => saveAvailability({ ...av, [day]: dh });
  const toggleDay = (day: number) => {
    const cur = dayHoursFor(settings, day);
    setDay(day, cur.enabled
      ? { ...cur, enabled: false }
      : { enabled: true, intervals: cur.intervals.length ? cur.intervals : [{ start: 9 * 60, end: 17 * 60 }] });
  };
  const setInterval = (day: number, idx: number, patch: Partial<{ start: number; end: number }>) => {
    const cur = dayHoursFor(settings, day);
    setDay(day, { ...cur, enabled: true, intervals: cur.intervals.map((iv, i) => (i === idx ? { ...iv, ...patch } : iv)) });
  };
  const addInterval = (day: number) => {
    const cur = dayHoursFor(settings, day);
    const last = cur.intervals[cur.intervals.length - 1];
    const start = last ? Math.min(last.end + 60, 20 * 60) : 9 * 60;
    setDay(day, { enabled: true, intervals: [...cur.intervals, { start, end: Math.min(start + 60, 21 * 60) }] });
  };
  const removeInterval = (day: number, idx: number) => {
    const cur = dayHoursFor(settings, day);
    const intervals = cur.intervals.filter((_, i) => i !== idx);
    setDay(day, intervals.length ? { ...cur, intervals } : { enabled: false, intervals: [] });
  };
  const copyMonToWeekdays = () => {
    const mon = dayHoursFor(settings, 1);
    const next = { ...av };
    [2, 3, 4, 5].forEach((d) => { next[d] = { enabled: mon.enabled, intervals: mon.intervals.map((iv) => ({ ...iv })) }; });
    saveAvailability(next);
  };
  const slotCount = (dh: DayHours) =>
    dh.enabled ? dh.intervals.reduce((n, iv) => n + Math.max(0, Math.floor((iv.end - iv.start) / appt)), 0) : 0;

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-forest-deep">Booking hours</h2>
          <p className="max-w-xl text-xs text-ink-soft">
            Set the hours clients can book a consultation for. These are exactly the times shown on your website’s booking form — a client can only pick a slot that falls inside them.
          </p>
        </div>
        <Link href="/admin/settings" className="text-xs font-semibold text-firefly-deep hover:underline">Buffer &amp; notice rules →</Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-firefly/15 pb-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-forest-deep">Appointment length</span>
          <select
            value={appt}
            onChange={(e) => saveSettings({ appointmentMinutes: Number(e.target.value) })}
            className="rounded-lg border border-firefly/25 bg-white px-3 py-1.5 text-sm outline-none focus:border-firefly"
          >
            {APPT_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </label>
        <button onClick={copyMonToWeekdays} className="rounded-full border border-firefly/30 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">
          Copy Monday to weekdays
        </button>
      </div>

      <div className="mt-1 divide-y divide-firefly/10">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const dh = dayHoursFor(settings, day);
          return (
            <div key={day} className="flex flex-wrap items-start gap-x-3 gap-y-2 py-3">
              <label className="flex w-28 shrink-0 items-center gap-2 pt-1.5">
                <input type="checkbox" checked={dh.enabled} onChange={() => toggleDay(day)} className="h-4 w-4 accent-forest" />
                <span className={`text-sm font-semibold ${dh.enabled ? "text-forest-deep" : "text-ink-faint"}`}>{DAY_NAMES[day]}</span>
              </label>

              {!dh.enabled ? (
                <div className="flex items-center gap-3 pt-1.5">
                  <span className="text-sm text-ink-faint">Day off</span>
                  <button onClick={() => toggleDay(day)} className="text-xs font-semibold text-firefly-deep hover:underline">+ Add hours</button>
                </div>
              ) : (
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {dh.intervals.map((iv, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2">
                      <TimeSelect value={iv.start} onChange={(v) => setInterval(day, idx, { start: v })} />
                      <span className="text-xs text-ink-faint">to</span>
                      <TimeSelect value={iv.end} onChange={(v) => setInterval(day, idx, { end: v })} />
                      <button onClick={() => removeInterval(day, idx)} title="Remove range" className="grid h-6 w-6 place-items-center rounded text-rose-500 hover:bg-rose-50">✕</button>
                      <button onClick={() => addInterval(day)} title="Add another range" className="grid h-6 w-6 place-items-center rounded text-forest hover:bg-firefly/10">+</button>
                      {iv.end <= iv.start && <span className="text-[11px] font-semibold text-rose-600">end must be after start</span>}
                    </div>
                  ))}
                </div>
              )}

              <span className="ml-auto pt-1.5 text-xs text-ink-faint">{slotCount(dh)} slots</span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-ink-faint">
        “Slots” is the rough capacity per day at the appointment length above. The public page still offers start times every 30 minutes and hides anything already booked or held.
      </p>
    </Panel>
  );
}

function TimeSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-lg border border-firefly/25 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-firefly"
    >
      {TIME_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
    </select>
  );
}

function DayDetail({
  date, settings, bookings, events,
}: {
  date: Date | null;
  settings: Settings;
  bookings: Booking[];
  events: CalendarEvent[];
}) {
  const [hold, setHold] = useState({ start: "13:00", end: "14:00", title: "" });
  const [editBk, setEditBk] = useState<Booking | null>(null);
  const [bf, setBf] = useState({ clientName: "", bookingTypeName: "", start: "", end: "", status: "confirmed" as BookingStatus, agenda: "" });

  const hhmm = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  function openBookingEdit(b: Booking) {
    setBf({ clientName: b.clientName, bookingTypeName: b.bookingTypeName, start: hhmm(b.startsAt), end: hhmm(b.endsAt), status: b.status, agenda: b.agenda });
    setEditBk(b);
  }
  function saveBooking() {
    if (!editBk) return;
    const mk = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      const d = new Date(editBk.startsAt);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    };
    updateBooking(editBk.id, {
      clientName: bf.clientName,
      bookingTypeName: bf.bookingTypeName,
      startsAt: mk(bf.start),
      endsAt: mk(bf.end),
      status: bf.status,
      agenda: bf.agenda,
    });
    setEditBk(null);
  }
  const bkInput = "w-full rounded-lg border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly";
  const bkLbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

  if (!date) {
    return (
      <Panel>
        <p className="py-10 text-center text-sm text-ink-faint">
          ✦ Select a day to see its bookings, add a personal hold, or block it.
        </p>
      </Panel>
    );
  }

  const past = date < startOfToday();
  const blocked = isDateBlocked(settings, date);
  const nonWorking = !isWorkingDay(date, settings);

  function addHold(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    const s = hhmmToMin(hold.start), en = hhmmToMin(hold.end);
    if (en <= s) return;
    addEvent({ date: ymd(date), startMin: s, endMin: en, title: hold.title.trim() || "Personal hold", source: "app", allDay: false });
    setHold({ start: "13:00", end: "14:00", title: "" });
  }

  const srcBadge: Record<EventSource, string> = {
    app: "bg-firefly/20 text-firefly-deep",
    google: "bg-blue-100 text-blue-700",
    microsoft: "bg-indigo-100 text-indigo-700",
  };
  const srcLabel: Record<EventSource, string> = { app: "App", google: "Google", microsoft: "Microsoft" };

  return (
    <>
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-lg text-forest-deep">
            {date.toLocaleDateString("en-PH", { weekday: "long" })}
          </h2>
          <p className="text-xs text-ink-faint">{date.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {blocked && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">Blocked</span>}
          {nonWorking && !blocked && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">Non-working</span>}
          {!blocked && !nonWorking && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Open</span>}
        </div>
      </div>

      {/* Block / unblock */}
      {!past && (
        <button
          onClick={() => toggleBlockedDate(date)}
          className={`mt-4 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            blocked
              ? "border-forest bg-forest text-parchment hover:bg-forest-deep"
              : "border-rose-300 text-rose-700 hover:bg-rose-50"
          }`}
        >
          {blocked ? "↺ Unblock this day" : "⃠ Block this whole day"}
        </button>
      )}

      {/* Bookings */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Bookings</p>
        <div className="mt-2 space-y-2">
          {bookings.length === 0 && <p className="text-xs text-ink-faint">None.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="flex items-start justify-between gap-2 rounded-lg border border-forest/15 bg-forest/5 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-forest-deep">◷ {formatTime(b.startsAt)} · {b.clientName}</p>
                <p className="text-xs text-ink-faint">{b.bookingTypeName}</p>
              </div>
              <button onClick={() => openBookingEdit(b)} className="shrink-0 rounded-lg border border-firefly/30 px-2 py-0.5 text-[11px] font-semibold text-forest hover:bg-firefly/10">Edit</button>
            </div>
          ))}
        </div>
      </div>

      {/* Events / holds */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Holds &amp; synced events</p>
        <div className="mt-2 space-y-2">
          {events.length === 0 && <p className="text-xs text-ink-faint">None.</p>}
          {events.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between rounded-lg border border-firefly/20 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-forest-deep">
                  ✦ {minToHHMM(ev.startMin)}–{minToHHMM(ev.endMin)} · {ev.title}
                </p>
                <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${srcBadge[ev.source]}`}>
                  {srcLabel[ev.source]}
                </span>
              </div>
              <button onClick={() => removeEvent(ev.id)} className="shrink-0 text-xs font-semibold text-rose-600 hover:underline">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add personal hold */}
      {!past && (
        <form onSubmit={addHold} className="mt-5 rounded-xl border border-firefly/20 bg-parchment-warm/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Add a personal hold</p>
          <div className="mt-2 flex items-center gap-2">
            <input type="time" value={hold.start} onChange={(e) => setHold((h) => ({ ...h, start: e.target.value }))} className="rounded-lg border border-firefly/25 bg-white/70 px-2 py-1.5 text-sm outline-none focus:border-firefly" />
            <span className="text-ink-faint">–</span>
            <input type="time" value={hold.end} onChange={(e) => setHold((h) => ({ ...h, end: e.target.value }))} className="rounded-lg border border-firefly/25 bg-white/70 px-2 py-1.5 text-sm outline-none focus:border-firefly" />
          </div>
          <input value={hold.title} onChange={(e) => setHold((h) => ({ ...h, title: e.target.value }))} placeholder="Title (e.g. Lunch, Dentist)" className="mt-2 w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-1.5 text-sm outline-none focus:border-firefly" />
          <button type="submit" className="btn-primary mt-2 w-full !py-2 text-sm">+ Add hold</button>
          <p className="mt-2 text-[11px] text-ink-faint">
            Blocks this time on the public booking page{settings.calendarProvider !== "default" && <> and pushes to {CALENDAR_LABELS[settings.calendarProvider]}</>}.
          </p>
        </form>
      )}
    </Panel>

    {editBk && (
      <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
        <div className="my-8 w-full max-w-md rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-forest-deep">Edit Booking</h2>
            <button onClick={() => setEditBk(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2"><span className={bkLbl}>Client name</span><input className={bkInput} value={bf.clientName} onChange={(e) => setBf((f) => ({ ...f, clientName: e.target.value }))} /></label>
            <label className="space-y-1 sm:col-span-2"><span className={bkLbl}>Booking type</span><input className={bkInput} value={bf.bookingTypeName} onChange={(e) => setBf((f) => ({ ...f, bookingTypeName: e.target.value }))} /></label>
            <label className="space-y-1"><span className={bkLbl}>Start</span><input type="time" className={bkInput} value={bf.start} onChange={(e) => setBf((f) => ({ ...f, start: e.target.value }))} /></label>
            <label className="space-y-1"><span className={bkLbl}>End</span><input type="time" className={bkInput} value={bf.end} onChange={(e) => setBf((f) => ({ ...f, end: e.target.value }))} /></label>
            <label className="space-y-1 sm:col-span-2"><span className={bkLbl}>Status</span>
              <select className={bkInput} value={bf.status} onChange={(e) => setBf((f) => ({ ...f, status: e.target.value as BookingStatus }))}>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-show</option>
              </select>
            </label>
            <label className="space-y-1 sm:col-span-2"><span className={bkLbl}>Agenda / notes</span><textarea rows={2} className={bkInput} value={bf.agenda} onChange={(e) => setBf((f) => ({ ...f, agenda: e.target.value }))} /></label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setEditBk(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
            <button onClick={saveBooking} disabled={!bf.clientName.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">Save changes</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
