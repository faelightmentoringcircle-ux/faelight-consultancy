"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, CategorySlug, Service } from "@/lib/content";
import {
  getServiceOverrides,
  saveServiceOverride,
  resetServiceOverrides,
  allServices,
  getCustomServices,
  addCustomService,
  deleteService,
  restoreService,
  purgeService,
  purgeExpiredServices,
  setServiceOrder,
  SERVICE_TRASH_DAYS,
  onStoreChange,
  ServiceOverride,
} from "@/lib/store";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

export default function ServicesAdminPage() {
  const [overrides, setOverrides] = useState<Record<string, ServiceOverride>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [customIds, setCustomIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showTrash, setShowTrash] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", categorySlug: "mentoring" as CategorySlug, description: "", bestFor: "", priceLabel: "", showPrice: true });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Reorder a service within its category by dropping it onto another row.
  function reorder(catSlug: CategorySlug, targetId: string) {
    const drag = dragId;
    setDragId(null);
    setDragOverId(null);
    if (!drag || drag === targetId) return;
    const ids = services
      .filter((s) => s.categorySlug === catSlug && !overrides[s.id]?.deletedAt)
      .sort((a, b) => (overrides[a.id]?.sort ?? a.sort) - (overrides[b.id]?.sort ?? b.sort))
      .map((s) => s.id);
    if (!ids.includes(drag) || !ids.includes(targetId)) return; // only within the same category
    ids.splice(ids.indexOf(drag), 1);
    ids.splice(ids.indexOf(targetId), 0, drag);
    setServiceOrder(ids);
  }

  useEffect(() => {
    purgeExpiredServices();
    const sync = () => {
      setOverrides(getServiceOverrides());
      setServices(allServices());
      setCustomIds(new Set(getCustomServices().map((s) => s.id)));
    };
    sync();
    return onStoreChange(sync);
  }, []);

  const trashed = services.filter((s) => overrides[s.id]?.deletedAt);
  const toggleCat = (slug: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  function addService() {
    if (!draft.name.trim()) return;
    const s = addCustomService({
      categorySlug: draft.categorySlug,
      name: draft.name.trim(),
      description: draft.description.trim(),
      priceLabel: draft.priceLabel.trim() || "Price on request",
      bestFor: draft.bestFor.trim(),
      isBookable: false,
    });
    saveServiceOverride(s.id, { showPrice: draft.showPrice });
    setAdding(false);
    setDraft({ name: "", categorySlug: "mentoring", description: "", bestFor: "", priceLabel: "", showPrice: true });
  }

  function daysLeft(deletedAt: string) {
    return Math.max(0, SERVICE_TRASH_DAYS - Math.floor((Date.now() - +new Date(deletedAt)) / 86400000));
  }

  return (
    <>
      <AdminHeader
        title="Services & Pricing"
        subtitle="Add, edit, archive or delete services. Drag the ⠿ handle to reorder within a category. Edits flow live to the public Pricing page and the brochures/PDFs. Prices show by default — untick “Show this price” to hide one."
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTrash((s) => !s)} className="btn-ghost !px-4 !py-2 text-sm">
              🗑 Trash{trashed.length ? ` (${trashed.length})` : ""}
            </button>
            <button onClick={() => setAdding(true)} className="btn-primary !px-4 !py-2 text-sm">+ Add service</button>
            {Object.keys(overrides).length > 0 && (
              <button
                onClick={() => { if (confirm("Revert ALL service edits (including archives & trash) to the seeded content?")) resetServiceOverrides(); }}
                className="btn-ghost !px-4 !py-2 text-sm"
              >
                ↺ Revert
              </button>
            )}
          </div>
        }
      />

      {showTrash && (
        <Panel className="mb-6 border-rose-200 bg-rose-50/40">
          <h2 className="font-serif text-lg text-forest-deep">🗑 Trash · kept {SERVICE_TRASH_DAYS} days</h2>
          <p className="text-xs text-ink-faint">Deleted services are recoverable here until the retention window ends, then they&rsquo;re permanently removed.</p>
          <div className="mt-3 space-y-2">
            {trashed.length === 0 && <p className="text-sm text-ink-faint">Trash is empty.</p>}
            {trashed.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-white/70 p-3">
                <div>
                  <p className="font-medium text-forest-deep">{s.name}</p>
                  <p className="text-[11px] text-ink-faint">
                    Deleted · {daysLeft(overrides[s.id]!.deletedAt!)} day(s) left before permanent removal
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => restoreService(s.id)} className="rounded-lg border border-forest/30 px-3 py-1.5 text-xs font-semibold text-forest hover:border-firefly">Restore</button>
                  <button
                    onClick={() => { if (confirm(`Permanently delete "${s.name}"? This cannot be undone.`)) purgeService(s.id); }}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Delete permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className="mb-6 rounded-xl border border-firefly/25 bg-firefly/8 p-4 text-sm text-ink-soft">
        <span className="font-semibold text-forest-deep">✦ Demo note:</span> edits save to your local working copy.
        In production they write to the database and flow to the public pages automatically.
      </div>

      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const list = services
            .filter((s) => s.categorySlug === cat.slug && !overrides[s.id]?.deletedAt)
            .sort((a, b) => (overrides[a.id]?.sort ?? a.sort) - (overrides[b.id]?.sort ?? b.sort));
          const isCollapsed = collapsed.has(cat.slug);
          return (
            <Panel key={cat.slug} className="!p-0">
              <button
                onClick={() => toggleCat(cat.slug)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <h2 className="font-serif text-xl text-forest-deep">
                  <span className="text-firefly">✦</span> {cat.name}
                  <span className="ml-2 text-sm font-normal text-ink-faint">({list.length})</span>
                </h2>
                <span className={`text-ink-faint transition-transform ${isCollapsed ? "" : "rotate-90"}`}>▶</span>
              </button>

              {!isCollapsed && (
                <div className="space-y-3 px-5 pb-5">
                  {list.length === 0 && <p className="text-sm text-ink-faint">No services in this category.</p>}
                  {list.map((s) => {
                    const o = overrides[s.id] ?? {};
                    const merged = {
                      name: o.name?.trim() ? o.name.trim() : s.name,
                      priceLabel: o.priceLabel ?? s.priceLabel,
                      description: o.description ?? s.description,
                      bestFor: o.bestFor ?? s.bestFor,
                      active: o.active ?? true,
                      showPrice: o.showPrice ?? true,
                      archived: o.archived ?? false,
                    };
                    const isOpen = editing === s.id;
                    return (
                      <div
                        key={s.id}
                        draggable={!isOpen}
                        onDragStart={(e) => { setDragId(s.id); e.dataTransfer.effectAllowed = "move"; }}
                        onDragOver={(e) => { e.preventDefault(); if (dragId && dragId !== s.id) setDragOverId(s.id); }}
                        onDragLeave={() => setDragOverId((d) => (d === s.id ? null : d))}
                        onDrop={() => reorder(cat.slug, s.id)}
                        onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                        className={`rounded-xl border bg-parchment-card p-4 transition ${merged.archived ? "opacity-60" : ""} ${dragId === s.id ? "opacity-40" : ""} ${dragOverId === s.id ? "border-firefly ring-2 ring-firefly/30" : "border-firefly/15"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-2">
                            {!isOpen && (
                              <span className="mt-0.5 cursor-grab select-none text-ink-faint/60 active:cursor-grabbing" title="Drag to reorder">⠿</span>
                            )}
                            <div className="min-w-0">
                            <p className="font-medium text-forest-deep">
                              {merged.name}
                              {customIds.has(s.id) && <span className="ml-2 rounded-full bg-twilight/10 px-2 py-0.5 text-[10px] font-semibold text-twilight-light">custom</span>}
                              {merged.archived && <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">archived</span>}
                            </p>
                            {!isOpen && (
                              <>
                                <p className="mt-1 text-sm text-ink-soft">{merged.description}</p>
                                <p className="mt-1 text-xs text-ink-faint">Best for: {merged.bestFor}</p>
                              </>
                            )}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <span className="whitespace-nowrap text-sm">
                              <span className={merged.showPrice ? "font-semibold text-firefly-deep" : "text-ink-faint line-through"}>{merged.priceLabel}</span>
                              {!merged.showPrice && <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">price hidden</span>}
                            </span>
                            <div className="flex gap-1.5">
                              <button onClick={() => setEditing(isOpen ? null : s.id)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">{isOpen ? "Close" : "Edit"}</button>
                              <button onClick={() => saveServiceOverride(s.id, { archived: !merged.archived })} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10">{merged.archived ? "Unarchive" : "Archive"}</button>
                              <button
                                onClick={() => { if (confirm(`Move "${s.name}" to trash? It will be kept for ${SERVICE_TRASH_DAYS} days, then permanently deleted.`)) deleteService(s.id); }}
                                className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="mt-4 grid gap-3 border-t border-firefly/15 pt-4">
                            <FieldRow label="Service name">
                              <input defaultValue={merged.name} onBlur={(e) => saveServiceOverride(s.id, { name: e.target.value })} className={input} />
                            </FieldRow>
                            <FieldRow label="Price label">
                              <input defaultValue={merged.priceLabel} onBlur={(e) => saveServiceOverride(s.id, { priceLabel: e.target.value })} className={input} />
                            </FieldRow>
                            <label className="flex items-center gap-2 text-sm text-ink-soft">
                              <input type="checkbox" checked={merged.showPrice} onChange={(e) => saveServiceOverride(s.id, { showPrice: e.target.checked })} className="h-4 w-4 rounded border-firefly/40 text-forest focus:ring-firefly" />
                              Show this price on the public menu
                            </label>
                            <FieldRow label="Description">
                              <textarea defaultValue={merged.description} rows={2} onBlur={(e) => saveServiceOverride(s.id, { description: e.target.value })} className={input} />
                            </FieldRow>
                            <FieldRow label="Best for">
                              <input defaultValue={merged.bestFor} onBlur={(e) => saveServiceOverride(s.id, { bestFor: e.target.value })} className={input} />
                            </FieldRow>
                            <label className="flex items-center gap-2 text-sm text-ink-soft">
                              <input type="checkbox" checked={merged.active} onChange={(e) => saveServiceOverride(s.id, { active: e.target.checked })} className="h-4 w-4 rounded border-firefly/40 text-forest focus:ring-firefly" />
                              Active (shown on the public site)
                            </label>
                            <p className="text-xs text-ink-faint">Changes save automatically when you click away.</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          );
        })}
      </div>

      {/* Add service modal */}
      {adding && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">Add Service</h2>
              <button onClick={() => setAdding(false)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 space-y-4">
              <FieldRow label="Service name"><input className={input} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></FieldRow>
              <FieldRow label="Category">
                <select className={input} value={draft.categorySlug} onChange={(e) => setDraft((d) => ({ ...d, categorySlug: e.target.value as CategorySlug }))}>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="Description"><textarea rows={2} className={input} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} /></FieldRow>
              <FieldRow label="Best for"><input className={input} value={draft.bestFor} onChange={(e) => setDraft((d) => ({ ...d, bestFor: e.target.value }))} /></FieldRow>
              <FieldRow label="Price label"><input className={input} value={draft.priceLabel} onChange={(e) => setDraft((d) => ({ ...d, priceLabel: e.target.value }))} placeholder="e.g. from ₱5,000" /></FieldRow>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" checked={draft.showPrice} onChange={(e) => setDraft((d) => ({ ...d, showPrice: e.target.checked }))} className="h-4 w-4 rounded border-firefly/40 text-forest focus:ring-firefly" />
                Show this price on the public menu
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setAdding(false)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={addService} disabled={!draft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">Add Service</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</label>
      {children}
    </div>
  );
}
