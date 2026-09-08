"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSettings, onStoreChange, Settings } from "@/lib/store";
import { peso } from "@/lib/format";
import { PaymentDetails } from "@/components/PaymentDetails";
import { Fireflies, FairySwirl, Glow } from "@/components/Motifs";

/**
 * Public "How to pay" page. A shareable link (e.g. from the confirmation
 * email) that shows every payment option — the GCash / Maya / BPI QR codes,
 * account numbers, and the Pay-now link — all read from admin Settings.
 * Optional query params: ?amt=3000 (amount due) and ?for=Foundations%20Class.
 */
function PayInner() {
  const params = useSearchParams();
  const [s, setS] = useState<Settings | null>(null);

  useEffect(() => {
    const sync = () => setS(getSettings());
    sync();
    return onStoreChange(sync);
  }, []);

  const amt = params.get("amt");
  const forWhat = params.get("for");
  const amountLabel = amt && Number(amt) > 0 ? peso(Number(amt)) : undefined;

  if (!s) return <div className="section container-fae text-ink-faint">Loading…</div>;

  return (
    <section className="starfield relative min-h-[70vh] overflow-hidden bg-enchanted text-parchment">
      <Fireflies count={20} />
      <FairySwirl count={3} />
      <Glow className="left-1/2 top-1/4 -translate-x-1/2" size={480} />
      <div className="container-fae relative z-10 py-14 sm:py-20">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-firefly-bright/80">Faelight</p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl">How to pay ✦</h1>
          {forWhat && <p className="mt-2 text-parchment/85">for <strong className="text-parchment">{forWhat}</strong></p>}
          <p className="mt-3 text-sm text-parchment/70">
            Scan a QR, tap <strong>Pay now</strong>, or transfer to any account below — then send your proof of payment
            {s.notifyEmail ? <> to <strong className="text-firefly-bright">{s.notifyEmail}</strong></> : null} and we&rsquo;ll confirm your seat.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-md">
          <PaymentDetails settings={s} amountLabel={amountLabel} />
        </div>

        <div className="mt-8 text-center">
          <Link href="/classes" className="text-sm font-semibold text-firefly-bright hover:underline">← Back to all classes</Link>
        </div>
      </div>
    </section>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<div className="section container-fae text-ink-faint">Loading…</div>}>
      <PayInner />
    </Suspense>
  );
}
