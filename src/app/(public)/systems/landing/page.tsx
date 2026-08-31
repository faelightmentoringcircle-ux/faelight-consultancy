import type { Metadata } from "next";
import Link from "next/link";
import { DemoShowcase } from "@/components/DemoShowcase";
import { CtaBand } from "@/components/Sections";
import { Eyebrow, Fireflies, Glow, Star, StarDivider } from "@/components/Motifs";
import { categoryBySlug, PROCESS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Faelight Systems — Calm operations, documented and running",
  description:
    "Operations, SOPs, Notion workspaces and dashboards for founders who need operations to stop living in their head. See a live demo of the kind of Ops OS Faelight builds.",
};

const cat = categoryBySlug("systems");

const VALUE = [
  {
    glyph: "◈",
    title: "One calm workspace",
    detail: "Tasks, files, clients and reporting in a single Notion Ops OS — no more seventeen tabs.",
  },
  {
    glyph: "❦",
    title: "SOPs your team can run",
    detail: "Documented processes and handover docs, so the business stops living in your head.",
  },
  {
    glyph: "⚙",
    title: "Dashboards & automations",
    detail: "Live dashboards and automations that keep operations moving while you focus on the work.",
  },
];

const OUTCOMES = [
  "Onboarding that runs itself",
  "Reporting that writes itself on Fridays",
  "A team that knows exactly where everything lives",
  "Founders who finally step out of the bottleneck",
];

// Systems-focused testimonials — sample content for the shareable demo.
const REVIEWS = [
  {
    quote:
      "Faelight took a year of scattered tools and turned it into one workspace my team actually runs without me. I got my evenings back.",
    author: "Clarissa D.",
    role: "Founder, wellness clinic",
    rating: 5,
  },
  {
    quote:
      "The SOPs and Notion build meant our new hire was productive in days, not months. Onboarding finally runs itself.",
    author: "Marco R.",
    role: "Operations Lead, remote team",
    rating: 5,
  },
  {
    quote:
      "I stopped being the bottleneck. Everything lives in the system now — documented, searchable and calm.",
    author: "Bea S.",
    role: "Founder, coffee brand",
    rating: 5,
  },
];

export default function SystemsLandingPage() {
  return (
    <>
      {/* Hero -------------------------------------------------------- */}
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={16} />
        <Glow className="-left-16 top-4" size={540} />
        <Glow className="right-0 top-1/3" color="rgba(90,68,128,0.55)" size={500} />
        <div className="container-fae relative z-10 py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-2xl">
              <Eyebrow light>Faelight · {cat.audience}</Eyebrow>
              <h1 className="mt-4 font-serif text-4xl leading-[1.1] sm:text-5xl">
                Operations that finally run without you.
              </h1>
              <p className="mt-5 max-w-xl font-serif text-xl leading-snug text-firefly-bright/90">
                Give your business an end-to-end solution — analyzing your business process and
                integrating it into a bespoke system.
              </p>
              <p className="mt-4 max-w-xl text-lg text-parchment/80">
                For businesses whose operations are held together by vibes, memory and seventeen
                tabs. We turn the chaos into calm, documented systems your team can actually run.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#demo" className="btn-gold">
                  ✦ See the live demo
                </a>
                <Link href="/book" className="btn-ghost-light">
                  Book a Discovery Call
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-parchment/70">
                {OUTCOMES.map((o) => (
                  <span key={o} className="inline-flex items-center gap-2">
                    <Star className="text-firefly" />
                    {o}
                  </span>
                ))}
              </div>
            </div>

            {/* Sub-brand emblem — floating gold on-dark */}
            <div className="relative hidden justify-center lg:flex">
              <Glow
                className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                color="rgba(230,183,82,0.3)"
                size={360}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/systems-light.png"
                alt="Faelight Systems logo"
                className="relative max-h-96 w-auto animate-floatSlow drop-shadow-[0_10px_36px_rgba(230,183,82,0.35)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value props ------------------------------------------------- */}
      <section className="section">
        <div className="container-fae">
          <div className="text-center">
            <Eyebrow>What Faelight Systems is</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              Systems that create freedom.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {VALUE.map((v) => (
              <div key={v.title} className="card-hover text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-twilight/10 to-forest/10 text-xl text-firefly">
                  {v.glyph}
                </div>
                <h3 className="mt-3 font-serif text-lg text-forest-deep">{v.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{v.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live demo --------------------------------------------------- */}
      <section id="demo" className="section scroll-mt-20 bg-parchment-warm/60">
        <div className="container-fae">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>See it live</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              A working preview you can click around.
            </h2>
            <p className="mt-4 text-ink-soft">
              Pick an industry, then move between the three screens of a real app: the public{" "}
              <strong className="font-semibold text-forest">Website</strong>, the back-office{" "}
              <strong className="font-semibold text-forest">Admin</strong> (dashboard, SOPs, board,
              CRM &amp; automations), and the <strong className="font-semibold text-forest">Portal</strong>{" "}
              your students or clients log into. Check off a task, toggle an automation, explore around.
              Sample data only — nothing here is saved.
            </p>
          </div>

          <div className="mt-10">
            <DemoShowcase />
          </div>

          <p className="mt-6 text-center text-sm text-ink-faint">
            Every Faelight build is tailored to <em>your</em> tools, team and workflows — this is just a taste.
          </p>
        </div>
      </section>

      {/* How it works ------------------------------------------------ */}
      <section className="section">
        <div className="container-fae">
          <div className="text-center">
            <Eyebrow>How we work</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              From messy to documented, in four steps.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <div key={p.step} className="card">
                <span className="font-serif text-3xl text-firefly">{p.step}</span>
                <h3 className="mt-2 font-serif text-lg text-forest-deep">{p.name}</h3>
                <p className="mt-2 text-sm text-ink-soft">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials ------------------------------------------------ */}
      <section className="section bg-parchment-warm/60">
        <div className="container-fae">
          <div className="text-center">
            <Eyebrow>Kind words</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              Founders who got their time back.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-faint">
              Real outcomes from the teams whose operations we&rsquo;ve untangled.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {REVIEWS.map((t) => (
              <figure key={t.author} className="card flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="text-2xl text-firefly">❝</div>
                  <div className="text-sm text-firefly" aria-label={`${t.rating} out of 5`}>
                    {"★".repeat(t.rating)}
                  </div>
                </div>
                <blockquote className="mt-2 font-serif text-lg leading-snug text-forest-deep">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-auto pt-5 text-sm">
                  <span className="font-semibold text-forest">{t.author}</span>
                  <br />
                  <span className="text-ink-faint">{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl text-center">
            <StarDivider />
            <p className="font-serif text-2xl leading-snug text-forest-deep sm:text-3xl">
              Best for founders and teams whose operations live in one person&rsquo;s head — ready to
              trade scattered tabs for systems that create freedom.
            </p>
            <StarDivider />
          </div>
        </div>
      </section>

      {/* Closing CTA ------------------------------------------------- */}
      <CtaBand
        heading="Let's get your operations out of your head."
        sub="Book a discovery call and we'll map the next right step — then build the system your team can actually run."
      />
    </>
  );
}
