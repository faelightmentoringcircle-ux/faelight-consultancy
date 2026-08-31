import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, FOUNDER, TEAM, PROJECT_TEAMS } from "@/lib/content";
import { Eyebrow, Fireflies, Glow, Star, StarDivider } from "@/components/Motifs";
import { CtaBand } from "@/components/Sections";
import { AboutVideo } from "@/components/AboutVideo";

export const metadata: Metadata = {
  title: "About — Maia & the Faelight Team",
  description:
    "Meet Maria “Maia” Castañeda, founder of Faelight, and the team behind the mentoring, systems and experiences work.",
};

export default function AboutPage() {
  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={14} />
        <Glow className="-left-16 top-4" size={480} />
        <Glow className="right-0 top-1/3" color="rgba(90,68,128,0.55)" size={440} />
        <div className="container-fae relative z-10 py-20 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-8">
            <div className="max-w-xl">
              <Eyebrow light>About Faelight</Eyebrow>
              <h1 className="mt-5 font-serif text-3xl leading-[1.15] sm:text-4xl lg:text-[2.75rem]">
                Built from lived experience, not generic templates.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-parchment/75">
                Faelight is a small team with a big belief: people come first,
                systems come second, and a little magic belongs in the middle of
                serious work.
              </p>
            </div>
            <div className="relative hidden items-center justify-center lg:flex">
              <Glow className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" color="rgba(230,183,82,0.3)" size={440} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-full.png"
                alt="Faelight Business Consultancy logo"
                className="relative max-h-[26rem] w-auto animate-floatSlow drop-shadow-[0_10px_40px_rgba(230,183,82,0.3)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Video / trailer (editable in admin) ----------------------- */}
      <AboutVideo />

      {/* Founder ---------------------------------------------------- */}
      <section className="section">
        <div className="container-fae grid gap-10 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-2">
            <div className="relative mx-auto max-w-sm">
              <Glow className="-right-4 -top-4" size={280} />
              <div className="card relative bg-enchanted text-center text-parchment">
                <Fireflies count={7} />
                <div className="relative z-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/maia-portrait.jpg"
                    alt="Maria “Maia” Castañeda"
                    className="mx-auto h-32 w-32 rounded-full object-cover shadow-glow ring-2 ring-firefly/50"
                  />
                  <p className="mt-5 font-serif text-2xl">{FOUNDER.name}</p>
                  <p className="mt-1 text-sm text-firefly-bright/80">{FOUNDER.title}</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {FOUNDER.personal.map((p) => (
                      <span key={p} className="rounded-full border border-firefly/40 px-3 py-1 text-xs text-parchment/80">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Eyebrow>The founder</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl text-forest-deep">{FOUNDER.role}</h2>
            <p className="mt-4 text-ink-soft">{FOUNDER.bio}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {FOUNDER.stats.map((s) => (
                <div key={s.label} className="card text-center">
                  <p className="font-serif text-3xl text-forest">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-ink-faint">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StarDivider />

      {/* Team ------------------------------------------------------- */}
      <section id="team" className="section scroll-mt-24">
        <div className="container-fae">
          <div className="text-center">
            <Eyebrow>The team</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              The people behind the magic
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((m) => (
              <div key={m.id} className="card-hover flex items-start gap-4">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-card ring-1 ring-firefly/30"
                  />
                ) : (
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-twilight to-forest text-xl text-firefly-bright">
                    <Star />
                  </div>
                )}
                <div>
                  <p className="font-serif text-lg text-forest-deep">{m.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-firefly-deep">{m.role}</p>
                  <p className="mt-2 text-sm text-ink-soft">{m.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Teams --------------------------------------------- */}
      <section id="teams" className="section scroll-mt-24 bg-parchment-warm/60">
        <div className="container-fae">
          <div className="text-center">
            <Eyebrow>Project teams</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">
              How the work gets done
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
              Faelight organises into small project teams — each with clear focus,
              members and the projects they own.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PROJECT_TEAMS.map((t) => (
              <div key={t.id} className="card flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-twilight/15 to-forest/15 text-xl text-firefly">
                    {t.glyph}
                  </span>
                  <h3 className="font-serif text-lg text-forest-deep">{t.name}</h3>
                </div>
                <p className="mt-3 text-sm text-ink-soft">{t.focus}</p>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-eyebrow text-firefly-deep">Members</p>
                <ul className="mt-2 space-y-1.5">
                  {t.members.map((m) => (
                    <li key={m.name} className="flex items-center gap-2 text-sm">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-forest/10 text-[10px] font-bold text-forest">
                        {m.name[0]}
                      </span>
                      <span className="font-medium text-forest-deep">{m.name}</span>
                      <span className="text-xs text-ink-faint">· {m.role}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-eyebrow text-firefly-deep">Projects</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.projects.map((p) => (
                    <span key={p} className="rounded-full bg-firefly/10 px-2 py-0.5 text-[11px] font-medium text-firefly-deep">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact quick strip --------------------------------------- */}
      <section className="pb-8">
        <div className="container-fae">
          <div className="card flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-serif text-xl text-forest-deep">Want to work with us?</p>
              <p className="text-sm text-ink-soft">
                {CONTACT.name} · {CONTACT.email}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/book" className="btn-primary">Book a call</Link>
              <Link href="/contact" className="btn-ghost">Contact</Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
