"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getBookings, updateBooking, onStoreChange, Booking, BookingStatus, PaymentStatus,
} from "@/lib/store";
import { BOOKING_TYPES } from "@/lib/content";
import { formatDate, formatTime, relativeDay, peso } from "@/lib/format";
import { AdminHeader, Panel, StatTile, BookingBadge, PaymentBadge } from "@/components/admin/ui";

const STATUSES: BookingStatus[] = ["confirmed", "completed", "cancelled", "no-show"];

// Pull the first ₱ amount out of a fee label, e.g. "₱2,500 — payable…" → 2500.
function parseFee(label?: string): number {
  if (!label) return 0;
  const m = label.replace(/,/g, "").match(/₱\s?(\d+)/);
  return m ? Number(m[1]) : 0;
}
function bookingFeeLabel(b: Booking): string {
  return b.feeLabel ?? BOOKING_TYPES.find((t) => t.id === b.bookingTypeId)?.feeLabel ?? "—";
}
function payStatus(b: Booking): PaymentStatus {
  return b.paymentStatus ?? "unpaid";
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [payFilter, setPayFilter] = useState<null | "paid" | "unpaid">(null);

  useEffect(() => {
    const sync = () => setBookings(getBookings());
    sync();
    return onStoreChange(sync);
  }, []);

  const now = new Date();
  const shown = useMemo(() => {
    const sorted = [...bookings];
    let list: Booking[];
    if (tab === "upcoming")
      list = sorted
        .filter((b) => new Date(b.startsAt) >= now && b.status !== "cancelled")
        .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    else if (tab === "past")
      list = sorted
        .filter((b) => new Date(b.startsAt) < now || b.status === "cancelled")
        .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));
    else list = sorted.sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));

    if (payFilter === "paid") list = list.filter((b) => b.status !== "cancelled" && (b.paymentStatus ?? "unpaid") === "paid");
    if (payFilter === "unpaid") list = list.filter((b) => b.status !== "cancelled" && (b.paymentStatus ?? "unpaid") === "unpaid");
    return list;
  }, [bookings, tab, payFilter]);

  // Clicking a summary tile scopes the list below.
  function focusTile(filter: null | "paid" | "unpaid") {
    setTab("all");
    setPayFilter(filter);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Payment summary (exclude cancelled)
  const live = bookings.filter((b) => b.status !== "cancelled");
  const collected = live.filter((b) => payStatus(b) === "paid").reduce((s, b) => s + (b.amountPaid ?? parseFee(bookingFeeLabel(b))), 0);
  const outstanding = live.filter((b) => payStatus(b) === "unpaid");
  const outstandingTotal = outstanding.reduce((s, b) => s + parseFee(bookingFeeLabel(b)), 0);

  function cancel(b: Booking) {
    if (confirm(`Cancel ${b.clientName}'s ${b.bookingTypeName}? In production this also removes the calendar event.`)) {
      updateBooking(b.id, { status: "cancelled" });
    }
  }

  function markPaid(b: Booking) {
    const method = prompt("Payment method (e.g. GCash, Bank transfer, Cash):", b.paymentMethod ?? "GCash");
    if (method === null) return;
    const suggested = String(b.amountPaid ?? (parseFee(bookingFeeLabel(b)) || ""));
    const amountStr = prompt("Amount received (₱):", suggested);
    if (amountStr === null) return;
    updateBooking(b.id, {
      paymentStatus: "paid",
      paymentMethod: method.trim() || "—",
      amountPaid: Number(amountStr.replace(/[^\d.]/g, "")) || 0,
      paidAt: new Date().toISOString(),
    });
  }

  function setPayment(b: Booking, status: PaymentStatus) {
    if (status === "paid") { markPaid(b); return; }
    updateBooking(b.id, { paymentStatus: status, ...(status === "unpaid" ? { amountPaid: undefined, paidAt: undefined, paymentMethod: undefined } : {}) });
  }

  const upcomingCount = live.filter((b) => new Date(b.startsAt) >= now).length;

  return (
    <>
      <AdminHeader title="Bookings" subtitle={`${upcomingCount} upcoming · ${bookings.length} total`} />

      {/* Payments summary — click a tile to filter the list below */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Collected" value={peso(collected)} hint="paid bookings" accent="forest" onClick={() => focusTile("paid")} />
        <StatTile label="Outstanding" value={peso(outstandingTotal)} hint={`${outstanding.length} unpaid`} accent="firefly" onClick={() => focusTile("unpaid")} />
        <StatTile label="Bookings" value={live.length} hint="excluding cancelled" accent="twilight" onClick={() => focusTile(null)} />
      </div>

      {payFilter && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-firefly/30 bg-firefly/10 px-4 py-2 text-sm text-forest-deep">
          <span>Showing <strong>{payFilter}</strong> bookings ({shown.length})</span>
          <button onClick={() => setPayFilter(null)} className="ml-auto rounded-full border border-firefly/30 px-3 py-1 text-xs font-semibold hover:border-firefly">Clear filter ✕</button>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        {(["upcoming", "past", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPayFilter(null); }}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition ${
              tab === t ? "border-forest bg-forest text-parchment" : "border-firefly/25 bg-parchment-card text-ink-soft hover:border-firefly"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.length === 0 && (
          <Panel><p className="py-6 text-center text-ink-faint">No {tab} bookings.</p></Panel>
        )}
        {shown.map((b) => {
          const ps = payStatus(b);
          return (
            <Panel key={b.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-forest/8 text-center">
                    <span className="font-serif text-lg leading-none text-forest">{new Date(b.startsAt).getDate()}</span>
                    <span className="text-[10px] uppercase text-ink-faint">{new Date(b.startsAt).toLocaleDateString("en-PH", { month: "short" })}</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-forest-deep">{b.clientName}</p>
                      <BookingBadge status={b.status} />
                      <PaymentBadge status={ps} />
                      <span className="text-xs font-semibold text-firefly-deep">{relativeDay(b.startsAt)}</span>
                    </div>
                    <p className="text-sm text-ink-soft">{b.bookingTypeName}</p>
                    <p className="text-xs text-ink-faint">
                      {formatDate(b.startsAt)} · {formatTime(b.startsAt)}–{formatTime(b.endsAt)} · {b.clientEmail}
                    </p>
                    {/* Payment line */}
                    <p className="mt-1 text-xs text-ink-faint">
                      <span className="font-semibold uppercase tracking-wide">Fee:</span> {bookingFeeLabel(b)}
                      {ps === "paid" && (
                        <span className="text-emerald-700"> · Paid {b.amountPaid ? peso(b.amountPaid) : ""}{b.paymentMethod ? ` via ${b.paymentMethod}` : ""}{b.paidAt ? ` · ${relativeDay(b.paidAt)}` : ""}</span>
                      )}
                    </p>
                    {b.agenda && <p className="mt-1 text-xs italic text-ink-faint">“{b.agenda}”</p>}
                    <a href={b.meetLink} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-firefly-deep hover:underline">▷ {b.meetLink}</a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {/* Payment control */}
                  {ps !== "paid" ? (
                    <button onClick={() => markPaid(b)} className="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                      Mark paid
                    </button>
                  ) : (
                    <button onClick={() => setPayment(b, "unpaid")} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs text-ink-soft hover:border-firefly">
                      Undo payment
                    </button>
                  )}
                  <select
                    value={ps}
                    onChange={(e) => setPayment(b, e.target.value as PaymentStatus)}
                    className="rounded-lg border border-firefly/25 bg-white/70 px-2 py-1.5 text-xs capitalize outline-none focus:border-firefly"
                    aria-label="Payment status"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="submitted">Proof submitted</option>
                    <option value="paid">Paid</option>
                    <option value="waived">Waived</option>
                  </select>
                  <select
                    value={b.status}
                    onChange={(e) => updateBooking(b.id, { status: e.target.value as BookingStatus })}
                    className="rounded-lg border border-firefly/25 bg-white/70 px-2 py-1.5 text-xs capitalize outline-none focus:border-firefly"
                    aria-label="Booking status"
                  >
                    {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  {b.status !== "cancelled" && (
                    <button onClick={() => cancel(b)} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                      Cancel
                    </button>
                  )}
                  {b.leadId && (
                    <Link href={`/admin/leads/view?id=${b.leadId}`} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs text-ink-soft hover:border-firefly">
                      Lead →
                    </Link>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Book-now-pay-later: record GCash / bank transfer / cash payments here. Payment instructions clients
        see are set in <Link href="/admin/settings" className="text-firefly-deep hover:underline">Settings</Link>.
      </p>
    </>
  );
}
