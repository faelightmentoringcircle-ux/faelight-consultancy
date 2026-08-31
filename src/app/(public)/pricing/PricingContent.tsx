"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BRAND,
  classOfferings,
  serviceOfferings,
  categoryName,
  SMART_VA_URL,
  SMART_VA_SERVICE_ID,
} from "@/lib/content";
import {
  effectiveClassOfferings,
  effectiveServiceOfferings,
  onStoreChange,
  EffectiveService,
} from "@/lib/store";
import { Eyebrow, Fireflies, Glow, Star } from "@/components/Motifs";
import { ClientFit, CtaBand } from "@/components/Sections";

function OfferingCard({ s }: { s: EffectiveService }) {
  return (
    <div className="card-hover flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-eyebrow text-firefly-deep">
            {categoryName(s.categorySlug)}
          </span>
          <h3 className="mt-1 font-serif text-lg leading-tight text-forest-deep">{s.name}</h3>
        </div>
        {s.priceShown && (
          <span className="whitespace-nowrap rounded-full bg-forest/8 px-3 py-1 text-sm font-semibold text-forest">
            {s.priceLabel}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-soft">{s.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-firefly/15 pt-3">
        <p className="text-xs text-ink-faint">
          <span className="font-semibold uppercase tracking-wide">Best for:</span> {s.bestFor}
        </p>
        {s.id === SMART_VA_SERVICE_ID ? (
          <a
            href={SMART_VA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-semibold text-firefly-deep hover:underline"
          >
            Open SMART VA ↗
          </a>
        ) : (
          s.isBookable && (
            <Link href="/book" className="shrink-0 text-xs font-semibold text-firefly-deep hover:underline">
              Book →
            </Link>
          )
        )}
      </div>
    </div>
  );
}

// Seed fallbacks keep SSR/first paint identical to the server render; the
// effect then swaps in the live, admin-edited list from the store.
const seedClasses = (): EffectiveService[] => classOfferings().map((s) => ({ ...s, priceShown: true }));
const seedServices = (): EffectiveService[] => serviceOfferings().map((s) => ({ ...s, priceShown: true }));

export function PricingContent() {
  const [classes, setClasses] = useState<EffectiveService[]>(seedClasses);
  const [services, setServices] = useState<EffectiveService[]>(seedServices);

  useEffect(() => {
    const sync = () => {
      setClasses(effectiveClassOfferings());
      setServices(effectiveServiceOfferings());
    };
    sync();
    return onStoreChange(sync);
  }, []);

  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={14} />
        <Glow className="-left-16 top-4" size={480} />
        <div className="container-fae relative z-10 py-16 text-center sm:py-20">
          <Eyebrow light>Classes & services menu</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            Classes to learn. Services to build.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-parchment/75">
            Scheduled classes and programs for people who want to grow — and
            consulting, systems and experiences for businesses that need things
            done. Prices are starting points; every engagement is shaped around you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="#classes" className="btn-gold">✦ Browse Classes</Link>
            <Link href="#services" className="btn-ghost-light">Browse Services</Link>
          </div>
        </div>
      </section>

      {/* ===================== CLASSES ============================ */}
      <section id="classes" className="section scroll-mt-20">
        <div className="container-fae">
          <div className="flex flex-col gap-3 border-b border-firefly/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Classes & programs</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
                Learn with a cohort.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-soft">
                Scheduled group classes, pathways and trainings — from a ₱2,000
                Foundations class to full custom programs.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-firefly/15 px-4 py-1.5 text-xs font-semibold text-firefly-deep">
              {classes.length} classes
            </span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((s) => (
              <OfferingCard key={s.id} s={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SERVICES =========================== */}
      <section id="services" className="section scroll-mt-20 bg-parchment-warm/60">
        <div className="container-fae">
          <div className="flex flex-col gap-3 border-b border-firefly/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Consulting services</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
                Done with you, or done for you.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-soft">
                1:1 sessions, systems builds, SOPs, retainers and experiences —
                priced by scope, starting from the figures shown.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-forest/10 px-4 py-1.5 text-xs font-semibold text-forest">
              {services.length} services
            </span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <OfferingCard key={s.id} s={s} />
            ))}
          </div>

          <p className="mt-10 text-center text-sm italic text-ink-faint">
            <Star className="mr-1 text-firefly" />
            {BRAND.pricingDisclaimer}
          </p>
        </div>
      </section>

      <ClientFit />
      <CtaBand
        heading="Not sure whether you need a class or a service?"
        sub="Book a discovery call — we'll help you find the next right step, no pressure."
      />
    </>
  );
}
