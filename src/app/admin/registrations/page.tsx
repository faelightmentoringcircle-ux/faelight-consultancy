"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getRegistrations,
  addRegistration,
  updateRegistration,
  archiveRegistration,
  removeRegistration,
  onStoreChange,
  Registration,
  RegStatus,
  RegType,
} from "@/lib/store";
import { LEAD_SOURCES } from "@/lib/content";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";
const sel = "rounded-lg border border-firefly/25 bg-parchment-card px-3 py-2 text-sm outline-none focus:border-firefly";

const STATUS_STYLES: Record<RegStatus, string> = {
  registered: "bg-blue-100 text-blue-800",
  paid: "bg-emerald-100 text-emerald-700",
  completed: "bg-forest/10 text-forest",
  cancelled: "bg-stone-200 text-stone-600",
};

type Draft = Omit<Registration, "id" | "createdAt" | "archived">;
const EMPTY: Draft = {
  name: "", email: "", item: "Foundations Class", type: "class", batch: "", tier: "Regular",
  amountPaid: "", paymentMethod: "", datePaid: "", status: "registered", leadFrom: "", niche: "", notes: "",
};

export default function RegistrationsPage() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [fItem, setFItem] = useState("All");
  const [fBatch, setFBatch] = useState("All");
  const [fType, setFType] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setRegs(getRegistrations());
    sync();
    return onStoreChange(sync);
  }, []);

  const items = useMemo(() => ["All", ...Array.from(new Set(regs.map((r) => r.item))).sort()], [regs]);
  const batches = useMemo(() => ["All", ...Array.from(new Set(regs.map((r) => r.batch).filter(Boolean))).sort()], [regs]);

  const visible = regs
    .filter((r) => (showArchived ? r.archived : !r.archived))
    .filter((r) => fItem === "All" || r.item === fItem)
    .filter((r) => fBatch === "All" || r.batch === fBatch)
    .filter((r) => fType === "All" || r.type === fType);

  const activeCount = regs.filter((r) => !r.archived).length;
  const archivedCount = regs.filter((r) => r.archived).length;
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function openNew() { setDraft(EMPTY); setEditing("new"); }
  function openEdit(r: Registration) { const { id: _i, createdAt: _c, archived: _a, ...rest } = r; void _i; void _c; void _a; setDraft(rest); setEditing(r.id); }
  function save() {
    if (editing === "new") addRegistration(draft);
    else if (editing) updateRegistration(editing, draft);
    setEditing(null);
  }

  return (
    <>
      <AdminHeader
        title="Registrations & Enrollees"
        subtitle="Everyone who registered for a class/webinar or availed a service. Filter by item (e.g. Foundations Class) and batch to see enrollees; archived rows are the history."
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowArchived((s) => !s)} className="btn-ghost !py-2 text-xs">
              {showArchived ? `← Active (${activeCount})` : `History (${archivedCount})`}
            </button>
            <button onClick={openNew} className="btn-primary !py-2 text-xs">+ Add registration</button>
          </div>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-ink-faint">Item
          <select className={sel} value={fItem} onChange={(e) => setFItem(e.target.value)}>
            {items.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink-faint">Batch
          <select className={sel} value={fBatch} onChange={(e) => setFBatch(e.target.value)}>
            {batches.map((b) => <option key={b} value={b}>{b === "All" ? "All" : `Batch ${b}`}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink-faint">Type
          <select className={sel} value={fType} onChange={(e) => setFType(e.target.value)}>
            {["All", "class", "webinar", "service"].map((t) => <option key={t} value={t}>{t === "All" ? "All" : t}</option>)}
          </select>
        </label>
        <span className="ml-auto text-xs text-ink-faint">{visible.length} shown</span>
      </div>

      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-firefly/20 text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="py-2 pr-3 font-semibold">Name</th>
              <th className="py-2 pr-3 font-semibold">Registered for</th>
              <th className="py-2 pr-3 font-semibold">Batch</th>
              <th className="py-2 pr-3 font-semibold">Tier</th>
              <th className="py-2 pr-3 font-semibold">Amount</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2 pr-0 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b border-firefly/10 last:border-0">
                <td className="py-3 pr-3">
                  <p className="font-medium text-forest-deep">{r.name}</p>
                  {(r.email || r.leadFrom) && <p className="text-[11px] text-ink-faint">{r.email || r.leadFrom}</p>}
                </td>
                <td className="py-3 pr-3 text-ink-soft">
                  {r.item}
                  <span className="ml-1.5 rounded-full bg-forest/8 px-1.5 py-0.5 text-[10px] capitalize text-forest">{r.type}</span>
                </td>
                <td className="py-3 pr-3 text-ink-soft">{r.batch || "—"}</td>
                <td className="py-3 pr-3">
                  {r.tier ? <span className="rounded-full bg-firefly/12 px-2 py-0.5 text-[11px] font-semibold text-firefly-deep">{r.tier}</span> : <span className="text-ink-faint">—</span>}
                </td>
                <td className="py-3 pr-3 text-ink-soft">{r.amountPaid || "—"}{r.paymentMethod && <span className="block text-[10px] text-ink-faint">{r.paymentMethod}</span>}</td>
                <td className="py-3 pr-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[r.status]}`}>{r.status}</span></td>
                <td className="py-3 pr-0">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => openEdit(r)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
                    <button onClick={() => archiveRegistration(r.id, !r.archived)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10">{r.archived ? "Restore" : "Archive"}</button>
                    {confirmRemove === r.id ? (
                      <button onClick={() => { removeRegistration(r.id); setConfirmRemove(null); }} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">Confirm?</button>
                    ) : (
                      <button onClick={() => setConfirmRemove(r.id)} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-ink-faint">No registrations match.</td></tr>}
          </tbody>
        </table>
      </Panel>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{editing === "new" ? "Add Registration" : "Edit Registration"}</h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1"><span className={lbl}>Name</span><input className={input} value={draft.name} onChange={(e) => set({ name: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Email</span><input className={input} value={draft.email} onChange={(e) => set({ email: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Registered for</span><input className={input} value={draft.item} onChange={(e) => set({ item: e.target.value })} placeholder="Foundations Class" /></label>
              <label className="space-y-1"><span className={lbl}>Type</span>
                <select className={input} value={draft.type} onChange={(e) => set({ type: e.target.value as RegType })}>
                  <option value="class">Class</option><option value="webinar">Webinar</option><option value="service">Service</option>
                </select>
              </label>
              <label className="space-y-1"><span className={lbl}>Batch</span><input className={input} value={draft.batch} onChange={(e) => set({ batch: e.target.value })} placeholder="e.g. 3" /></label>
              <label className="space-y-1"><span className={lbl}>Tier</span>
                <select className={input} value={draft.tier} onChange={(e) => set({ tier: e.target.value })}>
                  {["Regular", "VIP", "Scholar", ""].map((t) => <option key={t} value={t}>{t || "—"}</option>)}
                </select>
              </label>
              <label className="space-y-1"><span className={lbl}>Amount paid</span><input className={input} value={draft.amountPaid} onChange={(e) => set({ amountPaid: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Payment method</span><input className={input} value={draft.paymentMethod} onChange={(e) => set({ paymentMethod: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Date paid</span><input type="date" className={input} value={draft.datePaid} onChange={(e) => set({ datePaid: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Status</span>
                <select className={input} value={draft.status} onChange={(e) => set({ status: e.target.value as RegStatus })}>
                  <option value="registered">Registered</option><option value="paid">Paid</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label className="space-y-1"><span className={lbl}>Lead from</span>
                {draft.viaWebsite ? (
                  <>
                    <input className={`${input} bg-firefly/8`} value="Website" readOnly title="This sign-up came from the website form — the source is fixed." />
                    <span className="text-[10px] text-ink-faint">🌐 From the website registration — source locked to “Website”.</span>
                  </>
                ) : (
                  <>
                    <input className={input} list="fae-lead-sources" value={draft.leadFrom} onChange={(e) => set({ leadFrom: e.target.value })} placeholder="Choose or type…" />
                    <datalist id="fae-lead-sources">{LEAD_SOURCES.map((s) => <option key={s} value={s} />)}</datalist>
                  </>
                )}
              </label>
              <label className="space-y-1"><span className={lbl}>Niche</span><input className={input} value={draft.niche} onChange={(e) => set({ niche: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Notes</span><textarea rows={2} className={input} value={draft.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={save} disabled={!draft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{editing === "new" ? "Add" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
