"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPublicPool, onStoreChange, logActivity, PoolVA } from "@/lib/store";
import { Eyebrow, Fireflies, Glow, Star } from "@/components/Motifs";
import { CtaBand } from "@/components/Sections";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function PoolPage() {
  const [vas, setVas] = useState<PoolVA[]>([]);
  const [niche, setNiche] = useState<string>("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    const sync = () => setVas(getPublicPool());
    sync();
    // Log a pool visit for the admin notifications (once per browser session).
    try {
      if (!sessionStorage.getItem("fae.poolVisitLogged")) {
        logActivity("pool", "Faelight Pool visited", "A visitor browsed the VA talent pool", "/admin/pool");
        sessionStorage.setItem("fae.poolVisitLogged", "1");
      }
    } catch {
      /* ignore */
    }
    return onStoreChange(sync);
  }, []);

  const niches = useMemo(() => {
    const set = new Set<string>();
    vas.forEach((v) => v.niche.forEach((n) => set.add(n)));
    return ["All", ...Array.from(set).sort()];
  }, [vas]);

  const filtered = vas.filter((v) => {
    const matchNiche = niche === "All" || v.niche.includes(niche);
    const matchQ =
      !q.trim() ||
      v.name.toLowerCase().includes(q.toLowerCase()) ||
      v.niche.some((n) => n.toLowerCase().includes(q.toLowerCase()));
    return matchNiche && matchQ;
  });

  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={14} />
        <Glow className="-left-16 top-4" size={480} />
        <div className="container-fae relative z-10 py-16 text-center sm:py-20">
          <Eyebrow light>Faelight Pool</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">
            Trained virtual assistants, ready to work.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-parchment/75">
            Meet the Faelight talent pool — VAs trained and vetted through our
            programs. Browse by niche and view résumés.
          </p>
          <p className="mt-6 text-sm text-firefly-bright">
            <Star className="mr-1" />
            {vas.length} VAs in the pool
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-fae">
          {/* Filters */}
          <div className="flex flex-col gap-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or niche…"
              className="w-full max-w-md rounded-full border border-firefly/25 bg-parchment-card px-5 py-2.5 text-sm outline-none focus:border-firefly"
            />
            <div className="flex flex-wrap gap-2">
              {niches.map((n) => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    niche === n
                      ? "bg-forest text-parchment"
                      : "border border-firefly/30 bg-parchment-card text-ink-soft hover:border-firefly hover:text-forest"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <div key={v.id} className="card-hover flex flex-col">
                <div className="flex items-center gap-3">
                  {v.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.photo} alt={v.name} className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-firefly/30" />
                  ) : (
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-twilight to-forest text-sm font-bold text-firefly-bright">
                      {initials(v.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg text-forest-deep">{v.name}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {v.niche.slice(0, 6).map((n) => (
                    <span key={n} className="rounded-full bg-firefly/10 px-2 py-0.5 text-[11px] font-medium text-firefly-deep">
                      {n}
                    </span>
                  ))}
                  {v.niche.length > 6 && (
                    <span className="rounded-full bg-forest/8 px-2 py-0.5 text-[11px] font-medium text-forest">
                      +{v.niche.length - 6} more
                    </span>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2 border-t border-firefly/15 pt-4">
                  {v.cv ? (
                    <a href={v.cv} target="_blank" rel="noopener noreferrer" className="btn-gold flex-1 !py-2 text-xs">
                      View résumé ↗
                    </a>
                  ) : (
                    <span className="flex-1 rounded-full bg-parchment-warm px-3 py-2 text-center text-xs text-ink-faint">
                      Résumé on request
                    </span>
                  )}
                  {v.website && (
                    <a href={v.website} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-2 text-xs">
                      Links
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 text-center text-sm text-ink-faint">No VAs match that filter.</p>
          )}

          <div className="mt-12 rounded-2xl border border-firefly/25 bg-parchment-warm/60 p-6 text-center">
            <p className="font-serif text-xl text-forest-deep">Looking to hire a VA?</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-ink-soft">
              Tell us what you need and we'll match you with the right person from the pool.
            </p>
            <Link href="/contact" className="btn-primary mt-4">Request a VA match</Link>
          </div>
        </div>
      </section>

      <CtaBand
        heading="Trained with Faelight? Join the pool."
        sub="Graduates of our programs can be listed in the Faelight Pool — book a call to get added."
      />
    </>
  );
}
