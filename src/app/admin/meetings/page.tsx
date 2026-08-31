"use client";

import { useEffect, useState } from "react";
import {
  getMeetings,
  addMeeting,
  updateMeeting,
  removeMeeting,
  onStoreChange,
  Meeting,
  MeetingType,
} from "@/lib/store";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

const TYPE_STYLES: Record<MeetingType, string> = {
  internal: "bg-forest/10 text-forest",
  client: "bg-firefly/15 text-firefly-deep",
  partner: "bg-twilight/10 text-twilight-light",
};

type Draft = Omit<Meeting, "id" | "archived">;
const EMPTY: Draft = { title: "", datetime: "", attendees: "", meetingUrl: "", type: "internal", notes: "" };

function fmt(dt: string) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setMeetings(getMeetings());
    sync();
    return onStoreChange(sync);
  }, []);

  const now = Date.now();
  const upcoming = meetings.filter((m) => !m.archived && +new Date(m.datetime) >= now).sort((a, b) => +new Date(a.datetime) - +new Date(b.datetime));
  const past = meetings.filter((m) => !m.archived && +new Date(m.datetime) < now).sort((a, b) => +new Date(b.datetime) - +new Date(a.datetime));
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function openNew() { setDraft(EMPTY); setEditing("new"); }
  function openEdit(m: Meeting) { const { id: _i, archived: _a, ...rest } = m; void _i; void _a; setDraft(rest); setEditing(m.id); }
  function save() {
    if (editing === "new") addMeeting(draft);
    else if (editing) updateMeeting(editing, draft);
    setEditing(null);
  }

  function Group({ title, items, badge }: { title: string; items: Meeting[]; badge: string }) {
    return (
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">{title} · {items.length}</h2>
        <div className="space-y-3">
          {items.map((m) => (
            <Panel key={m.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${TYPE_STYLES[m.type]}`}>{m.type}</span>
                    <p className="font-medium text-forest-deep">{m.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">{fmt(m.datetime)}{m.attendees && ` · ${m.attendees}`}{m.notes && ` · ${m.notes}`}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {m.meetingUrl && (
                    <a href={m.meetingUrl} target="_blank" rel="noopener noreferrer" className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${badge === "upcoming" ? "bg-forest hover:bg-forest-deep" : "bg-ink-faint"}`}>
                      {badge === "upcoming" ? "Join ↗" : "Link ↗"}
                    </a>
                  )}
                  <button onClick={() => openEdit(m)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
                  {confirmRemove === m.id ? (
                    <button onClick={() => { removeMeeting(m.id); setConfirmRemove(null); }} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">Confirm?</button>
                  ) : (
                    <button onClick={() => setConfirmRemove(m.id)} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                  )}
                </div>
              </div>
            </Panel>
          ))}
          {items.length === 0 && <p className="text-sm text-ink-faint">None.</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminHeader
        title="Meetings"
        subtitle="All meetings, auto-split into Upcoming and Past. Add join links (Zoom/Meet/Teams) so the team can jump straight in."
        action={<button onClick={openNew} className="btn-primary !py-2 text-xs">+ Add meeting</button>}
      />
      <div className="space-y-8">
        <Group title="Upcoming" items={upcoming} badge="upcoming" />
        <Group title="Past" items={past} badge="past" />
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{editing === "new" ? "Add Meeting" : "Edit Meeting"}</h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Title</span><input className={input} value={draft.title} onChange={(e) => set({ title: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Date &amp; time</span><input type="datetime-local" className={input} value={draft.datetime} onChange={(e) => set({ datetime: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Type</span>
                <select className={input} value={draft.type} onChange={(e) => set({ type: e.target.value as MeetingType })}>
                  <option value="internal">Internal</option><option value="client">Client</option><option value="partner">Partner</option>
                </select>
              </label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Attendees</span><input className={input} value={draft.attendees} onChange={(e) => set({ attendees: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Join link (Zoom / Meet / Teams)</span><input className={input} value={draft.meetingUrl} onChange={(e) => set({ meetingUrl: e.target.value })} placeholder="https://…" /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Notes</span><textarea rows={2} className={input} value={draft.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={save} disabled={!draft.title.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{editing === "new" ? "Add Meeting" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
