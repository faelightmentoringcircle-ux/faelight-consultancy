"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SessionItem } from "@/lib/content";
import { getSessions, onStoreChange, sessionDateText, sessionSeatText, sessionSlug, seatsLeft, isSoldOut } from "@/lib/store";
import { peso } from "@/lib/format";
import { Eyebrow, Fireflies, Glow, Star } from "@/components/Motifs";
import { CtaBand } from "@/components/Sections";

function KindTag({ kind }: { kind: SessionItem["kind"] }) {
  const cls = kind === "webinar" ? "bg-twilight/10 text-twilight-light" : "bg-forest/10 text-forest";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {kind}
    </span>
  );
}

function SeatMeter({ s }: { s: SessionItem }) {
  const left = seatsLeft(s);
  if (left === null || !s.seatsTotal) return null;
  const pct = Math.round(((s.seatsTotal - left) / s.seatsTotal) * 100);
  return (
    <div className="mt-3">
      <div className="h-1.5 overflow-hidden rounded-full bg-forest/10">
        <div className={`h-full rounded-full ${left === 0 ? "bg-rose-400" : pct >= 75 ? "bg-firefly" : "bg-forest"}`} style={{ width: `${Math.max(6, pct)}%` }} />
      </div>
    </div>
  );
}

function SessionCard({ s }: { s: SessionItem }) {
  const sold = isSoldOut(s);
  const free = s.price === 0 || (s.price == null && s.kind === "webinar");
  return (
    <div className="card-hover flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <KindTag kind={s.kind} />
        <span className={`text-[11px] font-medium ${sold ? "text-rose-500" : "text-firefly-deep"}`}>{sessionSeatText(s)}</span>
      </div>
      <h3 className="mt-3 font-serif text-lg text-forest-deep">{s.title}</h3>
      <p className="mt-1 text-xs font-semibold text-forest">{sessionDateText(s)}</p>
      <p className="mt-2 flex-1 text-sm text-ink-soft">{s.blurb}</p>
      <SeatMeter s={s} />
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-ink-faint">Hosted by {s.host}</span>
        {typeof s.price === "number" && (
          <span className="font-serif text-base text-forest-deep">{free ? "Free" : peso(s.price)}</span>
        )}
      </div>
      <div className="mt-4 border-t border-firefly/15 pt-3">
        {s.status === "upcoming" ? (
          <Link
            href={s.registerUrl ?? `/register/${sessionSlug(s)}`}
            className={`btn-gold w-full !py-2 text-xs ${sold ? "pointer-events-none opacity-50" : ""}`}
          >
            {sold ? "Sold out" : "View details & register"}
          </Link>
        ) : (
          <div className="flex gap-2">
            <a href={s.replayUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 !py-2 text-xs">
              ▶ Watch replay
            </a>
            <Link href={`/feedback?session=${s.id}`} className="btn-ghost flex-1 !py-2 text-xs">
              ✎ Give feedback
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function ClassesContent() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  useEffect(() => {
    const sync = () => setSessions(getSessions());
    sync();
    return onStoreChange(sync);
  }, []);

  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const past = sessions.filter((s) => s.status === "past");

  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={14} />
        <Glow className="-left-16 top-4" size={480} />
        <div className="container-fae relative z-10 py-16 text-center sm:py-20">
          <Eyebrow light>Classes & webinars</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            Learn live, with people who care.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-parchment/75">
            Scheduled classes and free webinars — register for what's coming, or catch a replay of
            what you missed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-gold">✦ Register now</Link>
            <Link href="#upcoming" className="btn-ghost-light">Upcoming sessions</Link>
            <Link href="#past" className="btn-ghost-light">Past replays</Link>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section id="upcoming" className="section scroll-mt-20">
        <div className="container-fae">
          <div className="flex items-end justify-between border-b border-firefly/20 pb-6">
            <div>
              <Eyebrow>Upcoming</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">Reserve your seat</h2>
            </div>
            <span className="rounded-full bg-firefly/15 px-4 py-1.5 text-xs font-semibold text-firefly-deep">
              {upcoming.length} scheduled
            </span>
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
            {upcoming.map((s) => (
              <SessionCard key={s.id} s={s} />
            ))}
          </div>
          {upcoming.length === 0 && (
            <p className="mt-8 text-center text-sm text-ink-faint">No upcoming sessions right now — check back soon.</p>
          )}
        </div>
      </section>

      {/* Past */}
      <section id="past" className="section scroll-mt-20 bg-parchment-warm/60">
        <div className="container-fae">
          <div className="flex items-end justify-between border-b border-firefly/20 pb-6">
            <div>
              <Eyebrow>Past sessions</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">Catch a replay</h2>
            </div>
            <span className="rounded-full bg-forest/10 px-4 py-1.5 text-xs font-semibold text-forest">
              {past.length} available
            </span>
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
            {past.map((s) => (
              <SessionCard key={s.id} s={s} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-ink-faint">
            <Star className="mr-1 text-firefly" />
            Want a class run for your team or community?{" "}
            <Link href="/contact" className="font-semibold text-firefly-deep hover:underline">
              Request a private session →
            </Link>
          </p>
        </div>
      </section>

      <CtaBand
        heading="Ready to learn with the next cohort?"
        sub="Book a discovery call and we'll point you to the right class or program."
      />
    </>
  );
}
