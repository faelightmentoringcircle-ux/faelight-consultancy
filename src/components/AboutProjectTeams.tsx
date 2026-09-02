"use client";

import { useEffect, useState } from "react";
import { getProjectTeams, onStoreChange, ProjectTeam } from "@/lib/store";
import { PROJECT_TEAMS } from "@/lib/content";

// "How the work gets done" project-teams grid on the public About page.
// Reads the admin-editable list; seed fallback for the first paint.
export function AboutProjectTeams() {
  const [teams, setTeams] = useState<ProjectTeam[]>(PROJECT_TEAMS);
  useEffect(() => {
    const sync = () => setTeams(getProjectTeams());
    sync();
    return onStoreChange(sync);
  }, []);

  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-3">
      {teams.map((t) => (
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
  );
}
