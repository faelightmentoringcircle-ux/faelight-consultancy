import Link from "next/link";
import { BRAND, CLIENT_FIT } from "@/lib/content";
import { Eyebrow, Fireflies, Glow, Star, StarDivider } from "./Motifs";

interface BuildData {
  intro: string;
  pillars: { name: string; glyph: string; detail: string }[];
  closer: string;
}

// Four-pillar "What we build" section (reused for individuals & clients).
export function WhatWeBuild({
  data, eyebrow, heading, dark = false,
}: {
  data: BuildData;
  eyebrow: string;
  heading: string;
  dark?: boolean;
}) {
  return (
    <section className={`section ${dark ? "bg-parchment-warm/60" : ""}`}>
      <div className="container-fae">
        <div className="text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">{heading}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-soft">{data.intro}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.pillars.map((p) => (
            <div key={p.name} className="card-hover text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-twilight/10 to-forest/10 text-xl text-firefly">
                {p.glyph}
              </div>
              <h3 className="mt-3 text-xs font-semibold uppercase tracking-eyebrow text-forest-deep">{p.name}</h3>
              <p className="mt-3 text-sm text-ink-soft">{p.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <StarDivider />
          <p className="font-serif text-xl leading-snug text-forest-deep sm:text-2xl">{data.closer}</p>
        </div>
      </div>
    </section>
  );
}


// Reusable dark "enchanted" call-to-action band.
export function CtaBand({
  heading = BRAND.closer,
  sub = "Book a discovery call and let's map the next right step together.",
}: {
  heading?: string;
  sub?: string;
}) {
  return (
    <section className="section">
      <div className="container-fae">
        <div className="starfield relative overflow-hidden rounded-3xl bg-enchanted px-6 py-16 text-center text-parchment sm:px-16">
          <Fireflies count={12} />
          <Glow className="-left-10 top-0" />
          <Glow className="-right-10 bottom-0" color="rgba(90,68,128,0.5)" />
          <div className="relative z-10">
            <Star className="text-2xl text-firefly-bright animate-twinkle" />
            <h2 className="mx-auto mt-4 max-w-2xl font-serif text-2xl leading-tight sm:text-3xl">
              {heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-parchment/75">{sub}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/book" className="btn-gold">Book a Discovery Call</Link>
              <Link href="/contact" className="btn-ghost-light">Send an inquiry</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// "Where clients usually fit" grid (landing + pricing).
export function ClientFit() {
  return (
    <section className="section">
      <div className="container-fae">
        <div className="text-center">
          <Eyebrow>Where clients usually fit</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
            Start where it hurts most.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CLIENT_FIT.map((fit) => {
            const href = fit.slug ? `/${fit.slug}` : "/classes";
            return (
              <Link key={fit.need} href={href} className="card-hover group flex flex-col">
                <Star className="text-firefly transition-transform duration-500 group-hover:rotate-180" />
                <p className="mt-3 font-serif text-lg text-forest-deep">“{fit.need}”</p>
                <p className="mt-auto pt-4 text-sm font-semibold text-firefly-deep">
                  → {fit.answer}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Small labelled list with star bullets.
export function StarList({
  title,
  items,
  light = false,
}: {
  title: string;
  items: string[];
  light?: boolean;
}) {
  return (
    <div>
      <h3 className={`font-serif text-xl ${light ? "text-parchment" : "text-forest-deep"}`}>
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3">
            <span className={`mt-1 text-sm ${light ? "text-firefly-bright" : "text-firefly"}`}>✦</span>
            <span className={`text-sm ${light ? "text-parchment/80" : "text-ink-soft"}`}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function pricingDisclaimer() {
  return BRAND.pricingDisclaimer;
}
