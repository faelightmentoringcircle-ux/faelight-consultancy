"use client";

import { useEffect, useState } from "react";
import { getEffectiveTeam, onStoreChange, EffectiveTeamMember } from "@/lib/store";
import { TEAM } from "@/lib/content";
import { Star } from "@/components/Motifs";

// The public "people behind the magic" grid. Reads the admin-editable team;
// starts from the seed so the first paint matches, then loads live edits.
export function AboutTeam() {
  const [team, setTeam] = useState<EffectiveTeamMember[]>(
    () => TEAM.map((m, i) => ({ ...m, hidden: false, order: i })),
  );

  useEffect(() => {
    const sync = () => setTeam(getEffectiveTeam());
    sync();
    return onStoreChange(sync);
  }, []);

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((m) => (
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
  );
}
