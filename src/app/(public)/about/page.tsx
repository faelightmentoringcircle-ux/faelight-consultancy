import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/lib/content";
import { Eyebrow, Fireflies, Glow, StarDivider } from "@/components/Motifs";
import { AboutTeam } from "@/components/AboutTeam";
import { AboutFounder } from "@/components/AboutFounder";
import { AboutProjectTeams } from "@/components/AboutProjectTeams";
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
        <AboutFounder />
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
          <AboutTeam />
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
          <AboutProjectTeams />
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
