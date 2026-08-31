import Link from "next/link";
import {
  BRAND,
  CategorySlug,
  categoryBySlug,
  CONTACT,
} from "@/lib/content";
import { Eyebrow, Fireflies, Glow, Star, StarDivider } from "./Motifs";
import { StarList, CtaBand } from "./Sections";
import { InquiryForm } from "./InquiryForm";
import { OfferingsMenu } from "./OfferingsMenu";

interface Extra {
  title: string;
  items: string[];
}

// On-dark (all-gold) variants — legible floating on the enchanted hero.
const SUB_LOGO: Record<CategorySlug, string> = {
  mentoring: "/brand/mentoring-circle-light.png",
  systems: "/brand/systems-light.png",
  experiences: "/brand/experiences-light.png",
};

export function SubBrandPage({
  slug,
  lead,
  lists,
  bestForLine,
  demoHref,
}: {
  slug: CategorySlug;
  lead: string;
  lists: Extra[];
  bestForLine: string;
  demoHref?: string;
}) {
  const cat = categoryBySlug(slug);

  return (
    <>
      {/* Hero -------------------------------------------------------- */}
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={14} />
        <Glow className="-left-16 top-4" size={520} />
        <Glow className="right-0 top-1/3" color="rgba(90,68,128,0.55)" size={480} />
        <div className="container-fae relative z-10 py-14 sm:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <div className="max-w-2xl">
              <Eyebrow light>Faelight · {cat.audience}</Eyebrow>
              <h1 className="mt-4 font-serif text-3xl leading-[1.12] sm:text-4xl">
                {cat.name}
              </h1>
              <p className="mt-5 font-serif text-xl text-firefly-bright/90">
                {cat.tagline}
              </p>
              <p className="mt-4 max-w-xl text-parchment/75">{lead}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/book" className="btn-gold">Book a Discovery Call</Link>
                {demoHref ? (
                  <Link href={demoHref} className="btn-ghost-light">✦ See the live demo</Link>
                ) : (
                  <Link href="#pricing" className="btn-ghost-light">See services & pricing</Link>
                )}
              </div>
            </div>

            {/* Sub-brand emblem — floating (all-gold on-dark variant) */}
            <div className="relative hidden justify-center lg:flex">
              <Glow className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" color="rgba(230,183,82,0.3)" size={340} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SUB_LOGO[slug]}
                alt={`Faelight ${cat.name} logo`}
                className="relative max-h-80 w-auto animate-floatSlow drop-shadow-[0_10px_36px_rgba(230,183,82,0.35)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lists (what we fix / what learners build) ------------------ */}
      <section className="section">
        <div className="container-fae">
          <div className={`grid gap-10 ${lists.length > 1 ? "lg:grid-cols-2" : ""}`}>
            {lists.map((l) => (
              <div key={l.title} className="card">
                <StarList title={l.title} items={l.items} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing menu ----------------------------------------------- */}
      <section id="pricing" className="section bg-parchment-warm/60 print-page">
        <div className="container-fae">
          <div className="text-center">
            <Eyebrow>Services & pricing</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              What we offer
            </h2>
          </div>

          <OfferingsMenu slug={slug} />

          <p className="mt-8 text-center text-xs italic text-ink-faint">
            {BRAND.pricingDisclaimer}
          </p>
        </div>
      </section>

      {/* Best for line ---------------------------------------------- */}
      <section className="section">
        <div className="container-fae">
          <div className="mx-auto max-w-3xl text-center">
            <StarDivider />
            <p className="font-serif text-2xl leading-snug text-forest-deep sm:text-3xl">
              {bestForLine}
            </p>
            <StarDivider />
          </div>
        </div>
      </section>

      {/* Inline inquiry CTA ----------------------------------------- */}
      <section className="section bg-parchment-warm/60 no-print">
        <div className="container-fae grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Let's talk</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              Tell us what you're working on.
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              A short note is enough to start. We'll read it properly, then
              reply like humans — because that's the point.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-firefly/30 bg-enchanted p-5 text-parchment shadow-card">
              <p className="flex items-center gap-2 font-serif text-base text-firefly-bright">
                <Star /> Prefer to reach out directly?
              </p>
              <p className="mt-3 text-sm font-medium text-parchment">{CONTACT.name}</p>
              <div className="mt-2 space-y-1.5 text-sm">
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 text-parchment/85 transition hover:text-firefly-bright">
                  <span className="text-firefly">✉</span>
                  <span className="break-all">{CONTACT.email}</span>
                </a>
              </div>
            </div>
          </div>
          <InquiryForm defaultCategory={slug} compact />
        </div>
      </section>

      <div className="no-print">
        <CtaBand />
      </div>
    </>
  );
}
