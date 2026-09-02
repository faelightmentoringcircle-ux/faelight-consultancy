"use client";

import { useEffect, useState } from "react";
import { getFounder, onStoreChange, FounderInfo } from "@/lib/store";
import { FOUNDER } from "@/lib/content";
import { Eyebrow, Fireflies, Glow } from "@/components/Motifs";

// Founder section on the public About page. Reads the admin-editable founder
// info; starts from the seed so the first paint matches, then loads live edits.
export function AboutFounder() {
  const [f, setF] = useState<FounderInfo>(FOUNDER as FounderInfo);
  useEffect(() => {
    const sync = () => setF(getFounder());
    sync();
    return onStoreChange(sync);
  }, []);

  return (
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
                alt={f.name}
                className="mx-auto h-32 w-32 rounded-full object-cover shadow-glow ring-2 ring-firefly/50"
              />
              <p className="mt-5 font-serif text-2xl">{f.name}</p>
              <p className="mt-1 text-sm text-firefly-bright/80">{f.title}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {f.personal.map((p) => (
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
        <h2 className="mt-3 font-serif text-3xl text-forest-deep">{f.role}</h2>
        <p className="mt-4 text-ink-soft">{f.bio}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {f.stats.map((s) => (
            <div key={s.label} className="card text-center">
              <p className="font-serif text-3xl text-forest">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-ink-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
