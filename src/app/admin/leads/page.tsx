"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getLeads, updateLead, addLead, removeLead, onStoreChange, Lead, LeadStatus,
  getLeadStatuses, addLeadStatus, renameLeadStatus, removeLeadStatus,
} from "@/lib/store";
import { CATEGORIES, SERVICES, CategorySlug } from "@/lib/content";
import { relativeDay } from "@/lib/format";
import { AdminHeader, Panel, LeadBadge, CategoryTag } from "@/components/admin/ui";

const fInput = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const fLbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

interface LeadDraft {
  name: string; email: string; phone: string; company: string;
  categorySlug: string; serviceId: string; source: string; message: string;
  agreedToUpdates: boolean; status: LeadStatus;
}
const EMPTY_LEAD: LeadDraft = {
  name: "", email: "", phone: "", company: "",
  categorySlug: "", serviceId: "", source: "", message: "",
  agreedToUpdates: false, status: "new",
};

const STAGE_ACCENT: Record<string, string> = {
  new: "bg-blue-400",
  contacted: "bg-amber-400",
  "discovery booked": "bg-violet-400",
  "proposal sent": "bg-indigo-400",
  won: "bg-emerald-500",
  lost: "bg-stone-400",
};
const accent = (stage: string) => STAGE_ACCENT[stage] ?? "bg-firefly/50";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"table" | "board">("board");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStatus | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [manageStatus, setManageStatus] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<LeadDraft>(EMPTY_LEAD);
  const setD = (patch: Partial<LeadDraft>) => setDraft((d) => ({ ...d, ...patch }));

  function saveNewLead() {
    addLead({
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim() || undefined,
      company: draft.company.trim() || undefined,
      categorySlug: (draft.categorySlug || null) as CategorySlug | null,
      serviceId: draft.serviceId || null,
      message: draft.message.trim(),
      source: draft.source.trim() || "Manual",
      agreedToUpdates: draft.agreedToUpdates,
      status: draft.status,
    });
    setAdding(false);
    setDraft(EMPTY_LEAD);
  }

  useEffect(() => {
    const sync = () => { setLeads(getLeads()); setStatuses(getLeadStatuses()); };
    sync();
    return onStoreChange(sync);
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (cat !== "all" && l.categorySlug !== cat) return false;
      if (q) {
        const hay = `${l.name} ${l.email} ${l.company ?? ""} ${l.message}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [leads, status, cat, q]);

  const counts = statuses.reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});
  // Board columns = managed statuses + any orphan status a lead still uses.
  const boardStages = [
    ...statuses,
    ...Array.from(new Set(leads.map((l) => l.status).filter((s) => s && !statuses.includes(s)))),
  ];

  return (
    <>
      <AdminHeader
        title="Leads"
        subtitle={`${leads.length} total · ${filtered.length} shown`}
        action={
          <div className="flex items-center gap-3">
            <div className="flex rounded-full border border-firefly/25 bg-parchment-card p-1">
              <button onClick={() => setView("board")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${view === "board" ? "bg-forest text-parchment" : "text-ink-soft"}`}>▦ Board</button>
              <button onClick={() => setView("table")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${view === "table" ? "bg-forest text-parchment" : "text-ink-soft"}`}>☰ Table</button>
            </div>
            <div className="hidden rounded-xl border border-firefly/25 bg-parchment-card px-4 py-2 text-center sm:block">
              <p className="font-serif text-xl text-forest">{leads.filter((l) => l.agreedToUpdates).length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">on mailing list</p>
            </div>
            <button onClick={() => setManageStatus(true)} className="btn-ghost !py-2 text-xs">⚙ Manage statuses</button>
            <button onClick={() => { setDraft(EMPTY_LEAD); setAdding(true); }} className="btn-primary !py-2 text-xs">+ Add lead</button>
          </div>
        }
      />

      {/* Status filter chips (table view only) */}
      {view === "table" && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Chip active={status === "all"} onClick={() => setStatus("all")}>All · {leads.length}</Chip>
          {statuses.map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              <span className="capitalize">{s}</span> · {counts[s] ?? 0}
            </Chip>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, company, message…"
          className="flex-1 rounded-xl border border-firefly/25 bg-parchment-card px-4 py-2.5 text-sm outline-none focus:border-firefly"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-xl border border-firefly/25 bg-parchment-card px-4 py-2.5 text-sm outline-none focus:border-firefly"
        >
          <option value="all">All sub-brands</option>
          {CATEGORIES.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
        </select>
      </div>

      {view === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {boardStages.map((stage) => {
            const col = filtered.filter((l) => l.status === stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
                onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
                onDrop={() => {
                  if (dragId) updateLead(dragId, { status: stage });
                  setDragId(null);
                  setOverStage(null);
                }}
                className={`w-72 shrink-0 rounded-2xl border p-3 transition ${
                  overStage === stage ? "border-firefly bg-firefly/8" : "border-firefly/20 bg-parchment-warm/40"
                }`}
              >
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${accent(stage)}`} />
                  <p className="text-xs font-semibold uppercase tracking-wide capitalize text-forest-deep">{stage}</p>
                  <span className="ml-auto rounded-full bg-white px-2 text-[11px] font-medium text-ink-faint ring-1 ring-firefly/20">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map((l) => {
                    const svc = SERVICES.find((s) => s.id === l.serviceId);
                    return (
                      <div
                        key={l.id}
                        draggable
                        onDragStart={() => setDragId(l.id)}
                        onDragEnd={() => { setDragId(null); setOverStage(null); }}
                        className={`cursor-grab rounded-xl border border-firefly/15 bg-parchment-card p-3 shadow-sm active:cursor-grabbing ${dragId === l.id ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/admin/leads/view?id=${l.id}`} className="text-sm font-semibold text-forest-deep hover:underline">{l.name}</Link>
                          <CategoryTag slug={l.categorySlug} />
                        </div>
                        <p className="mt-0.5 text-[11px] text-ink-faint">{l.company || l.email}</p>
                        {svc && <p className="mt-1 text-[11px] text-ink-soft">{svc.name}</p>}
                        <div className="mt-2 flex items-center justify-between gap-1">
                          <span className="text-[10px] text-ink-faint">{relativeDay(l.createdAt)}</span>
                          <div className="flex items-center gap-1">
                            <select
                              value={l.status}
                              onChange={(e) => updateLead(l.id, { status: e.target.value })}
                              className="rounded-lg border border-firefly/20 bg-white/70 px-1.5 py-0.5 text-[10px] capitalize text-ink-soft outline-none focus:border-firefly"
                              aria-label="Move to stage"
                            >
                              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {confirmRemove === l.id ? (
                              <button onClick={() => { removeLead(l.id); setConfirmRemove(null); }} className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white" aria-label="Confirm delete">✓</button>
                            ) : (
                              <button onClick={() => setConfirmRemove(l.id)} className="rounded-md border border-rose-200 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500 hover:bg-rose-50" aria-label="Delete lead">✕</button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {col.length === 0 && <p className="px-1 py-4 text-center text-[11px] text-ink-faint">Drop a lead here</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "table" && (
      <Panel className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-firefly/20 text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Interest</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const svc = SERVICES.find((s) => s.id === l.serviceId);
                return (
                  <tr key={l.id} className="border-b border-firefly/10 transition hover:bg-firefly/5">
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/view?id=${l.id}`} className="font-medium text-forest-deep hover:underline">
                        {l.name}
                      </Link>
                      <p className="text-xs text-ink-faint">{l.company || l.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryTag slug={l.categorySlug} />
                      {svc && <p className="mt-1 text-xs text-ink-faint">{svc.name}</p>}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {l.source}
                      {l.utmSource && <p className="text-[11px] text-firefly-deep">utm: {l.utmSource}</p>}
                    </td>
                    <td className="px-4 py-3"><LeadBadge status={l.status} /></td>
                    <td className="px-4 py-3 text-ink-soft">{relativeDay(l.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/leads/view?id=${l.id}`} className="text-xs font-semibold text-firefly-deep hover:underline">
                          Open →
                        </Link>
                        {confirmRemove === l.id ? (
                          <button onClick={() => { removeLead(l.id); setConfirmRemove(null); }} className="rounded-md bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white">Confirm?</button>
                        ) : (
                          <button onClick={() => setConfirmRemove(l.id)} className="rounded-md border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-faint">No leads match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
      )}

      {adding && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">Add Lead</h2>
              <button onClick={() => setAdding(false)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <p className="mt-1 text-xs text-ink-faint">For leads from referrals, DMs, events, etc. Website inquiries land here automatically.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1"><span className={fLbl}>Name *</span><input className={fInput} value={draft.name} onChange={(e) => setD({ name: e.target.value })} /></label>
              <label className="space-y-1"><span className={fLbl}>Email</span><input className={fInput} type="email" value={draft.email} onChange={(e) => setD({ email: e.target.value })} /></label>
              <label className="space-y-1"><span className={fLbl}>Phone</span><input className={fInput} value={draft.phone} onChange={(e) => setD({ phone: e.target.value })} /></label>
              <label className="space-y-1"><span className={fLbl}>Company</span><input className={fInput} value={draft.company} onChange={(e) => setD({ company: e.target.value })} /></label>
              <label className="space-y-1"><span className={fLbl}>Sub-brand</span>
                <select className={fInput} value={draft.categorySlug} onChange={(e) => setD({ categorySlug: e.target.value, serviceId: "" })}>
                  <option value="">— None —</option>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </label>
              <label className="space-y-1"><span className={fLbl}>Service interest</span>
                <select className={fInput} value={draft.serviceId} onChange={(e) => setD({ serviceId: e.target.value })}>
                  <option value="">— None —</option>
                  {SERVICES.filter((s) => !draft.categorySlug || s.categorySlug === draft.categorySlug).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label className="space-y-1"><span className={fLbl}>Source</span><input className={fInput} value={draft.source} onChange={(e) => setD({ source: e.target.value })} placeholder="e.g. Referral, Instagram DM, Event" /></label>
              <label className="space-y-1"><span className={fLbl}>Status</span>
                <select className={fInput} value={draft.status} onChange={(e) => setD({ status: e.target.value })}>
                  {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </label>
              <label className="space-y-1 sm:col-span-2"><span className={fLbl}>Message / notes</span><textarea rows={3} className={fInput} value={draft.message} onChange={(e) => setD({ message: e.target.value })} /></label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={draft.agreedToUpdates} onChange={(e) => setD({ agreedToUpdates: e.target.checked })} />
                <span className="text-sm text-ink-soft">On the mailing list (agreed to updates)</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setAdding(false)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={saveNewLead} disabled={!draft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">Add lead</button>
            </div>
          </div>
        </div>
      )}

      {manageStatus && <LeadStatusManager statuses={statuses} leads={leads} onClose={() => setManageStatus(false)} />}
    </>
  );
}

// Add / rename / remove lead statuses (board columns) -----------------------
function LeadStatusManager({ statuses, leads, onClose }: { statuses: string[]; leads: Lead[]; onClose: () => void }) {
  const [newName, setNewName] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const count = (s: string) => leads.filter((l) => l.status === s).length;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-8 w-full max-w-md rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-forest-deep">Manage Lead Statuses</h2>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>
        <p className="mt-1 text-xs text-ink-faint">These are your pipeline stages. Renaming one updates every lead using it.</p>
        <div className="mt-4 space-y-2">
          {statuses.map((s, i) => (
            <div key={s} className="flex items-center gap-2 rounded-xl border border-firefly/15 bg-white/70 px-3 py-2">
              {editIdx === i ? (
                <input autoFocus className="min-w-0 flex-1 rounded-lg border border-firefly/30 px-2 py-1 text-sm outline-none focus:border-firefly" value={editVal} onChange={(e) => setEditVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { renameLeadStatus(s, editVal); setEditIdx(null); } }} />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm font-medium capitalize text-forest-deep">{s}</span>
              )}
              <span className="shrink-0 rounded-full bg-firefly/10 px-2 text-[11px] text-ink-faint">{count(s)}</span>
              {editIdx === i ? (
                <>
                  <button onClick={() => { renameLeadStatus(s, editVal); setEditIdx(null); }} className="shrink-0 rounded-lg bg-forest px-2 py-1 text-xs font-semibold text-parchment">Save</button>
                  <button onClick={() => setEditIdx(null)} className="shrink-0 text-xs text-ink-faint">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditIdx(i); setEditVal(s); }} className="shrink-0 rounded-lg border border-firefly/25 px-2 py-1 text-xs font-semibold text-forest hover:border-firefly">Edit</button>
                  <button onClick={() => { if (statuses.length > 1 && confirm(`Remove "${s}"? Leads here move to another stage.`)) removeLeadStatus(s); }} disabled={statuses.length <= 1} className="shrink-0 text-xs font-semibold text-ink-faint hover:text-rose-600 disabled:opacity-30">Remove</button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2 border-t border-firefly/15 pt-4">
          <input className="flex-1 rounded-xl border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly" placeholder="New status name…" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { addLeadStatus(newName); setNewName(""); } }} />
          <button onClick={() => { if (newName.trim()) { addLeadStatus(newName); setNewName(""); } }} disabled={!newName.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">+ Add</button>
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? "border-forest bg-forest text-parchment" : "border-firefly/25 bg-parchment-card text-ink-soft hover:border-firefly"
      }`}
    >
      {children}
    </button>
  );
}
