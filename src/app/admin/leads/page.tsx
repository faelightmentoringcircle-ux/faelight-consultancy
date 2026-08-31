"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getLeads, updateLead, onStoreChange, Lead, LEAD_STATUSES, LeadStatus } from "@/lib/store";
import { CATEGORIES, SERVICES } from "@/lib/content";
import { relativeDay } from "@/lib/format";
import { AdminHeader, Panel, LeadBadge, CategoryTag } from "@/components/admin/ui";

const STAGE_ACCENT: Record<LeadStatus, string> = {
  new: "bg-blue-400",
  contacted: "bg-amber-400",
  "discovery booked": "bg-violet-400",
  "proposal sent": "bg-indigo-400",
  won: "bg-emerald-500",
  lost: "bg-stone-400",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"table" | "board">("board");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStatus | null>(null);

  useEffect(() => {
    const sync = () => setLeads(getLeads());
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

  const counts = LEAD_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});

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
          </div>
        }
      />

      {/* Status filter chips (table view only) */}
      {view === "table" && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Chip active={status === "all"} onClick={() => setStatus("all")}>All · {leads.length}</Chip>
          {LEAD_STATUSES.map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              <span className="capitalize">{s}</span> · {counts[s]}
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
          {LEAD_STATUSES.map((stage) => {
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
                  <span className={`h-2.5 w-2.5 rounded-full ${STAGE_ACCENT[stage]}`} />
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest-deep">{stage}</p>
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
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-ink-faint">{relativeDay(l.createdAt)}</span>
                          <select
                            value={l.status}
                            onChange={(e) => updateLead(l.id, { status: e.target.value as LeadStatus })}
                            className="rounded-lg border border-firefly/20 bg-white/70 px-1.5 py-0.5 text-[10px] capitalize text-ink-soft outline-none focus:border-firefly"
                            aria-label="Move to stage"
                          >
                            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
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
                      <Link href={`/admin/leads/view?id=${l.id}`} className="text-xs font-semibold text-firefly-deep hover:underline">
                        Open →
                      </Link>
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
    </>
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
