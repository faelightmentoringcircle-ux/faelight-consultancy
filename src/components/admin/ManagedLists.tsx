"use client";

import { useEffect, useState } from "react";
import {
  onStoreChange,
  getLeadSourceOptions, setLeadSourceOptions,
  getRegTierOptions, setRegTierOptions,
  getBlogTagOptions, setBlogTagOptions,
  getBrandGroupOptions, setBrandGroupOptions,
} from "@/lib/store";
import { Panel } from "@/components/admin/ui";

// One editable option list (chips + add). Used for the small admin dropdowns.
function ListManager({ title, description, get, set }: {
  title: string; description?: string; get: () => string[]; set: (list: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>([]);
  const [adding, setAdding] = useState("");
  useEffect(() => {
    const sync = () => setItems(get());
    sync();
    return onStoreChange(sync);
  }, [get]);
  const add = () => { const n = adding.trim(); if (n && !items.includes(n)) set([...items, n]); setAdding(""); };
  const remove = (s: string) => set(items.filter((x) => x !== s));
  return (
    <div className="rounded-xl border border-firefly/15 bg-white/60 p-3">
      <p className="text-sm font-semibold text-forest-deep">{title}</p>
      {description && <p className="text-[11px] text-ink-faint">{description}</p>}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-firefly/12 px-2.5 py-1 text-xs font-medium text-forest-deep">
            {s}
            <button type="button" onClick={() => remove(s)} className="text-ink-faint hover:text-rose-600" aria-label={`Remove ${s}`}>✕</button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-ink-faint">No options yet.</span>}
      </div>
      <div className="mt-2 flex gap-1.5">
        <input value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Add an option…" className="flex-1 rounded-lg border border-firefly/25 bg-white px-3 py-1.5 text-sm outline-none focus:border-firefly" />
        <button type="button" onClick={add} disabled={!adding.trim()} className="btn-primary !py-1.5 text-xs disabled:opacity-50">+ Add</button>
      </div>
    </div>
  );
}

// Central place to curate the small dropdown option lists used around the admin.
export function ManagedListsPanel() {
  return (
    <Panel className="mt-6">
      <h2 className="font-serif text-xl text-forest-deep">Dropdown option lists</h2>
      <p className="mt-1 text-xs text-ink-faint">Curate the choices that appear in dropdowns around the admin. Add or remove options anytime.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ListManager title="Lead sources" description="Contacts & Registrations — where a lead came from." get={getLeadSourceOptions} set={setLeadSourceOptions} />
        <ListManager title="Registration tiers" description="Registrations — Regular / VIP / Scholar, etc." get={getRegTierOptions} set={setRegTierOptions} />
        <ListManager title="Blog tags" description="Blog — the tag choices for posts." get={getBlogTagOptions} set={setBlogTagOptions} />
        <ListManager title="Brand groups" description="Marketing → Brands — the group buckets." get={getBrandGroupOptions} set={setBrandGroupOptions} />
      </div>
    </Panel>
  );
}
