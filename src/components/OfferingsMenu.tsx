"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CategorySlug } from "@/lib/content";
import { getServiceOverrides, onStoreChange, visibleServicesByCategory, ServiceOverride } from "@/lib/store";
import { Star } from "./Motifs";

// "What we offer" menu. Prices are HIDDEN by default — an admin turns a
// price on (and can set its label) from /admin/services. Cards highlight
// on hover.
export function OfferingsMenu({ slug }: { slug: CategorySlug }) {
  const [ov, setOv] = useState<Record<string, ServiceOverride>>({});

  useEffect(() => {
    const sync = () => setOv(getServiceOverrides());
    sync();
    return onStoreChange(sync);
  }, []);

  const services = visibleServicesByCategory(slug);

  return (
    <div className="mt-12 grid gap-5 md:grid-cols-2">
      {services.map((s) => {
        const o = ov[s.id] ?? {};
        // Prices show by default; hidden only when explicitly turned off in admin.
        const name = o.name?.trim() ? o.name.trim() : s.name;
        const price = o.showPrice === false ? null : (o.priceLabel ?? s.priceLabel);
        const description = o.description ?? s.description;
        const bestFor = o.bestFor ?? s.bestFor;

        return (
          <div key={s.id} className="card-hover flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-serif text-lg text-forest-deep">
                <Star className="mr-1.5 text-sm text-firefly" />
                {name}
              </h3>
              {price && (
                <span className="whitespace-nowrap rounded-full bg-forest/8 px-3 py-1 text-sm font-semibold text-forest">
                  {price}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-ink-soft">{description}</p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-firefly/15 pt-3">
              <p className="text-xs text-ink-faint">
                <span className="font-semibold uppercase tracking-wide">Best for:</span> {bestFor}
              </p>
              {s.isBookable && (
                <Link href="/book" className="shrink-0 text-xs font-semibold text-firefly-deep hover:underline">
                  Book →
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
