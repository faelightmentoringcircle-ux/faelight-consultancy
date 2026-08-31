"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getSettings, saveSettings, getBookings, getEvents, addEvent, removeEvent,
  toggleBlockedDate, isDateBlocked, onStoreChange, ymd, updateBooking,
  calendarReady, activeCalendarAccount, CALENDAR_LABELS,
  Settings, Booking, BookingStatus, CalendarEvent, EventSource,
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
    const wd = settings.workingDays.includes(day)
      ? settings.workingDays.filter((x) => x !== day)
      : [...settings.workingDays, day].sort();
    saveSettings({ workingDays: wd });
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

      {/* Sync strip */}
      <SyncStrip settings={settings} />

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

function SyncStrip({ settings }: { settings: Settings }) {
  const provider = settings.calendarProvider;
  const linked = provider !== "default";

  function simulateIncoming() {
    if (!linked) return;
    // An event created "on Google/Microsoft" that syncs into the app.
    const d = new Date();
    d.setDate(d.getDate() + 1 + Math.floor(Math.random() * 5));
    const start = (10 + Math.floor(Math.random() * 6)) * 60; // 10:00–15:00
    addEvent({
      date: ymd(d),
      startMin: start,
      endMin: start + 60,
      title: `External event (from ${CALENDAR_LABELS[provider]})`,
      source: provider as EventSource,
      allDay: false,
    });
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-twilight to-forest text-firefly-bright">⇄</span>
          <div>
            <p className="text-sm font-semibold text-forest-deep">
              Two-way sync · {CALENDAR_LABELS[provider]}
            </p>
            <p className="text-xs text-ink-soft">
              {linked
                ? <>Holds &amp; blocks here <strong>push</strong> to {activeCalendarAccount(settings)}; its events <strong>pull</strong> back and block booking.</>
                : <>Using the built-in Faelight calendar — nothing external to sync. Link Google or Microsoft in <Link href="/admin/settings" className="text-firefly-deep hover:underline">Settings</Link>.</>}
            </p>
          </div>
        </div>
        {linked && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">● Synced</span>
            <button onClick={simulateIncoming} className="btn-ghost !px-3 !py-2 text-xs">
              Simulate incoming event
            </button>
          </div>
        )}
      </div>
    </Panel>
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
