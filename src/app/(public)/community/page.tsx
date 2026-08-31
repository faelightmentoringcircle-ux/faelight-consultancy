import type { Metadata } from "next";
import Link from "next/link";
import { Announcement, ANNOUNCEMENTS, POLLS, openOpportunities } from "@/lib/content";
import { Eyebrow, Fireflies, Glow, Star } from "@/components/Motifs";
import { Poll } from "@/components/Poll";
import { CtaBand } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Community — News, Announcements & Polls",
  description:
    "Faelight announcements, updates and events — plus quick polls to help shape what we build next.",
};

const TAG_STYLES: Record<Announcement["tag"], string> = {
  Update: "bg-forest/10 text-forest",
  Event: "bg-firefly/20 text-firefly-deep",
  Notice: "bg-rose-100 text-rose-700",
  News: "bg-twilight/10 text-twilight-light",
};

export default function CommunityPage() {
  const openCount = openOpportunities().length;

  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={14} />
        <Glow className="-left-16 top-4" size={480} />
        <div className="container-fae relative z-10 py-16 text-center sm:py-20">
          <Eyebrow light>Community</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            News, updates & your voice.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-parchment/75">
            What's happening at Faelight — announcements, events and notices — and
            quick polls to help shape what we build next.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-fae grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Announcements / News */}
          <div>
            <Eyebrow>Announcements & news</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">Latest from Faelight</h2>
            <div className="mt-8 space-y-4">
              {ANNOUNCEMENTS.map((a) => (
                <article key={a.id} className="card">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TAG_STYLES[a.tag]}`}>
                      {a.tag}
                    </span>
                    <span className="text-xs text-ink-faint">{a.date}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-lg text-forest-deep">{a.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-soft">{a.body}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Polls + opportunities teaser */}
          <div className="space-y-6">
            <div>
              <Eyebrow>Faelight poll</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">Have your say</h2>
              <div className="mt-6 space-y-6">
                {POLLS.map((p) => (
                  <Poll key={p.id} poll={p} />
                ))}
              </div>
            </div>

            <div className="card bg-enchanted text-parchment">
              <p className="flex items-center gap-2 font-serif text-lg text-firefly-bright">
                <Star /> {openCount} open opportunities
              </p>
              <p className="mt-2 text-sm text-parchment/80">
                VA roles and projects with Faelight and our clients — trained VAs get matched first.
              </p>
              <Link href="/opportunities" className="btn-gold mt-4 !py-2 text-xs">
                View opportunities →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        heading="Want updates in your inbox?"
        sub="Book a discovery call or send an inquiry — we'll keep you posted on classes and openings."
      />
    </>
  );
}
