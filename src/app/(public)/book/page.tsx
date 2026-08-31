"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { BookingType } from "@/lib/content";
import {
  getSettings,
  getBookings,
  getEvents,
  getBookingTypes,
  addBooking,
  addLead,
  updateBooking,
  calendarReady,
  onStoreChange,
  ymd,
  Settings,
  Booking,
  CalendarEvent,
} from "@/lib/store";
import {
  getAvailableSlots,
  slotStillOpen,
  isWorkingDay,
  withinBookingWindow,
  Slot,
} from "@/lib/calendar";
import { formatDate, formatTime } from "@/lib/format";
import { Eyebrow, Fireflies, Glow, Star } from "@/components/Motifs";
import { PaymentDetails } from "@/components/PaymentDetails";

type Step = 1 | 2 | 3 | 4;

// Conferencing + calendar wording for the active provider.
function confName(s: Settings): string {
  if (s.calendarProvider === "microsoft") return "Microsoft Teams";
  if (s.calendarProvider === "google") return "Google Meet";
  return "Faelight video room";
}
function calName(s: Settings): string {
  if (s.calendarProvider === "microsoft") return "Microsoft / Outlook calendar";
  if (s.calendarProvider === "google") return "Google Calendar";
  return "Faelight calendar";
}

export default function BookPage() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [step, setStep] = useState<Step>(1);
  const [typeId, setTypeId] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [details, setDetails] = useState({ name: "", email: "", phone: "", agenda: "", agreedToUpdates: true });
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [raceError, setRaceError] = useState(false);

  const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
  useEffect(() => {
    const sync = () => {
      setSettings(getSettings());
      setBookings(getBookings());
      setEvents(getEvents());
      setBookingTypes(getBookingTypes());
    };
    sync();
    setMounted(true);
    return onStoreChange(sync);
  }, []);

  const bookingType = bookingTypes.find((b) => b.id === typeId);
  const duration = bookingType?.durationMin ?? 60;

  const slots = useMemo(() => {
    if (!settings || !date) return [];
    return getAvailableSlots(date, duration, settings, bookings, events);
  }, [settings, date, duration, bookings, events]);

  if (!mounted || !settings) {
    return <div className="container-fae section"><div className="h-96 animate-pulse rounded-3xl bg-parchment-warm/50" /></div>;
  }

  // Active calendar not ready → degrade to inquiry (spec §5.7)
  if (!calendarReady(settings)) {
    return <DegradedBooking />;
  }

  function confirm() {
    if (!bookingType || !slot || !settings) return;
    // Re-check the slot against the latest calendar right before creating
    // (race handling §5.6 + blocked dates / holds). A slot that is no longer
    // open cannot be completed — the client is sent back to pick another.
    const freshSettings = getSettings();
    const fresh = getBookings();
    const freshEvents = getEvents();
    if (!slotStillOpen(slot, duration, freshSettings, fresh, freshEvents)) {
      setRaceError(true);
      setSettings(freshSettings);
      setBookings(fresh);
      setEvents(freshEvents);
      setSlot(null);
      setStep(2);
      return;
    }
    const lead = addLead({
      name: details.name,
      email: details.email,
      phone: details.phone || undefined,
      categorySlug: null,
      serviceId: null,
      message: `Booked ${bookingType.name}. Agenda: ${details.agenda || "—"}`,
      source: "Booking page",
      agreedToUpdates: details.agreedToUpdates,
      status: "discovery booked",
    });
    const bk = addBooking({
      leadId: lead.id,
      bookingTypeId: bookingType.id,
      bookingTypeName: bookingType.name,
      startsAt: slot.start,
      endsAt: slot.end,
      clientName: details.name,
      clientEmail: details.email,
      clientPhone: details.phone || undefined,
      agenda: details.agenda,
      feeLabel: bookingType.feeLabel,
    });
    setConfirmed(bk);
  }

  if (confirmed) {
    return <Confirmation booking={confirmed} settings={settings} subscribed={details.agreedToUpdates} />;
  }

  return (
    <>
      {/* Hero */}
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={12} />
        <Glow className="-left-16 top-0" size={440} />
        <div className="container-fae relative z-10 py-14 sm:py-16">
          <Eyebrow light>Book with Maia</Eyebrow>
          <h1 className="mt-3 max-w-2xl font-serif text-2xl leading-tight sm:text-3xl">
            Grab a time on Maia's real calendar.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-parchment/70">
            Availability syncs live — you'll only ever see slots she's actually free.
            All times shown in Asia/Manila (GMT+8).
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-fae max-w-4xl">
          <Stepper step={step} />

          {raceError && (
            <div className="mb-6 rounded-xl border border-firefly/40 bg-firefly/10 px-4 py-3 text-sm text-forest-deep">
              ✦ That slot was just snapped up! We refreshed the times — please pick another.
            </div>
          )}

          {/* STEP 1 — booking type */}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {bookingTypes.map((bt) => (
                <button
                  key={bt.id}
                  onClick={() => { setTypeId(bt.id); setStep(2); }}
                  className={`card-hover text-left ${typeId === bt.id ? "ring-2 ring-firefly" : ""}`}
                >
                  <Star className="text-firefly" />
                  <h3 className="mt-2 font-serif text-lg text-forest-deep">{bt.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-firefly-deep">{bt.durationMin} minutes</p>
                  <p className="mt-3 text-sm text-ink-soft">{bt.description}</p>
                  {bt.showFee !== false && <p className="mt-4 border-t border-firefly/15 pt-3 text-xs text-ink-faint">{bt.feeLabel}</p>}
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 — date + slot */}
          {step === 2 && bookingType && (
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-serif text-xl text-forest-deep">Pick a date</h3>
                <p className="mt-1 text-sm text-ink-faint">
                  Mon–Fri · min. {settings.minNoticeHours}h notice · up to {settings.maxAdvanceDays} days ahead
                </p>
                <DatePicker
                  settings={settings}
                  selected={date}
                  bookings={bookings}
                  events={events}
                  duration={duration}
                  onSelect={(d) => { setDate(d); setSlot(null); setRaceError(false); }}
                />
              </div>
              <div>
                <h3 className="font-serif text-xl text-forest-deep">
                  {date ? "Open times" : "Choose a date first"}
                </h3>
                <p className="mt-1 text-sm text-ink-faint">
                  {date ? formatDate(date.toISOString()) : "Times appear here"} · Asia/Manila
                </p>
                {date && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.length === 0 && (
                      <p className="col-span-full rounded-xl border border-dashed border-firefly/30 p-6 text-center text-sm text-ink-faint">
                        No open slots this day — Maia's fully booked. Try another date.
                      </p>
                    )}
                    {slots.map((s) => (
                      <button
                        key={s.start}
                        onClick={() => setSlot(s)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          slot?.start === s.start
                            ? "border-forest bg-forest text-parchment"
                            : "border-firefly/30 bg-white/60 text-forest hover:border-firefly hover:shadow-glow-sm"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="lg:col-span-2 flex justify-between">
                <button onClick={() => setStep(1)} className="btn-ghost">← Back</button>
                <button
                  disabled={!slot}
                  onClick={() => setStep(3)}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — details */}
          {step === 3 && bookingType && slot && (
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3 card space-y-4">
                <h3 className="font-serif text-xl text-forest-deep">Your details</h3>
                <Field label="Full name" required value={details.name}
                  onChange={(v) => setDetails((d) => ({ ...d, name: v }))} placeholder="Your name" />
                <Field label="Email" required type="email" value={details.email}
                  onChange={(v) => setDetails((d) => ({ ...d, email: v }))} placeholder="you@email.com" />
                <Field label="Phone (optional)" value={details.phone}
                  onChange={(v) => setDetails((d) => ({ ...d, phone: v }))} placeholder="+63 …" />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    What would you like to cover?
                  </label>
                  <textarea rows={3} value={details.agenda}
                    onChange={(e) => setDetails((d) => ({ ...d, agenda: e.target.value }))}
                    placeholder="A sentence or two is perfect."
                    className="w-full rounded-xl border border-firefly/25 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-firefly focus:ring-2 focus:ring-firefly/30" />
                </div>
                <label className="flex items-start gap-3 rounded-xl bg-parchment-warm/50 p-3 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={details.agreedToUpdates}
                    onChange={(e) => setDetails((d) => ({ ...d, agreedToUpdates: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded border-firefly/40 text-forest focus:ring-firefly"
                  />
                  <span>
                    Keep me posted with occasional Faelight tips, classes and offers.
                    <span className="mt-0.5 block text-xs text-ink-faint">
                      We'll add you to the Faelight list so you're the first to hear when
                      something useful launches. Unsubscribe anytime.
                    </span>
                  </span>
                </label>
              </div>
              <div className="lg:col-span-2">
                <SummaryCard bookingType={bookingType} slot={slot} confLabel={confName(settings)} />
                <div className="mt-4 flex justify-between">
                  <button onClick={() => setStep(2)} className="btn-ghost">← Back</button>
                  <button
                    disabled={!details.name || !details.email}
                    onClick={() => setStep(4)}
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Review →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — confirm */}
          {step === 4 && bookingType && slot && (
            <div className="mx-auto max-w-xl">
              <SummaryCard bookingType={bookingType} slot={slot} full details={details} confLabel={confName(settings)} />
              <div className="mt-4 rounded-xl border border-firefly/20 bg-parchment-warm/60 p-4 text-sm text-ink-soft">
                {bookingType.showFee !== false && <p className="font-semibold text-forest-deep">{bookingType.feeLabel}</p>}
                <p className="mt-1">{settings.paymentInstructions}</p>
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(3)} className="btn-ghost">← Back</button>
                <button onClick={confirm} className="btn-gold">
                  <Star className="text-forest-deep" /> Confirm booking
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ---------- sub-components ----------
function Stepper({ step }: { step: Step }) {
  const labels = ["Type", "Date & time", "Details", "Confirm"];
  return (
    <div className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
      {labels.map((l, i) => {
        const n = (i + 1) as Step;
        const active = step === n;
        const done = step > n;
        return (
          <div key={l} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold transition ${
                done ? "bg-forest text-parchment" : active ? "bg-firefly text-forest-deep shadow-glow-sm" : "bg-firefly/15 text-ink-faint"
              }`}>
                {done ? "✓" : n}
              </span>
              <span className={`hidden text-sm font-medium sm:block ${active || done ? "text-forest" : "text-ink-faint"}`}>{l}</span>
            </div>
            {i < labels.length - 1 && <span className="h-px w-4 bg-firefly/30 sm:w-8" />}
          </div>
        );
      })}
    </div>
  );
}

type DayState = "available" | "full" | "blocked" | "off" | "past" | "beyond";

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

// Full-month calendar. Each day's state reflects the live availability engine
// (working days, admin-blocked dates, existing bookings + calendar holds).
// When a real calendar is linked, its busy blocks flow through the same path,
// so unavailable days are shown greyed and cannot be selected.
function DatePicker({
  settings, selected, onSelect, bookings, events, duration,
}: {
  settings: Settings;
  selected: Date | null;
  onSelect: (d: Date) => void;
  bookings: Booking[];
  events: CalendarEvent[];
  duration: number;
}) {
  const today = startOfDay(new Date());
  const maxDate = useMemo(() => {
    const m = new Date(today);
    m.setDate(m.getDate() + settings.maxAdvanceDays);
    return startOfDay(m);
  }, [settings.maxAdvanceDays]); // eslint-disable-line react-hooks/exhaustive-deps

  // Which month is on screen — start on the selected date's month, else this month.
  const [view, setView] = useState<Date>(startOfDay(selected ?? today));
  const viewY = view.getFullYear();
  const viewM = view.getMonth();

  const firstOfMonth = new Date(viewY, viewM, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();

  // Build 6-week grid (leading blanks + days)
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewY, viewM, d));
  while (cells.length % 7 !== 0) cells.push(null);

  function dayState(d: Date): DayState {
    const day = startOfDay(d);
    if (day < today) return "past";
    if (day > maxDate) return "beyond";
    if (!isWorkingDay(d, settings)) return "off";
    if (!withinBookingWindow(d, settings)) return "beyond";
    if (settings.blockedDates.includes(ymd(d))) return "blocked";
    const open = getAvailableSlots(d, duration, settings, bookings, events);
    return open.length > 0 ? "available" : "full";
  }

  const prevDisabled = viewY === today.getFullYear() && viewM === today.getMonth();
  const nextDisabled = viewY === maxDate.getFullYear() && viewM === maxDate.getMonth();
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mt-4 rounded-2xl border border-firefly/20 bg-white/60 p-4">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          disabled={prevDisabled}
          onClick={() => setView(new Date(viewY, viewM - 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-firefly/25 text-forest transition hover:border-firefly disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="font-serif text-lg text-forest-deep">
          {firstOfMonth.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          disabled={nextDisabled}
          onClick={() => setView(new Date(viewY, viewM + 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-firefly/25 text-forest transition hover:border-firefly disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{w}</span>
        ))}
      </div>

      {/* Day cells */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`b${i}`} />;
          const st = dayState(d);
          const selectable = st === "available";
          const isSel = selected && d.toDateString() === selected.toDateString();
          const isToday = d.toDateString() === today.toDateString();
          const base = "relative grid aspect-square place-items-center rounded-lg text-sm transition";
          let cls: string;
          if (isSel) {
            cls = "bg-forest text-parchment font-semibold shadow-glow-sm";
          } else if (selectable) {
            cls = "bg-white text-forest-deep hover:border-firefly hover:shadow-glow-sm border border-firefly/25 cursor-pointer";
          } else if (st === "full" || st === "blocked") {
            cls = "text-ink-faint line-through decoration-rose-300/70 cursor-not-allowed";
          } else {
            cls = "text-ink-faint/40 cursor-not-allowed";
          }
          const title =
            st === "full" ? "Fully booked" :
            st === "blocked" ? "Unavailable" :
            st === "off" ? "Closed (weekend)" :
            st === "beyond" ? "Too far ahead" :
            st === "past" ? "Past date" : "Available";
          return (
            <button
              key={d.toISOString()}
              type="button"
              title={title}
              disabled={!selectable}
              onClick={() => selectable && onSelect(d)}
              className={`${base} ${cls}`}
            >
              {d.getDate()}
              {isToday && !isSel && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-firefly" />}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-firefly/15 pt-3 text-[11px] text-ink-faint">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-firefly/40 bg-white" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-forest" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="text-rose-400 line-through">15</span> Fully booked</span>
        <span className="flex items-center gap-1.5"><span className="opacity-40">15</span> Closed / out of range</span>
      </div>
    </div>
  );
}

function SummaryCard({
  bookingType, slot, full = false, details, confLabel = "Video call",
}: {
  bookingType: BookingType;
  slot: Slot;
  full?: boolean;
  details?: { name: string; email: string; phone: string; agenda: string };
  confLabel?: string;
}) {
  return (
    <div className="card bg-enchanted text-parchment">
      <p className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-bright">Your booking</p>
      <h3 className="mt-2 font-serif text-xl">{bookingType.name}</h3>
      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Date" value={formatDate(slot.start)} />
        <Row label="Time" value={`${formatTime(slot.start)} – ${formatTime(slot.end)}`} />
        <Row label="Duration" value={`${bookingType.durationMin} minutes`} />
        <Row label="Where" value={`${confLabel} (link on confirmation)`} />
        {full && details && (
          <>
            <Row label="Name" value={details.name} />
            <Row label="Email" value={details.email} />
            {details.phone && <Row label="Phone" value={details.phone} />}
          </>
        )}
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-parchment/10 pb-2 last:border-0">
      <dt className="text-parchment/60">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}{required && <span className="text-firefly-deep">*</span>}
      </label>
      <input type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-firefly/25 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-firefly focus:ring-2 focus:ring-firefly/30" />
    </div>
  );
}

function ProofUpload({ booking }: { booking: Booking }) {
  const [proof, setProof] = useState<string | undefined>(booking.proofUrl);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) { alert("Please use an image under 1MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const d = String(reader.result);
      updateBooking(booking.id, { paymentStatus: "submitted", proofUrl: d, proofSubmittedAt: new Date().toISOString() });
      setProof(d);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-5 rounded-xl border border-firefly/20 bg-white/60 p-4 text-left">
      {proof ? (
        <div className="text-center">
          <p className="font-semibold text-emerald-700">✓ Proof of payment received</p>
          <p className="mt-1 text-xs text-ink-soft">Maia will confirm your payment shortly — you'll get a note once it's verified.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proof} alt="Proof of payment" className="mx-auto mt-3 max-h-40 rounded-lg border border-firefly/20" />
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-forest-deep">Already paid? Upload your proof of payment</p>
          <p className="mt-1 text-xs text-ink-soft">Attach a screenshot of your GCash / bank receipt — Maia will confirm it before your session.</p>
          <label className="mt-3 inline-block cursor-pointer rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-parchment hover:bg-forest-deep">
            ⬆ Upload screenshot
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
        </>
      )}
    </div>
  );
}

function Confirmation({ booking, settings, subscribed }: { booking: Booking; settings: Settings; subscribed: boolean }) {
  return (
    <section className="section">
      <div className="container-fae max-w-2xl">
        <div className="card text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest text-3xl text-firefly-bright shadow-glow">✦</div>
          <h1 className="mt-5 font-serif text-3xl text-forest-deep">You're booked!</h1>
          <p className="mt-2 text-ink-soft">
            A calendar invite with a {confName(settings)} link is on its way to{" "}
            <span className="font-semibold text-forest">{booking.clientEmail}</span>.
          </p>
          {settings.requirePaymentBeforeSession && (
            <p className="mx-auto mt-3 max-w-md rounded-full bg-firefly/15 px-4 py-2 text-sm font-semibold text-firefly-deep">
              ⏱ Please settle your fee before your session on {formatDate(booking.startsAt)}.
            </p>
          )}
          <div className="mt-6 rounded-2xl border border-firefly/20 bg-parchment-warm/50 p-5 text-left">
            <dl className="space-y-2 text-sm">
              <SumRow label="Session" value={booking.bookingTypeName} />
              <SumRow label="When" value={`${formatDate(booking.startsAt)} · ${formatTime(booking.startsAt)}–${formatTime(booking.endsAt)}`} />
              <SumRow label={`${confName(settings)} link`} value={booking.meetLink} link />
            </dl>
          </div>
          <div className="mt-5">
            <PaymentDetails settings={settings} amountLabel={booking.feeLabel} />
          </div>
          <ProofUpload booking={booking} />
          {subscribed && (
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-firefly-deep">
              <span>✦</span> You're on the Faelight list — we'll email you when there's something worth your time.
            </p>
          )}
          <p className="mt-6 text-xs text-ink-faint">
            <em>Demo note:</em> a real deployment now (1) creates this event on Maia's {calName(settings)}{" "}
            with a {confName(settings)} link and the client as attendee, and (2) emails a confirmation
            to the client + an alert to the team via Resend. Here, the booking was saved to the
            admin dashboard and blocks that slot everywhere.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary">Back to home</Link>
            <Link href="/admin/bookings" className="btn-ghost">See it in the admin →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SumRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-forest-deep">
        {link ? <a href={value} className="text-firefly-deep hover:underline break-all">{value}</a> : value}
      </dd>
    </div>
  );
}

function DegradedBooking() {
  return (
    <section className="section">
      <div className="container-fae max-w-xl">
        <div className="card text-center">
          <Star className="text-2xl text-firefly" />
          <h1 className="mt-3 font-serif text-2xl text-forest-deep">Online booking is briefly unavailable</h1>
          <p className="mt-2 text-ink-soft">
            Maia's calendar connection is being refreshed, so live slots aren't showing right now.
            Send us an inquiry instead and we'll book you in personally.
          </p>
          <Link href="/contact" className="btn-primary mt-6">Send an inquiry</Link>
        </div>
      </div>
    </section>
  );
}
