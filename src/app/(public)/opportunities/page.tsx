import type { Metadata } from "next";
import Link from "next/link";
import { Opportunity, OPPORTUNITIES } from "@/lib/content";
import { Eyebrow, Fireflies, Glow } from "@/components/Motifs";
import { CtaBand } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Faelight Opportunities — VA Roles & Projects",
  description:
    "Open virtual assistant roles, projects and opportunities with Faelight and our clients.",
};

const TYPE_STYLES: Record<Opportunity["type"], string> = {
  "VA Role": "bg-forest/10 text-forest",
  Project: "bg-twilight/10 text-twilight-light",
  Internship: "bg-firefly/20 text-firefly-deep",
  Partner: "bg-blue-100 text-blue-700",
};

function OpportunityCard({ o }: { o: Opportunity }) {
  const closed = o.status === "closed";
  return (
    <div className={`card flex flex-col ${closed ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[o.type]}`}>
          {o.type}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            closed ? "bg-stone-200 text-stone-600" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {closed ? "Closed" : "● Open"}
        </span>
      </div>
      <h3 className="mt-3 font-serif text-lg text-forest-deep">{o.title}</h3>
      <p className="mt-0.5 text-xs text-ink-faint">
        {o.mode} · {o.posted}
      </p>
      <p className="mt-2 flex-1 text-sm text-ink-soft">{o.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {o.tags.map((t) => (
          <span key={t} className="rounded-full bg-firefly/10 px-2 py-0.5 text-[11px] font-medium text-firefly-deep">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 border-t border-firefly/15 pt-3">
        {closed ? (
          <span className="text-xs text-ink-faint">Applications closed</span>
        ) : (
          <Link href={o.applyUrl ?? "/contact"} className="btn-primary w-full !py-2 text-xs">
            Apply / express interest
          </Link>
        )}
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const open = OPPORTUNITIES.filter((o) => o.status === "open");
  const closed = OPPORTUNITIES.filter((o) => o.status === "closed");

  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={14} />
        <Glow className="-left-16 top-4" size={480} />
        <div className="container-fae relative z-10 py-16 text-center sm:py-20">
          <Eyebrow light>Faelight opportunities</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            Grow your career with Faelight.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-parchment/75">
            Open VA roles, projects and opportunities with Faelight and the
            clients we support. Trained with us? You're already a step ahead.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-fae">
          <div className="flex items-end justify-between border-b border-firefly/20 pb-6">
            <div>
              <Eyebrow>Open positions</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">Now hiring</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700">
              {open.length} open
            </span>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {open.map((o) => (
              <OpportunityCard key={o.id} o={o} />
            ))}
          </div>

          {closed.length > 0 && (
            <>
              <h3 className="mb-4 mt-12 text-xs font-semibold uppercase tracking-eyebrow text-ink-faint">
                Recently closed
              </h3>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {closed.map((o) => (
                  <OpportunityCard key={o.id} o={o} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <CtaBand
        heading="Don't see the right role yet?"
        sub="Send us your profile anyway — we match trained VAs to new openings first."
      />
    </>
  );
}
