"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getJourneyCards, addJourneyCard, updateJourneyCard, removeJourneyCard,
  getJourneyStages, addJourneyStage, renameJourneyStage, removeJourneyStage,
  nextProjectNo, getClients, effectiveServices, onStoreChange, JourneyCard, JourneyStage,
} from "@/lib/store";
import { CATEGORIES, CategorySlug } from "@/lib/content";
import { relativeDay } from "@/lib/format";
import { AdminHeader } from "@/components/admin/ui";

const fInput = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const fLbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

const STAGE_ACCENT: Record<string, string> = {
  "New Leads": "bg-blue-400",
  Contacted: "bg-amber-400",
  Proposal: "bg-violet-400",
  Negotiation: "bg-indigo-400",
  Execution: "bg-teal-500",
  Closed: "bg-emerald-500",
  Upsell: "bg-firefly",
};
const accent = (stage: string) => STAGE_ACCENT[stage] ?? "bg-firefly/50";
const catName = (slug?: CategorySlug | null) => (slug ? CATEGORIES.find((c) => c.slug === slug)?.name : null);

interface Draft {
  projectNo: string; client: string; company: string;
  categorySlug: string; contact: string; value: string; notes: string; stage: JourneyStage;
}

export default function JourneyPage() {
  const [cards, setCards] = useState<JourneyCard[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<JourneyStage | null>(null);
  const [manageStage, setManageStage] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [editing, setEditing] = useState<JourneyCard | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const sync = () => { setCards(getJourneyCards()); setStages(getJourneyStages()); };
    sync();
    return onStoreChange(sync);
  }, []);

  const filtered = useMemo(() => cards.filter((c) => {
    if (c.archived) return false;
    if (cat !== "all" && c.categorySlug !== cat) return false;
    if (q) {
      const hay = `${c.client} ${c.company ?? ""} ${c.projectNo} ${c.contact ?? ""} ${c.notes ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [cards, cat, q]);

  // Columns = managed stages + any orphan stage a card still uses.
  const boardStages = [
    ...stages,
    ...Array.from(new Set(cards.map((c) => c.stage).filter((s) => s && !stages.includes(s)))),
  ];

  return (
    <>
      <AdminHeader
        title="Client Journey"
        subtitle={`${filtered.length} active · drag a card to move it along`}
        action={
          <div className="flex items-center gap-3">
            <button onClick={() => setManageStage(true)} className="btn-ghost !py-2 text-xs">⚙ Manage stages</button>
            <button onClick={() => setAdding(true)} className="btn-primary !py-2 text-xs">+ Add client</button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search client, company, project no, notes…"
          className="flex-1 rounded-xl border border-firefly/25 bg-parchment-card px-4 py-2.5 text-sm outline-none focus:border-firefly"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-xl border border-firefly/25 bg-parchment-card px-4 py-2.5 text-sm outline-none focus:border-firefly"
          aria-label="Filter by sub-brand"
        >
          <option value="all">All sub-brands</option>
          {CATEGORIES.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
        </select>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {boardStages.map((stage) => {
          const col = filtered.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
              onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
              onDrop={() => { if (dragId) updateJourneyCard(dragId, { stage }); setDragId(null); setOverStage(null); }}
              className={`w-72 shrink-0 rounded-2xl border p-3 transition ${
                overStage === stage ? "border-firefly bg-firefly/8" : "border-firefly/20 bg-parchment-warm/40"
              }`}
            >
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={`h-2.5 w-2.5 rounded-full ${accent(stage)}`} />
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-deep">{stage}</p>
                <span className="ml-auto rounded-full bg-white px-2 text-[11px] font-medium text-ink-faint ring-1 ring-firefly/20">{col.length}</span>
              </div>
              <div className="space-y-2">
                {col.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => { setDragId(null); setOverStage(null); }}
                    className={`cursor-grab rounded-xl border border-firefly/15 bg-parchment-card p-3 shadow-sm active:cursor-grabbing ${dragId === c.id ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => setEditing(c)} className="text-left text-sm font-semibold text-forest-deep hover:underline">{c.client}</button>
                      {catName(c.categorySlug) && <span className="shrink-0 rounded-full bg-firefly/15 px-2 py-0.5 text-[10px] font-semibold text-firefly-deep">{catName(c.categorySlug)}</span>}
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-firefly-deep">{c.projectNo}</p>
                    {c.company && <p className="text-[11px] text-ink-faint">{c.company}</p>}
                    {c.value && <p className="mt-1 text-[11px] font-medium text-forest">{c.value}</p>}
                    {c.notes && <p className="mt-1 line-clamp-2 text-[11px] italic text-ink-soft">“{c.notes}”</p>}
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <span className="text-[10px] text-ink-faint">{relativeDay(c.createdAt)}</span>
                      <div className="flex items-center gap-1">
                        <select
                          value={c.stage}
                          onChange={(e) => updateJourneyCard(c.id, { stage: e.target.value })}
                          className="rounded-lg border border-firefly/20 bg-white/70 px-1.5 py-0.5 text-[10px] text-ink-soft outline-none focus:border-firefly"
                          aria-label="Move to stage"
                        >
                          {stages.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => setEditing(c)} className="rounded-md border border-firefly/20 px-1.5 py-0.5 text-[10px] font-semibold text-forest hover:bg-firefly/10" aria-label="Edit">✎</button>
                        {confirmRemove === c.id ? (
                          <button onClick={() => { removeJourneyCard(c.id); setConfirmRemove(null); }} className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white" aria-label="Confirm delete">✓</button>
                        ) : (
                          <button onClick={() => setConfirmRemove(c.id)} className="rounded-md border border-rose-200 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500 hover:bg-rose-50" aria-label="Delete">✕</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {col.length === 0 && <p className="px-1 py-4 text-center text-[11px] text-ink-faint">Drop a client here</p>}
              </div>
            </div>
          );
        })}
      </div>

      {(adding || editing) && (
        <CardModal
          card={editing}
          stages={stages}
          onClose={() => { setAdding(false); setEditing(null); }}
        />
      )}
      {manageStage && <StageManager stages={stages} cards={cards} onClose={() => setManageStage(false)} />}
    </>
  );
}

