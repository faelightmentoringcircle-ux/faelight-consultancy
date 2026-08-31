"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getPoolVAs,
  addPoolVA,
  updatePoolVA,
  archivePoolVA,
  removePoolVA,
  getClients,
  getRegistrations,
  getTeam,
  onStoreChange,
  PoolVA,
} from "@/lib/store";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input =
  "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

type Draft = Omit<PoolVA, "id" | "archived" | "niche" | "projects"> & {
  niche: string;
  projects: string;
};

const EMPTY: Draft = {
  name: "",
  photo: "",
  niche: "",
  cv: "",
  website: "",
  email: "",
  phone: "",
  deployedTo: "",
  deployment: "",
  status: "",
  projects: "",
  notes: "",
  batch: "",
  active: true,
};

function toDraft(v: PoolVA): Draft {
  return { ...v, niche: v.niche.join(", "), projects: v.projects.join(", ") };
}
function splitList(s: string) {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

// A person we can pick a VA name from, with fields to prefill.
type PersonRecord = { name: string; email?: string; phone?: string; batch?: string; niche?: string[]; from: string };

export default function AdminPoolPage() {
  const [vas, setVas] = useState<PoolVA[]>([]);
  const [clientNames, setClientNames] = useState<string[]>([]);
  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setVas(getPoolVAs());
      const names = new Set<string>(["Faelight"]);
      getClients()
        .filter((c) => !c.archived)
        .forEach((c) => {
          if (c.name) names.add(c.name);
          if (c.company) names.add(c.company);
        });
      setClientNames(Array.from(names).sort());

      // People you can pick a VA name from: enrollees, clients, team.
      const map = new Map<string, PersonRecord>();
      getRegistrations()
        .filter((r) => !r.archived)
        .forEach((r) => {
          if (r.name && !map.has(r.name)) map.set(r.name, { name: r.name, email: r.email, batch: r.batch, niche: r.niche ? [r.niche] : [], from: "Registration" });
        });
      getClients()
        .filter((c) => !c.archived)
        .forEach((c) => { if (c.name && !map.has(c.name)) map.set(c.name, { name: c.name, email: c.email, phone: c.phone, from: "Client" }); });
      getTeam().filter((t) => !t.archived).forEach((t) => {
        const nm = t.fullName || t.name;
        if (nm && !map.has(nm)) map.set(nm, { name: nm, email: t.email, phone: t.phone, from: "Team" });
      });
      setPeople(Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)));
    };
    sync();
    return onStoreChange(sync);
  }, []);


  // When a picked name matches a known person, prefill their details.
  function pickName(name: string) {
    const hit = people.find((p) => p.name.toLowerCase() === name.trim().toLowerCase());
    setDraft((d) => ({
      ...d,
      name,
      email: hit?.email || d.email,
      phone: hit?.phone || d.phone,
      batch: hit?.batch || d.batch,
      niche: hit?.niche && hit.niche.length ? hit.niche.join(", ") : d.niche,
    }));
  }

  const visible = useMemo(
    () =>
      vas
        .filter((v) => (showArchived ? v.archived : !v.archived))
        .filter((v) => !q.trim() || [v.name, v.status, v.deployedTo, ...v.niche].join(" ").toLowerCase().includes(q.toLowerCase())),
    [vas, showArchived, q]
  );
  const activeCount = vas.filter((v) => !v.archived).length;
  const archivedCount = vas.filter((v) => v.archived).length;

  function openNew() {
    setDraft(EMPTY);
    setEditing("new");
  }
  function openEdit(v: PoolVA) {
    setDraft(toDraft(v));
    setEditing(v.id);
  }
  function save() {
    const payload = {
      ...draft,
      niche: splitList(draft.niche),
      projects: splitList(draft.projects),
    };
    if (editing === "new") addPoolVA(payload);
    else if (editing) updatePoolVA(editing, payload);
    setEditing(null);
  }
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ photo: reader.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <>
      <AdminHeader
        title="Faelight Pool"
        subtitle="The VA talent pool shown on the public /pool page. Edit, archive or remove VAs."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchived((s) => !s)}
              className="btn-ghost !py-2 text-xs"
            >
              {showArchived ? `← Active (${activeCount})` : `Archived (${archivedCount})`}
            </button>
            <button onClick={openNew} className="btn-primary !py-2 text-xs">
              + Add VA
            </button>
          </div>
        }
      />

      {/* Control bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the Faelight list — name, niche, status, client…"
          className="min-w-[240px] flex-1 rounded-full border border-firefly/25 bg-parchment-card px-4 py-2 text-sm outline-none focus:border-firefly"
        />
        <span className="text-xs text-ink-faint">{visible.length} shown</span>
      </div>

      <Panel className="!p-0">
        <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-2xl">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-parchment-card">
              <tr className="border-b border-firefly/20 text-[11px] uppercase tracking-wide text-ink-faint shadow-[0_1px_0_rgba(230,183,82,0.25)]">
                <th className="px-4 py-3 font-semibold">VA name</th>
                <th className="px-4 py-3 font-semibold">Niche</th>
                <th className="px-4 py-3 font-semibold">Deployed to</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Résumé</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((v) => (
                <tr key={v.id} className="border-b border-firefly/10 align-top last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {v.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.photo} alt={v.name} className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-firefly/30" />
                      ) : (
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-[11px] font-bold text-firefly-bright">
                          {v.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-forest-deep">{v.name}</p>
                        <p className="text-[11px] text-ink-faint">{v.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[220px] flex-wrap gap-1">
                    {v.niche.slice(0, 4).map((n) => (
                      <span key={n} className="rounded-full bg-firefly/10 px-1.5 py-0.5 text-[10px] text-firefly-deep">
                        {n}
                      </span>
                    ))}
                    {v.niche.length > 4 && <span className="text-[10px] text-ink-faint">+{v.niche.length - 4}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{v.deployedTo || "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-forest/8 px-2 py-0.5 text-[11px] font-medium text-forest">
                    {v.status || (v.active ? "Active" : "Inactive")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {v.cv ? (
                    <a href={v.cv} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-firefly-deep hover:underline">
                      Open ↗
                    </a>
                  ) : (
                    <span className="text-xs text-ink-faint">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => openEdit(v)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">
                      Edit
                    </button>
                    <button
                      onClick={() => archivePoolVA(v.id, !v.archived)}
                      className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10"
                    >
                      {v.archived ? "Restore" : "Archive"}
                    </button>
                    {confirmRemove === v.id ? (
                      <button
                        onClick={() => {
                          removePoolVA(v.id);
                          setConfirmRemove(null);
                        }}
                        className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        Confirm?
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmRemove(v.id)}
                        className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-ink-faint">
                  {showArchived ? "No archived VAs." : "No VAs in the pool yet."}
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </Panel>

      {/* Edit / Add modal */}
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">
                {editing === "new" ? "Add VA to pool" : "Edit VA"}
              </h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 sm:col-span-2">
                {draft.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.photo} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-firefly/30" />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-forest/10 text-2xl text-firefly-deep">☺</span>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="cursor-pointer rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">
                    Upload profile photo
                    <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                  </label>
                  {draft.photo && <button type="button" onClick={() => set({ photo: "" })} className="text-left text-xs text-rose-600 hover:underline">Remove photo</button>}
                </div>
              </div>
              <label className="space-y-1">
                <span className={lbl}>Name <span className="text-ink-faint">(pick from records or type)</span></span>
                <input className={input} list="fae-people-list" value={draft.name} onChange={(e) => pickName(e.target.value)} placeholder="Choose an enrollee / client…" />
                <datalist id="fae-people-list">
                  {people.map((p) => (
                    <option key={`${p.from}-${p.name}`} value={p.name}>{p.from}</option>
                  ))}
                </datalist>
              </label>
              <label className="space-y-1"><span className={lbl}>Status</span><input className={input} value={draft.status} onChange={(e) => set({ status: e.target.value })} placeholder="e.g. Top Deployment" /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Niche (comma-separated)</span><input className={input} value={draft.niche} onChange={(e) => set({ niche: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Résumé / CV link</span><input className={input} value={draft.cv} onChange={(e) => set({ cv: e.target.value })} placeholder="https://…" /></label>
              <label className="space-y-1"><span className={lbl}>Website / links</span><input className={input} value={draft.website} onChange={(e) => set({ website: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Email</span><input className={input} value={draft.email} onChange={(e) => set({ email: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Phone</span><input className={input} value={draft.phone} onChange={(e) => set({ phone: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Batch</span><input className={input} value={draft.batch} onChange={(e) => set({ batch: e.target.value })} /></label>
              <label className="space-y-1">
                <span className={lbl}>Deployed to <span className="text-ink-faint">(from Client List)</span></span>
                <input className={input} list="fae-client-list" value={draft.deployedTo} onChange={(e) => set({ deployedTo: e.target.value })} placeholder="Choose a client…" />
                <datalist id="fae-client-list">
                  {clientNames.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </label>
              <label className="space-y-1"><span className={lbl}>Deployment</span><input className={input} value={draft.deployment} onChange={(e) => set({ deployment: e.target.value })} placeholder="Full Time / Part Time" /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Projects (comma-separated)</span><input className={input} value={draft.projects} onChange={(e) => set({ projects: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Notes</span><textarea rows={2} className={input} value={draft.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={draft.active} onChange={(e) => set({ active: e.target.checked })} />
                <span className="text-sm text-ink-soft">Active in pool</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={save} disabled={!draft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">
                {editing === "new" ? "Add VA" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
