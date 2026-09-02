"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getTeam,
  addTeamMember,
  updateTeamMember,
  archiveTeamMember,
  removeTeamMember,
  onStoreChange,
  TeamMemberRecord,
} from "@/lib/store";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { WebsiteTeamEditor } from "@/components/admin/WebsiteTeamEditor";

const input = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

type Draft = Omit<TeamMemberRecord, "id" | "archived">;
const EMPTY: Draft = {
  name: "", fullName: "", role: "", discord: "", department: "", email: "", phone: "", birthday: "", notes: "", active: true,
};

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMemberRecord[]>([]);
  const [q, setQ] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setTeam(getTeam());
    sync();
    return onStoreChange(sync);
  }, []);

  const visible = useMemo(
    () =>
      team
        .filter((m) => (showArchived ? m.archived : !m.archived))
        .filter((m) => !q.trim() || [m.name, m.fullName, m.role, m.department, m.email].join(" ").toLowerCase().includes(q.toLowerCase())),
    [team, showArchived, q]
  );
  const activeCount = team.filter((m) => !m.archived).length;
  const archivedCount = team.filter((m) => m.archived).length;
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function openNew() { setDraft(EMPTY); setEditing("new"); }
  function openEdit(m: TeamMemberRecord) { const { id: _i, archived: _a, ...rest } = m; void _i; void _a; setDraft(rest); setEditing(m.id); }
  function save() {
    if (editing === "new") addTeamMember(draft);
    else if (editing) updateTeamMember(editing, draft);
    setEditing(null);
  }

  return (
    <>
      <AdminHeader
        title="Faelight Team"
        subtitle="Manage the public About-page team, plus the internal directory below."
      />

      {/* Public website team (the "people behind the magic" section) */}
      <WebsiteTeamEditor />

      {/* Internal team directory ------------------------------------------ */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-forest-deep">📇 Internal team directory</h2>
          <p className="text-xs text-ink-faint">Roles, departments and contact details (not shown on the public site).</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowArchived((s) => !s)} className="btn-ghost !py-2 text-xs">
            {showArchived ? `← Active (${activeCount})` : `Archived (${archivedCount})`}
          </button>
          <button onClick={openNew} className="btn-primary !py-2 text-xs">+ Add member</button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search team — name, role, department, email…"
          className="min-w-[240px] flex-1 rounded-full border border-firefly/25 bg-parchment-card px-4 py-2 text-sm outline-none focus:border-firefly"
        />
        <span className="text-xs text-ink-faint">{visible.length} shown</span>
      </div>

      <Panel className="!p-0">
        <div className="max-h-[calc(100vh-260px)] overflow-auto rounded-2xl">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-parchment-card">
              <tr className="border-b border-firefly/20 text-[11px] uppercase tracking-wide text-ink-faint shadow-[0_1px_0_rgba(230,183,82,0.25)]">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Full name</th>
                <th className="px-4 py-3 font-semibold">Role in Faelight</th>
                <th className="px-4 py-3 font-semibold">Discord</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Birthday</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={m.id} className="border-b border-firefly/10 align-top last:border-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-medium text-forest-deep">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[10px] font-bold text-firefly-bright">{m.name[0]}</span>
                      {m.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{m.fullName || "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{m.role || "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{m.discord || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-[220px] flex-wrap gap-1">
                      {m.department ? m.department.split(",").map((d) => d.trim()).filter(Boolean).map((d) => (
                        <span key={d} className="rounded-full bg-firefly/10 px-1.5 py-0.5 text-[10px] text-firefly-deep">{d}</span>
                      )) : <span className="text-ink-faint">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{m.email ? <span className="break-all">{m.email}</span> : "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{m.phone || "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{m.birthday || "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{m.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.active ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-600"}`}>
                      {m.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(m)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
                      <button onClick={() => archiveTeamMember(m.id, !m.archived)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10">{m.archived ? "Restore" : "Archive"}</button>
                      {confirmRemove === m.id ? (
                        <button onClick={() => { removeTeamMember(m.id); setConfirmRemove(null); }} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">Confirm?</button>
                      ) : (
                        <button onClick={() => setConfirmRemove(m.id)} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && <tr><td colSpan={11} className="px-4 py-8 text-center text-sm text-ink-faint">No team members match.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{editing === "new" ? "Add Team Member" : "Edit Team Member"}</h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1"><span className={lbl}>Name (nickname)</span><input className={input} value={draft.name} onChange={(e) => set({ name: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Full name</span><input className={input} value={draft.fullName} onChange={(e) => set({ fullName: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Role in Faelight</span><input className={input} value={draft.role} onChange={(e) => set({ role: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Department (comma-separated)</span><input className={input} value={draft.department} onChange={(e) => set({ department: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Discord</span><input className={input} value={draft.discord} onChange={(e) => set({ discord: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Email</span><input className={input} value={draft.email} onChange={(e) => set({ email: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Phone</span><input className={input} value={draft.phone} onChange={(e) => set({ phone: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Birthday</span><input className={input} value={draft.birthday} onChange={(e) => set({ birthday: e.target.value })} placeholder="February 13, 1980" /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Notes</span><textarea rows={2} className={input} value={draft.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={draft.active} onChange={(e) => set({ active: e.target.checked })} />
                <span className="text-sm text-ink-soft">Active</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={save} disabled={!draft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{editing === "new" ? "Add member" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
