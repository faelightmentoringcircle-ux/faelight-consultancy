import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/content";
import { Eyebrow, Fireflies, Glow, Star } from "@/components/Motifs";
import { CtaBand } from "@/components/Sections";
import { ServiceCount } from "@/components/ServiceCount";

export const metadata: Metadata = {
  title: "Brochures",
  description:
    "View or download Faelight brochures — one per sub-brand plus a full Services & Pricing guide. Read online or save as PDF.",
};

export default function BrochuresPage() {
  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={12} />
        <Glow className="-left-16 top-4" size={440} />
        <div className="container-fae relative z-10 py-16 text-center sm:py-20">
          <Eyebrow light>Brochures</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            Read online, or save the magic as a PDF.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-parchment/75">
            Every brochure is generated from the same live content as the site,
            so pricing always matches. View it in the browser, or print to PDF
            for sharing.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-fae">
          {/* Overall guide */}
          <div className="card mb-8 flex flex-col items-start justify-between gap-6 bg-enchanted text-parchment sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-bright">
                Complete guide
              </p>
              <h2 className="mt-2 font-serif text-2xl">Faelight Services & Pricing</h2>
              <p className="mt-2 max-w-md text-sm text-parchment/70">
                All three sub-brands, every service and price, contact details
                and a scan-to-book QR — in one document.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link href="/brochure/all" className="btn-gold">View / Download</Link>
            </div>
          </div>

          {/* Per sub-brand */}
          <div className="grid gap-6 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.slug} className="card-hover flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">
                  {cat.audience}
                </span>
                <h3 className="mt-2 font-serif text-2xl text-forest-deep">
                  {cat.name}
                  <Star className="ml-2 text-base text-firefly" />
                </h3>
                <p className="mt-3 text-sm text-ink-soft">{cat.description}</p>
                <p className="mt-4 text-xs text-ink-faint">
                  <ServiceCount slug={cat.slug} /> services · with pricing & best-for
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/brochure/${cat.slug}`} className="btn-primary !px-4 !py-2 text-sm">
                    ⬇ PDF brochure
                  </Link>
                  <Link href={`/${cat.slug}`} className="btn-ghost !px-4 !py-2 text-sm">
                    View page
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-ink-faint">
            Each web brochure page is also print-optimised — on any sub-brand
            page, use your browser's <em>Print → Save as PDF</em> for a clean A4 copy.
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
