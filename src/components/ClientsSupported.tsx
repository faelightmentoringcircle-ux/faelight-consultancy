"use client";

import { useEffect, useState } from "react";
import { getActiveBrands, onStoreChange, BRAND_GROUPS, Brand } from "@/lib/store";
import { CLIENTS_TAGLINE } from "@/lib/content";
import { Eyebrow, Fireflies, Glow, StarDivider } from "./Motifs";

const GLYPH: Record<string, string> = {
  "Training & Mentorship": "❦",
  "Executive & Admin Support": "✒",
  "Operations & Business Systems": "⚙",
  "Marketing": "✧",
};

export function ClientsSupported() {
  const [brands, setBrands] = useState<Brand[]>([]);
  useEffect(() => {
    const sync = () => setBrands(getActiveBrands());
    sync();
    return onStoreChange(sync);
  }, []);

  // group in the canonical order, keep any extra groups after
  const groupsInUse = [
    ...BRAND_GROUPS.filter((g) => brands.some((b) => b.group === g)),
    ...Array.from(new Set(brands.map((b) => b.group))).filter((g) => !BRAND_GROUPS.includes(g)),
  ];
  if (brands.length === 0) return null;

  return (
    <section className="starfield relative overflow-hidden bg-enchanted py-16 text-parchment sm:py-24">
      <Fireflies count={14} />
      <Glow className="-left-16 top-10" />
      <Glow className="-right-16 bottom-10" color="rgba(90,68,128,0.5)" />
      <div className="container-fae relative z-10">
        <div className="text-center">
          <Eyebrow light>Trusted by</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl text-firefly-bright sm:text-4xl">
            Clients and Brands We Support
          </h2>
          <StarDivider light />
        </div>

        <div className="mt-8 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {groupsInUse.map((group) => {
            const items = brands.filter((b) => b.group === group);
            return (
              <div key={group} className="rounded-2xl border border-firefly/30 bg-gradient-to-b from-parchment to-parchment-warm p-5 shadow-glow">
                <div className="text-center">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-twilight to-forest text-firefly-bright ring-1 ring-firefly/40">
                    {GLYPH[group] ?? "✦"}
                  </span>
                  <h3 className="mt-2 font-serif text-base leading-tight text-forest-deep">{group}</h3>
                  <div className="mx-auto mt-2 h-px w-12 bg-firefly/40" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {items.map((b) =>
                    b.logoUrl ? (
                      <div key={b.id} className="grid aspect-[3/2] place-items-center rounded-lg bg-white p-2" title={b.name}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.logoUrl} alt={b.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div key={b.id} className="grid place-items-center rounded-lg border border-firefly/15 bg-white/60 p-2 text-center text-[11px] font-medium leading-tight text-ink-soft">
                        {b.name}
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs font-semibold uppercase tracking-eyebrow text-firefly-bright/80">
          {CLIENTS_TAGLINE}
        </p>
      </div>
    </section>
  );
}