function CardModal({ card, stages, onClose }: { card: JourneyCard | null; stages: string[]; onClose: () => void }) {
  const [d, setDraft] = useState<Draft>(() => ({
    projectNo: card?.projectNo ?? nextProjectNo(),
    client: card?.client ?? "",
    company: card?.company ?? "",
    categorySlug: card?.categorySlug ?? "",
    contact: card?.contact ?? "",
    value: card?.value ?? "",
    notes: card?.notes ?? "",
    stage: card?.stage ?? stages[0] ?? "New Leads",
  }));
  const set = (patch: Partial<Draft>) => setDraft((x) => ({ ...x, ...patch }));

  const clients = useMemo(() => getClients().filter((c) => !c.archived), []);
  const services = useMemo(() => effectiveServices(), []);
  // Packages for the value dropdown — narrowed to the chosen sub-brand if any.
  const packages = useMemo(
    () => services.filter((s) => !d.categorySlug || s.categorySlug === d.categorySlug),
    [services, d.categorySlug],
  );

  // Picking a known client auto-fills company + contact.
  function onClientChange(val: string) {
    const match = clients.find((c) => c.name.toLowerCase() === val.trim().toLowerCase());
    setDraft((x) => ({
      ...x,
      client: val,
      company: match ? match.company : x.company,
      contact: match ? (match.email || match.phone || x.contact) : x.contact,
    }));
  }

  function save() {
    const payload = {
      projectNo: d.projectNo.trim(),
      client: d.client.trim(),
      company: d.company.trim() || undefined,
      categorySlug: (d.categorySlug || null) as CategorySlug | null,
      contact: d.contact.trim() || undefined,
      value: d.value.trim() || undefined,
      notes: d.notes.trim() || undefined,
      stage: d.stage,
    };
    if (card) updateJourneyCard(card.id, payload);
    else addJourneyCard(payload);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-forest-deep">{card ? "Edit client" : "Add client"}</h2>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>
        <p className="mt-1 text-xs text-ink-faint">One card per project. The same client can have several project numbers.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1"><span className={fLbl}>Project no.</span><input className={`${fInput} font-mono`} value={d.projectNo} onChange={(e) => set({ projectNo: e.target.value })} /></label>
          <label className="space-y-1"><span className={fLbl}>Stage</span>
            <select className={fInput} value={d.stage} onChange={(e) => set({ stage: e.target.value })}>
              {stages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-1"><span className={fLbl}>Client name *</span>
            <input className={fInput} value={d.client} onChange={(e) => onClientChange(e.target.value)} list="jc-clients" placeholder="Pick from client list or type…" />
            <datalist id="jc-clients">{clients.map((c) => <option key={c.id} value={c.name}>{c.company}</option>)}</datalist>
          </label>
          <label className="space-y-1"><span className={fLbl}>Company <span className="normal-case text-ink-faint/70">(auto)</span></span><input className={fInput} value={d.company} onChange={(e) => set({ company: e.target.value })} /></label>
          <label className="space-y-1"><span className={fLbl}>Sub-brand</span>
            <select className={fInput} value={d.categorySlug} onChange={(e) => set({ categorySlug: e.target.value })}>
              <option value="">— None —</option>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
          <label className="space-y-1"><span className={fLbl}>Contact (email / phone)</span><input className={fInput} value={d.contact} onChange={(e) => set({ contact: e.target.value })} /></label>
          <label className="space-y-1 sm:col-span-2"><span className={fLbl}>Value / package</span>
            <input className={fInput} value={d.value} onChange={(e) => set({ value: e.target.value })} list="jc-packages" placeholder="Pick a package from the system or type…" />
            <datalist id="jc-packages">
              {packages.map((s) => <option key={s.id} value={s.priceLabel ? `${s.name} · ${s.priceLabel}` : s.name} />)}
            </datalist>
          </label>
          <label className="space-y-1 sm:col-span-2"><span className={fLbl}>Notes</span><textarea rows={4} className={fInput} value={d.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Anything about this client / project…" /></label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost !py-2 text-xs">Cancel</button>
          <button onClick={save} disabled={!d.client.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{card ? "Save changes" : "Add client"}</button>
        </div>
      </div>
    </div>
  );
}

function StageManager({ stages, cards, onClose }: { stages: string[]; cards: JourneyCard[]; onClose: () => void }) {
  const [newName, setNewName] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const count = (s: string) => cards.filter((c) => c.stage === s && !c.archived).length;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-8 w-full max-w-md rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-forest-deep">Manage Journey Stages</h2>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>
        <p className="mt-1 text-xs text-ink-faint">These are your board columns. Renaming one updates every card using it.</p>
        <div className="mt-4 space-y-2">
          {stages.map((s, i) => (
            <div key={s} className="flex items-center gap-2 rounded-xl border border-firefly/15 bg-white/70 px-3 py-2">
              {editIdx === i ? (
                <input autoFocus className="min-w-0 flex-1 rounded-lg border border-firefly/30 px-2 py-1 text-sm outline-none focus:border-firefly" value={editVal} onChange={(e) => setEditVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { renameJourneyStage(s, editVal); setEditIdx(null); } }} />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-forest-deep">{s}</span>
              )}
              <span className="shrink-0 rounded-full bg-firefly/10 px-2 text-[11px] text-ink-faint">{count(s)}</span>
              {editIdx === i ? (
                <>
                  <button onClick={() => { renameJourneyStage(s, editVal); setEditIdx(null); }} className="shrink-0 rounded-lg bg-forest px-2 py-1 text-xs font-semibold text-parchment">Save</button>
                  <button onClick={() => setEditIdx(null)} className="shrink-0 text-xs text-ink-faint">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditIdx(i); setEditVal(s); }} className="shrink-0 rounded-lg border border-firefly/25 px-2 py-1 text-xs font-semibold text-forest hover:border-firefly">Edit</button>
                  <button onClick={() => { if (stages.length > 1 && confirm(`Remove "${s}"? Cards here move to another stage.`)) removeJourneyStage(s); }} disabled={stages.length <= 1} className="shrink-0 text-xs font-semibold text-ink-faint hover:text-rose-600 disabled:opacity-30">Remove</button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2 border-t border-firefly/15 pt-4">
          <input className="flex-1 rounded-xl border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly" placeholder="New stage name…" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { addJourneyStage(newName); setNewName(""); } }} />
          <button onClick={() => { if (newName.trim()) { addJourneyStage(newName); setNewName(""); } }} disabled={!newName.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">+ Add</button>
        </div>
      </div>
    </div>
  );
}
