"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBookings, updateBooking, getSettings, saveSettings, onStoreChange, Booking, PaymentStatus, Settings } from "@/lib/store";
import { BOOKING_TYPES } from "@/lib/content";
import { formatDate, relativeDay, peso } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { AdminHeader, Panel, StatTile, PaymentBadge } from "@/components/admin/ui";

function parseFee(label?: string): number {
  if (!label) return 0;
  const m = label.replace(/,/g, "").match(/₱\s?(\d+)/);
  return m ? Number(m[1]) : 0;
}
function feeLabel(b: Booking): string {
  return b.feeLabel ?? BOOKING_TYPES.find((t) => t.id === b.bookingTypeId)?.feeLabel ?? "—";
}
function payStatus(b: Booking): PaymentStatus {
  return b.paymentStatus ?? "unpaid";
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");
  const [viewer, setViewer] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setBookings(getBookings());
    sync();
    return onStoreChange(sync);
  }, []);

  // Only bookings that carry a fee, excluding cancelled
  const billable = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled" && parseFee(feeLabel(b)) > 0),
    [bookings]
  );

  const collected = billable.filter((b) => payStatus(b) === "paid").reduce((s, b) => s + (b.amountPaid ?? parseFee(feeLabel(b))), 0);
  const unpaidList = billable.filter((b) => payStatus(b) === "unpaid");
  const outstanding = unpaidList.reduce((s, b) => s + parseFee(feeLabel(b)), 0);
  const now = new Date();
  const thisMonth = billable
    .filter((b) => payStatus(b) === "paid" && b.paidAt && new Date(b.paidAt).getMonth() === now.getMonth() && new Date(b.paidAt).getFullYear() === now.getFullYear())
    .reduce((s, b) => s + (b.amountPaid ?? parseFee(feeLabel(b))), 0);

  const shown = useMemo(
    () => (filter === "all" ? billable : billable.filter((b) => payStatus(b) === filter)).sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt)),
    [billable, filter]
  );

  function markPaid(b: Booking) {
    const method = prompt("Payment method (GCash, Bank transfer, Cash):", b.paymentMethod ?? "GCash");
    if (method === null) return;
    const amountStr = prompt("Amount received (₱):", String(b.amountPaid ?? (parseFee(feeLabel(b)) || "")));
    if (amountStr === null) return;
    updateBooking(b.id, {
      paymentStatus: "paid",
      paymentMethod: method.trim() || "—",
      amountPaid: Number(amountStr.replace(/[^\d.]/g, "")) || 0,
      paidAt: new Date().toISOString(),
      verifiedBy: user?.name,
    });
  }
  // Confirm a proof-of-payment submission (Maia's verification gate).
  function confirmPayment(b: Booking) {
    if (!confirm(`Confirm ${b.clientName}'s payment as verified and mark it paid?`)) return;
    updateBooking(b.id, {
      paymentStatus: "paid",
      paymentMethod: b.paymentMethod ?? "Verified from proof",
      amountPaid: b.amountPaid ?? parseFee(feeLabel(b)),
      paidAt: new Date().toISOString(),
      verifiedBy: user?.name,
    });
  }
  function rejectProof(b: Booking) {
    if (!confirm(`Reject this proof and set ${b.clientName} back to unpaid?`)) return;
    updateBooking(b.id, { paymentStatus: "unpaid", proofUrl: undefined, proofSubmittedAt: undefined });
  }
  function setStatus(b: Booking, status: PaymentStatus) {
    if (status === "paid") { markPaid(b); return; }
    updateBooking(b.id, { paymentStatus: status, ...(status === "unpaid" ? { amountPaid: undefined, paidAt: undefined, paymentMethod: undefined } : {}) });
  }

  const counts = {
    unpaid: billable.filter((b) => payStatus(b) === "unpaid").length,
    submitted: billable.filter((b) => payStatus(b) === "submitted").length,
    paid: billable.filter((b) => payStatus(b) === "paid").length,
    waived: billable.filter((b) => payStatus(b) === "waived").length,
  };

  return (
    <>
      <AdminHeader title="Payments" subtitle="Collect fees before sessions and track what's settled." />

      <PaymentDetailsEditor />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Collected" value={peso(collected)} hint={`${counts.paid} paid`} accent="forest" />
        <StatTile label="Awaiting verification" value={counts.submitted} hint="proof to review" accent="firefly" />
        <StatTile label="Outstanding" value={peso(outstanding)} hint={`${counts.unpaid} unpaid`} accent="twilight" />
        <StatTile label="This month" value={peso(thisMonth)} hint="collected" accent="forest" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All · {billable.length}</Chip>
        <Chip active={filter === "submitted"} onClick={() => setFilter("submitted")}>Awaiting · {counts.submitted}</Chip>
        <Chip active={filter === "unpaid"} onClick={() => setFilter("unpaid")}>Unpaid · {counts.unpaid}</Chip>
        <Chip active={filter === "paid"} onClick={() => setFilter("paid")}>Paid · {counts.paid}</Chip>
        <Chip active={filter === "waived"} onClick={() => setFilter("waived")}>Waived · {counts.waived}</Chip>
      </div>

      <Panel className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-firefly/20 text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((b) => {
                const ps = payStatus(b);
                return (
                  <tr key={b.id} className="border-b border-firefly/10 hover:bg-firefly/5">
                    <td className="px-4 py-3">
                      <p className="font-medium text-forest-deep">{b.clientName}</p>
                      <p className="text-xs text-ink-faint">{b.clientEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{b.bookingTypeName}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(b.startsAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-forest-deep">{feeLabel(b).split("—")[0].trim()}</p>
                      {ps === "paid" && (
                        <p className="text-xs text-emerald-700">
                          {b.amountPaid ? peso(b.amountPaid) : ""}{b.paymentMethod ? ` · ${b.paymentMethod}` : ""}{b.paidAt ? ` · ${relativeDay(b.paidAt)}` : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PaymentBadge status={ps} />
                        {b.proofUrl && (
                          <button onClick={() => setViewer(b.proofUrl!)} title="View proof" className="grid h-8 w-8 place-items-center overflow-hidden rounded border border-firefly/30 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={b.proofUrl} alt="proof" className="h-full w-full object-cover" />
                          </button>
                        )}
                      </div>
                      {ps === "paid" && b.verifiedBy && <p className="mt-1 text-[10px] text-ink-faint">verified by {b.verifiedBy}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {ps === "submitted" && (
                          <>
                            <button onClick={() => setViewer(b.proofUrl!)} className="rounded-lg border border-firefly/30 px-3 py-1.5 text-xs font-semibold text-forest hover:border-firefly">🔍 Proof</button>
                            <button onClick={() => confirmPayment(b)} className="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">✓ Confirm</button>
                            <button onClick={() => rejectProof(b)} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">Reject</button>
                          </>
                        )}
                        {(ps === "unpaid" || ps === "waived") && (
                          <button onClick={() => markPaid(b)} className="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Mark paid</button>
                        )}
                        {ps === "paid" && (
                          <button onClick={() => setStatus(b, "unpaid")} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs text-ink-soft hover:border-firefly">Undo</button>
                        )}
                        {ps !== "waived" && ps !== "paid" && (
                          <button onClick={() => setStatus(b, "waived")} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs text-ink-soft hover:border-firefly">Waive</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-faint">No {filter === "all" ? "" : filter} payments.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Clients settle before their session and upload proof of payment; it's marked paid only after you
        confirm it here. No online payment is processed.
      </p>

      {viewer && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6" onClick={() => setViewer(null)}>
          <div className="max-h-[88vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-faint">Proof of payment</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewer} alt="Proof of payment" className="mx-auto max-h-[72vh] w-auto rounded-lg" />
            <button onClick={() => setViewer(null)} className="btn-primary mt-3 w-full !py-2 text-sm">Close</button>
          </div>
        </div>
      )}
    </>
  );
}

function PaymentDetailsEditor() {
  const [s, setS] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setS(getSettings());
    sync();
    return onStoreChange(sync);
  }, []);

  if (!s) return null;
  const update = (patch: Partial<Settings>) => { saveSettings(patch); setSaved(true); setTimeout(() => setSaved(false), 1200); };
  const input = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

  function onQr(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) { alert("Please use an image under 500KB."); return; }
    const reader = new FileReader();
    reader.onload = () => update({ payGcashQr: String(reader.result) });
    reader.readAsDataURL(file);
  }

  return (
    <Panel className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-forest-deep">Payment Details Clients See</h2>
          <p className="text-xs text-ink-faint">Shown on the booking confirmation so clients can settle before their session.</p>
        </div>
        {saved && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Saved ✓</span>}
      </div>

      <label className="mt-4 flex items-start gap-3 rounded-xl border border-firefly/20 bg-parchment-warm/40 p-3 text-sm text-ink-soft">
        <input type="checkbox" checked={s.requirePaymentBeforeSession} onChange={(e) => update({ requirePaymentBeforeSession: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-firefly/40 text-forest focus:ring-firefly" />
        <span><span className="font-semibold text-forest-deep">Require payment before the session.</span> Clients are asked to settle the fee ahead of their booking.</span>
      </label>

      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        {/* QR */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">GCash / e-wallet QR</p>
          <div className="flex items-center gap-3">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl border border-firefly/20 bg-white">
              {s.payGcashQr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.payGcashQr} alt="QR" className="max-h-full max-w-full object-contain p-1" />
              ) : (
                <span className="text-[10px] text-ink-faint">No QR</span>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block cursor-pointer rounded-lg border border-firefly/30 px-3 py-1.5 text-center text-xs font-semibold text-forest hover:border-firefly">
                Upload QR
                <input type="file" accept="image/*" className="hidden" onChange={onQr} />
              </label>
              {s.payGcashQr && <button onClick={() => update({ payGcashQr: "" })} className="block w-full rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">Remove</button>}
            </div>
          </div>
        </div>

        {/* GCash */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">GCash</p>
          <input className={input} defaultValue={s.payGcashName} placeholder="Account name" onBlur={(e) => update({ payGcashName: e.target.value })} />
          <input className={input} defaultValue={s.payGcashNumber} placeholder="Mobile number" onBlur={(e) => update({ payGcashNumber: e.target.value })} />
        </div>

        {/* Bank */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Bank transfer</p>
          <input className={input} defaultValue={s.payBankName} placeholder="Bank (e.g. BPI)" onBlur={(e) => update({ payBankName: e.target.value })} />
          <input className={input} defaultValue={s.payBankAccountName} placeholder="Account name" onBlur={(e) => update({ payBankAccountName: e.target.value })} />
          <input className={input} defaultValue={s.payBankAccountNumber} placeholder="Account number" onBlur={(e) => update({ payBankAccountNumber: e.target.value })} />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Payment instructions</p>
        <textarea className={input} rows={2} defaultValue={s.paymentInstructions} onBlur={(e) => update({ paymentInstructions: e.target.value })} />
      </div>
    </Panel>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-forest bg-forest text-parchment" : "border-firefly/25 bg-parchment-card text-ink-soft hover:border-firefly"}`}>
      {children}
    </button>
  );
}
