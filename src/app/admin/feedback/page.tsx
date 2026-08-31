"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getFeedback,
  updateFeedback,
  removeFeedback,
  feedbackAverage,
  onStoreChange,
  Feedback,
} from "@/lib/store";
import { formatDateShort } from "@/lib/format";
import { AdminHeader, Panel, StatTile } from "@/components/admin/ui";

function Stars({ n }: { n: number }) {
  return (
    <span className="text-firefly" aria-label={`${n} of 5`}>
      {"★".repeat(n)}
      <span className="text-firefly/25">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [fClass, setFClass] = useState("All");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setItems(getFeedback());
    sync();
    return onStoreChange(sync);
  }, []);

  const classes = useMemo(() => ["All", ...Array.from(new Set(items.map((f) => f.classTaken))).sort()], [items]);
  const visible = items
    .filter((f) => (showArchived ? f.archived : !f.archived))
    .filter((f) => fClass === "All" || f.classTaken === fClass);

  const active = items.filter((f) => !f.archived);
  const avg = feedbackAverage();
  const shareable = active.filter((f) => f.canShare).length;

  return (
    <>
      <AdminHeader
        title="Session Feedback"
        subtitle="What students said about your classes — collected on the site. Star the best ones and reuse them as testimonials."
        action={
          <button onClick={() => setShowArchived((s) => !s)} className="btn-ghost !py-2 text-xs">
            {showArchived ? `← Active (${active.length})` : `Archived (${items.filter((f) => f.archived).length})`}
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Average rating" value={avg ? `${avg} ★` : "—"} hint={`${active.length} responses`} accent="firefly" />
        <StatTile label="Responses" value={active.length} hint="not archived" accent="forest" />
        <StatTile label="Shareable" value={shareable} hint="opted in as testimonial" accent="twilight" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-ink-faint">Class
          <select className="rounded-lg border border-firefly/25 bg-parchment-card px-3 py-2 text-sm outline-none focus:border-firefly" value={fClass} onChange={(e) => setFClass(e.target.value)}>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <span className="ml-auto text-xs text-ink-faint">{visible.length} shown</span>
      </div>

      <div className="space-y-3">
        {visible.length === 0 && <Panel><p className="py-6 text-center text-ink-faint">No feedback yet.</p></Panel>}
        {visible.map((f) => (
          <Panel key={f.id} className={f.featured ? "border-firefly/50 bg-firefly/[0.04]" : ""}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-forest-deep">{f.name || "Anonymous"}</p>
                  <Stars n={f.rating} />
                  {f.featured && <span className="rounded-full bg-firefly/15 px-2 py-0.5 text-[10px] font-semibold text-firefly-deep">★ Featured</span>}
                  {f.canShare && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Can share</span>}
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {f.classTaken}{f.batch && ` · Batch ${f.batch}`} · {formatDateShort(f.createdAt)}{f.email && ` · ${f.email}`}
                </p>
                {f.liked && <p className="mt-2 text-sm text-ink-soft">“{f.liked}”</p>}
                {f.improve && <p className="mt-1.5 text-sm text-ink-faint"><span className="font-semibold uppercase tracking-wide text-[10px]">Suggests:</span> {f.improve}</p>}
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                <button onClick={() => updateFeedback(f.id, { featured: !f.featured })} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">
                  {f.featured ? "★ Unfeature" : "☆ Feature"}
                </button>
                <button onClick={() => updateFeedback(f.id, { archived: !f.archived })} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10">
                  {f.archived ? "Restore" : "Archive"}
                </button>
                {confirmRemove === f.id ? (
                  <button onClick={() => { removeFeedback(f.id); setConfirmRemove(null); }} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">Confirm?</button>
                ) : (
                  <button onClick={() => setConfirmRemove(f.id)} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                )}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
