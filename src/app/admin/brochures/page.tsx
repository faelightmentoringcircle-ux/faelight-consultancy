"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/content";
import { effectiveServicesByCategory, onStoreChange } from "@/lib/store";
import { AdminHeader, Panel } from "@/components/admin/ui";

export default function AdminBrochuresPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const sync = () => {
      const c: Record<string, number> = {};
      CATEGORIES.forEach((cat) => { c[cat.slug] = effectiveServicesByCategory(cat.slug).length; });
      setCounts(c);
    };
    sync();
    return onStoreChange(sync);
  }, []);

  return (
    <>
      <AdminHeader
        title="Brochures"
        subtitle="Open or print your Faelight brochures. Prices & services come from Services & Pricing; edits there flow into every brochure automatically."
      />

      <div className="mb-5 rounded-xl border border-firefly/25 bg-firefly/8 p-4 text-sm text-ink-soft">
        <span className="font-semibold text-forest-deep">✦ How editing works:</span> the services, prices, descriptions and best-for lines
        are pulled live from <Link href="/admin/services" className="font-semibold text-forest hover:underline">Services &amp; Pricing</Link>.
        Change them there and every brochure (and its PDF) updates. The cover tagline and the sub-brand bullet lists are part of the site copy.
      </div>

      {/* Complete guide */}
      <Panel className="mb-5 flex flex-col items-start justify-between gap-4 bg-enchanted text-parchment sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-bright">Complete guide</p>
          <h2 className="mt-1 font-serif text-xl">Faelight Services &amp; Pricing</h2>
          <p className="mt-1 text-sm text-parchment/70">All three sub-brands, every service &amp; price, contact details and a scan-to-book QR.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a href="/brochure/all" target="_blank" rel="noreferrer" className="btn-gold !py-2 text-xs">Open / Print ↗</a>
        </div>
      </Panel>

      {/* Per sub-brand */}
      <div className="grid gap-4 md:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Panel key={cat.slug} className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-eyebrow text-firefly-deep">{cat.audience}</span>
            <h3 className="mt-1 font-serif text-lg text-forest-deep">{cat.name}</h3>
            <p className="mt-2 text-xs text-ink-soft">{cat.description}</p>
            <p className="mt-3 text-[11px] text-ink-faint">{counts[cat.slug] ?? 0} services · with pricing &amp; best-for</p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-firefly/15 pt-3">
              <a href={`/brochure/${cat.slug}`} target="_blank" rel="noreferrer" className="btn-primary !px-3 !py-1.5 text-xs">⬇ Open / Print PDF ↗</a>
              <Link href="/admin/services" className="btn-ghost !px-3 !py-1.5 text-xs">Edit services</Link>
            </div>
          </Panel>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Tip: each brochure opens in a new tab and is print-optimised — use your browser&rsquo;s <em>Print → Save as PDF</em> for a clean A4 copy.
      </p>
    </>
  );
}
