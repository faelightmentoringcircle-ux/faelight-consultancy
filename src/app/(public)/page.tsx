import Link from "next/link";
import {
  CATEGORIES,
  FOUNDER,
  PROCESS,
  WHAT_WE_BUILD_INDIVIDUALS,
  WHAT_WE_BUILD_CLIENTS,
  servicesByCategory,
} from "@/lib/content";
import { Eyebrow, Fireflies, Glow, Star } from "@/components/Motifs";
import { ClientFit, CtaBand, WhatWeBuild } from "@/components/Sections";
import { ClientsSupported } from "@/components/ClientsSupported";
import { Testimonials } from "@/components/Testimonials";
import { HomeHero } from "@/components/HomeHero";

export default function HomePage() {
  return (
    <>
      {/* ============================ HERO (editable) ================= */}
      <HomeHero />

      {/* ==================== FOUNDER HIGHLIGHT ===================== */}
      <section className="section">
        <div className="container-fae">
          <div className="card overflow-hidden lg:grid lg:grid-cols-5">
            <div className="relative bg-enchanted p-8 text-parchment lg:col-span-2">
              <Fireflies count={8} />
              <div className="relative z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/maia-portrait.jpg"
                  alt="Maria “Maia” Castañeda"
                  className="mx-auto h-28 w-28 rounded-full object-cover shadow-glow ring-2 ring-firefly/50"
                />
                <p className="mt-6 text-center font-serif text-2xl">{FOUNDER.name}</p>
                <p className="mt-1 text-center text-sm text-firefly-bright/80">{FOUNDER.title}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {FOUNDER.personal.map((p) => (
                    <span key={p} className="rounded-full border border-firefly/40 px-3 py-1 text-xs text-parchment/80">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 lg:col-span-3 lg:p-12">
              <Eyebrow>Meet the founder</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
                {FOUNDER.role}
              </h2>
              <p className="mt-4 text-ink-soft">{FOUNDER.bio}</p>
              <Link href="/about" className="btn-ghost mt-6">
                More about Maia & the team →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== THREE SUB-BRANDS ====================== */}
      <section className="section">
        <div className="container-fae">
          <div className="text-center">
            <Eyebrow>Three ways we help</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              One firm, three kinds of magic.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
              Training for people, systems for businesses, experiences for
              communities. Take one — or blend all three into a full pathway.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const preview = servicesByCategory(cat.slug).slice(0, 3);
              return (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="card-hover group relative flex flex-col overflow-hidden"
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-firefly/10 blur-2xl transition group-hover:bg-firefly/25" />
                  <span className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">
                    {cat.audience}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl text-forest-deep">
                    {cat.name}
                    <Star className="ml-2 text-base text-firefly transition-transform duration-500 group-hover:rotate-180" />
                  </h3>
                  <p className="mt-3 text-sm text-ink-soft">{cat.description}</p>
                  <ul className="mt-5 space-y-1.5">
                    {preview.map((s) => (
                      <li key={s.id} className="flex items-center gap-2 text-sm text-ink-soft">
                        <span className="text-firefly">✦</span>
                        {s.name}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold text-forest transition group-hover:gap-2">
                    Explore {cat.name} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== WHY FAELIGHT EXISTS ==================== */}
      <section className="section bg-parchment-warm/60">
        <div className="container-fae grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Why Faelight exists</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl leading-tight text-forest-deep sm:text-3xl">
              Faelight turns hidden capability into visible, usable work.
            </h2>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-firefly-deep">
              People are rarely starting from zero.
            </p>
            <div className="mt-5 space-y-3 text-ink-soft">
              <ul className="space-y-2">
                <li className="flex gap-2"><span className="text-firefly">✦</span> A mother managing a household already understands coordination.</li>
                <li className="flex gap-2"><span className="text-firefly">✦</span> A career shifter already has experience.</li>
                <li className="flex gap-2"><span className="text-firefly">✦</span> An underpaid VA already has skills.</li>
              </ul>
              <p className="border-t border-firefly/20 pt-3">
                What's often missing is the ability to recognise, translate and
                confidently use what they already know — the heart of the
                training, the consulting and the community.
              </p>
              <p className="font-serif text-xl text-forest-deep">
                People first. Systems second. Magic throughout.
              </p>
            </div>
          </div>

          <div className="relative">
            <Glow className="-right-6 -top-6" color="rgba(230,183,82,0.3)" size={320} />
            <div className="relative grid gap-4 sm:grid-cols-2">
              {FOUNDER.stats.map((s) => (
                <div key={s.label} className="card text-center">
                  <p className="font-serif text-3xl text-forest">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-ink-faint">{s.label}</p>
                </div>
              ))}
              <div className="card sm:col-span-2 bg-enchanted text-parchment">
                <p className="font-serif text-lg leading-snug">
                  “Credible and human — because Faelight is built from lived
                  experience, not generic templates.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW WE WORK ========================== */}
      <section className="section bg-parchment-warm/60">
        <div className="container-fae">
          <div className="text-center">
            <Eyebrow>How we work</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              Discover → Design → Deliver → Support
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="card-hover group relative">
                <span className="font-serif text-4xl text-firefly/40 transition group-hover:text-firefly">
                  {p.step}
                </span>
                <h3 className="mt-2 font-serif text-xl text-forest-deep">{p.name}</h3>
                <p className="mt-2 text-sm text-ink-soft">{p.detail}</p>
                {i < PROCESS.length - 1 && (
                  <span className="absolute right-4 top-6 hidden text-firefly/40 lg:block">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== WHAT WE BUILD (individuals / clients) ======= */}
      <WhatWeBuild
        data={WHAT_WE_BUILD_INDIVIDUALS}
        eyebrow="What we build · with individuals"
        heading="Capability that survives real work."
      />
      <WhatWeBuild
        data={WHAT_WE_BUILD_CLIENTS}
        eyebrow="What we build · with clients"
        heading="Systems and experiences that keep working."
        dark
      />

      {/* ==================== PRICING TEASER ======================= */}
      <section className="section">
        <div className="container-fae">
          <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-1">
              <Eyebrow>The menu</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
                Clear pricing, honest scope.
              </h2>
              <p className="mt-4 text-ink-soft">
                From a ₱2,000 Foundations class to full custom programs and
                systems builds — every engagement starts with a conversation,
                not a contract.
              </p>
              <Link href="/pricing" className="btn-primary mt-6">See the full menu</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              {CATEGORIES.map((cat) => {
                const svcs = servicesByCategory(cat.slug);
                const from = Math.min(...svcs.map((s) => s.priceFrom ?? Infinity));
                return (
                  <Link key={cat.slug} href="/pricing" className="card-hover">
                    <p className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">
                      {cat.name}
                    </p>
                    <p className="mt-3 font-serif text-2xl text-forest-deep">
                      from ₱{from.toLocaleString("en-PH")}
                    </p>
                    <p className="mt-2 text-xs text-ink-faint">{svcs.length} services</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CLIENT FIT ========================== */}
      <ClientFit />

      {/* ============== CLIENTS & BRANDS WE SUPPORT =============== */}
      <ClientsSupported />

      {/* ==================== TESTIMONIALS ======================== */}
      <Testimonials />

      {/* ==================== FINAL CTA ========================== */}
      <CtaBand />
    </>
  );
}
