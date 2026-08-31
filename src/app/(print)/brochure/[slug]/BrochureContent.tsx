"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BRAND, CATEGORIES, CONTACT, CategorySlug, servicesByCategory,
  MENTORING_BUILDS, LEADERSHIP_THEMES, SYSTEMS_FIXES, SYSTEMS_CORE, EXPERIENCES_CREATE,
} from "@/lib/content";
import { effectiveServicesByCategory, onStoreChange, EffectiveService } from "@/lib/store";
import { QRCode } from "@/components/QRCode";
import { Star } from "@/components/Motifs";

const LISTS: Record<CategorySlug, { title: string; items: string[] }[]> = {
  mentoring: [
    { title: "What learners build", items: MENTORING_BUILDS },
    { title: "Leadership & EVA themes", items: LEADERSHIP_THEMES },
  ],
  systems: [
    { title: "What we fix", items: SYSTEMS_FIXES },
    { title: "Core services", items: SYSTEMS_CORE },
  ],
  experiences: [{ title: "What we create", items: EXPERIENCES_CREATE }],
};

const SUB_LOGO: Record<string, string> = {
  mentoring: "/brand/mentoring-circle-light.png",
  systems: "/brand/systems-light.png",
  experiences: "/brand/experiences-light.png",
};

export function BrochureContent({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
  }, []);

  const isAll = slug === "all";
  const cats = isAll ? CATEGORIES : CATEGORIES.filter((c) => c.slug === slug);

  // Pull services live from the admin store so edits (price, description,
  // best-for, show/hide, archive, add) flow straight into the brochure/PDF.
  // Until mounted we render the seed content so SSR and first paint match.
  const [live, setLive] = useState<Record<string, EffectiveService[]> | null>(null);
  useEffect(() => {
    const sync = () => {
      const m: Record<string, EffectiveService[]> = {};
      cats.forEach((c) => { m[c.slug] = effectiveServicesByCategory(c.slug); });
      setLive(m);
    };
    sync();
    return onStoreChange(sync);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const servicesFor = (s: CategorySlug): EffectiveService[] =>
    live?.[s] ?? servicesByCategory(s).map((x) => ({ ...x, priceShown: true }));

  const bookUrl = `${origin || "https://faelight.ph"}/book`;

  if (cats.length === 0) {
    return (
      <div className="container-fae py-20 text-center">
        <p className="text-ink-soft">Brochure not found.</p>
        <Link href="/brochures" className="btn-primary mt-4">Back to brochures</Link>
      </div>
    );
  }

  const title = isAll ? "Services & Pricing" : cats[0].name;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="no-print mb-6 flex items-center justify-between rounded-xl border border-firefly/25 bg-parchment-card p-3 shadow-card">
        <Link href="/brochures" className="text-sm font-medium text-forest hover:underline">← All brochures</Link>
        <button onClick={() => window.print()} className="btn-primary !px-4 !py-2 text-sm">⬇ Print / Save as PDF</button>
      </div>

      {/* COVER */}
      <section className="print-page relative overflow-hidden rounded-2xl bg-enchanted p-10 text-center text-parchment print:rounded-none">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-firefly/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-twilight-light/25 blur-3xl" />
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={isAll ? "/brand/logo-full-light.png" : SUB_LOGO[slug] ?? "/brand/logo-full-light.png"}
            alt={`Faelight ${title}`}
            className="mx-auto h-44 w-auto drop-shadow-[0_8px_30px_rgba(230,183,82,0.3)]"
          />
          <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-firefly">
            <span className="h-px w-10 bg-firefly/40" />
            <span>✦</span>
            <span className="h-px w-10 bg-firefly/40" />
          </div>
          <h1 className="mt-4 font-serif text-2xl leading-tight">
            {isAll ? "Services & Pricing" : `${cats[0].name} — Services & Pricing`}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-parchment/75">{BRAND.tagline}</p>
          <p className="mt-6 text-xs italic text-parchment/55">{BRAND.ethos}</p>
        </div>
      </section>

      {/* BODY per category */}
      {cats.map((cat) => (
        <section key={cat.slug} className="print-page mt-8">
          <div className="flex items-baseline justify-between border-b border-firefly/30 pb-2">
            <h2 className="font-serif text-2xl text-forest-deep">
              <Star className="mr-1.5 text-base text-firefly" />
              {cat.name}
            </h2>
            <span className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">{cat.audience}</span>
          </div>

          <div className="mt-5 space-y-3">
            {servicesFor(cat.slug).map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4 border-b border-firefly/12 pb-2.5">
                <div>
                  <p className="font-semibold text-forest-deep">{s.name}</p>
                  <p className="text-xs text-ink-soft">{s.description}</p>
                  <p className="mt-0.5 text-[11px] text-ink-faint">
                    <span className="font-semibold uppercase tracking-wide">Best for:</span> {s.bestFor}
                  </p>
                </div>
                {s.priceShown && (
                  <span className="whitespace-nowrap text-sm font-semibold text-firefly-deep">{s.priceLabel}</span>
                )}
              </div>
            ))}
          </div>

          {LISTS[cat.slug] && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {LISTS[cat.slug].map((l) => (
                <div key={l.title}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-forest">{l.title}</h3>
                  <ul className="mt-2 space-y-1">
                    {l.items.map((it) => (
                      <li key={it} className="flex gap-2 text-xs text-ink-soft"><span className="text-firefly">✦</span>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* CONTACT + QR */}
      <section className="mt-8 rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card print:shadow-none">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-serif text-xl text-forest-deep">Let's build the next right step.</p>
            <p className="mt-2 text-sm text-ink-soft">{CONTACT.name}</p>
            <p className="text-sm text-firefly-deep">{CONTACT.email}</p>
            <p className="mt-3 text-xs italic text-ink-faint">{BRAND.pricingDisclaimer}</p>
          </div>
          <div className="text-center">
            <div className="rounded-xl border border-firefly/25 bg-white p-2">
              <QRCode text={bookUrl} size={128} />
            </div>
            <p className="mt-2 text-xs font-semibold text-forest">Scan to book</p>
            <p className="text-[10px] text-ink-faint break-all">{bookUrl}</p>
          </div>
        </div>
      </section>

      <p className="no-print mt-6 text-center text-xs text-ink-faint">
        Tip: choose “Save as PDF” as the destination in the print dialog.
      </p>
    </div>
  );
}
