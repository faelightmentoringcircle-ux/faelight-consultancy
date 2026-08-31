"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getProjects,
  addProject,
  updateProject,
  archiveProject,
  removeProject,
  projectTaskStats,
  getTasks,
  getClients,
  getProjectStatuses,
  addProjectStatus,
  renameProjectStatus,
  removeProjectStatus,
  onStoreChange,
  Project,
  ProjectStatus,
  Task,
  ClientContact,
} from "@/lib/store";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Planning: "bg-blue-100 text-blue-800",
  Active: "bg-amber-100 text-amber-800",
  "On hold": "bg-orange-100 text-orange-800",
  Done: "bg-emerald-100 text-emerald-700",
};
const STAGE_DOT: Record<ProjectStatus, string> = {
  Planning: "bg-blue-400",
  Active: "bg-amber-400",
  "On hold": "bg-orange-400",
  Done: "bg-emerald-500",
};
const TASK_BADGE: Record<string, string> = {
  "Not started": "bg-stone-200 text-stone-600",
  "In progress": "bg-amber-100 text-amber-800",
  "To Review": "bg-blue-100 text-blue-800",
  "On Hold": "bg-orange-100 text-orange-800",
  Approved: "bg-violet-100 text-violet-800",
  Done: "bg-emerald-100 text-emerald-700",
};

type Draft = Omit<Project, "id" | "archived">;
const EMPTY: Draft = { name: "", client: "", owner: "", status: "Planning", startDate: "", targetDate: "", notes: "" };

function Progress({ name }: { name: string }) {
  const { total, done } = projectTaskStats(name);
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-ink-faint">
        <span>Tasks</span>
        <span className="font-semibold text-forest">{done}/{total}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-firefly/12">
        <div className="h-full rounded-full bg-gradient-to-r from-forest to-firefly-deep" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientContact[]>([]);
  const [view, setView] = useState<"board" | "table">("board");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<ProjectStatus | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [manageStatus, setManageStatus] = useState(false);

  useEffect(() => {
    const sync = () => { setProjects(getProjects()); setClients(getClients()); setStatuses(getProjectStatuses()); };
    sync();
    return onStoreChange(sync);
  }, []);

  const visible = projects.filter((p) => (showArchived ? p.archived : !p.archived));
  // Board columns = managed statuses + any orphan status a project still uses.
  const boardStages = [
    ...statuses,
    ...Array.from(new Set(visible.map((p) => p.status).filter((s) => s && !statuses.includes(s)))),
  ];
  const editProj = editing && editing !== "new" ? projects.find((p) => p.id === editing) : null;
  const projTasks: Task[] = editProj ? getTasks().filter((t) => !t.archived && t.project === editProj.name) : [];
  const activeCount = projects.filter((p) => !p.archived).length;
  const archivedCount = projects.filter((p) => p.archived).length;
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function openNew() { setDraft(EMPTY); setEditing("new"); }
  function openEdit(p: Project) { const { id: _i, archived: _a, ...rest } = p; void _i; void _a; setDraft(rest); setEditing(p.id); }
  function save() {
    if (editing === "new") addProject(draft);
    else if (editing) updateProject(editing, draft);
    setEditing(null);
  }

  return (
    <>
      <AdminHeader
        title="Projects"
        subtitle="Client & internal projects — each rolls up its tasks (matched by project name). Drag across stages on the board."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-firefly/25 bg-parchment-card p-1">
              <button onClick={() => setView("board")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${view === "board" ? "bg-forest text-parchment" : "text-ink-soft"}`}>▦ Board</button>
              <button onClick={() => setView("table")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${view === "table" ? "bg-forest text-parchment" : "text-ink-soft"}`}>☰ Table</button>
            </div>
            <button onClick={() => setManageStatus(true)} className="btn-ghost !py-2 text-xs">⚙ Manage statuses</button>
            <button onClick={() => setShowArchived((s) => !s)} className="btn-ghost !py-2 text-xs">{showArchived ? `← Active (${activeCount})` : `Archived (${archivedCount})`}</button>
            <button onClick={openNew} className="btn-primary !py-2 text-xs">+ Add project</button>
          </div>
        }
      />

      {view === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {boardStages.map((stage) => {
            const col = visible.filter((p) => p.status === stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
                onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
                onDrop={() => { if (dragId) updateProject(dragId, { status: stage }); setDragId(null); setOverStage(null); }}
                className={`w-72 shrink-0 rounded-2xl border p-3 transition ${overStage === stage ? "border-firefly bg-firefly/8" : "border-firefly/20 bg-parchment-warm/40"}`}
              >
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${STAGE_DOT[stage]}`} />
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest-deep">{stage}</p>
                  <span className="ml-auto rounded-full bg-white px-2 text-[11px] font-medium text-ink-faint ring-1 ring-firefly/20">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={() => setDragId(p.id)}
                      onDragEnd={() => { setDragId(null); setOverStage(null); }}
                      className={`cursor-grab rounded-xl border border-firefly/15 bg-parchment-card p-3 shadow-sm active:cursor-grabbing ${dragId === p.id ? "opacity-50" : ""}`}
                    >
                      <button onClick={() => openEdit(p)} className="text-left text-sm font-semibold text-forest-deep hover:underline">{p.name}</button>
                      {p.client && <p className="mt-0.5 text-[11px] text-ink-faint">{p.client}</p>}
                      <div className="mt-2"><Progress name={p.name} /></div>
                      {(p.owner || p.targetDate) && <p className="mt-2 text-[10px] text-ink-faint">{p.owner}{p.targetDate && ` · due ${p.targetDate}`}</p>}
                    </div>
                  ))}
                  {col.length === 0 && <p className="px-1 py-4 text-center text-[11px] text-ink-faint">Drop a project here</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "table" && (
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-firefly/20 text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="py-2 pr-3 font-semibold">Project</th>
                <th className="py-2 pr-3 font-semibold">Client</th>
                <th className="py-2 pr-3 font-semibold">Owner</th>
                <th className="py-2 pr-3 font-semibold">Tasks</th>
                <th className="py-2 pr-3 font-semibold">Target</th>
                <th className="py-2 pr-3 font-semibold">Status</th>
                <th className="py-2 pr-0 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const { total, done } = projectTaskStats(p.name);
                return (
                  <tr key={p.id} className="border-b border-firefly/10 last:border-0">
                    <td className="py-3 pr-3 font-medium text-forest-deep">{p.name}</td>
                    <td className="py-3 pr-3 text-ink-soft">{p.client || "—"}</td>
                    <td className="py-3 pr-3 text-ink-soft">{p.owner || "—"}</td>
                    <td className="py-3 pr-3 text-ink-soft">{done}/{total}</td>
                    <td className="py-3 pr-3 text-ink-soft">{p.targetDate || "—"}</td>
                    <td className="py-3 pr-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[p.status]}`}>{p.status}</span></td>
                    <td className="py-3 pr-0">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(p)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
                        <button onClick={() => archiveProject(p.id, !p.archived)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10">{p.archived ? "Restore" : "Archive"}</button>
                        {confirmRemove === p.id ? (
                          <button onClick={() => { removeProject(p.id); setConfirmRemove(null); }} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">Confirm?</button>
                        ) : (
                          <button onClick={() => setConfirmRemove(p.id)} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-ink-faint">No projects.</td></tr>}
            </tbody>
          </table>
        </Panel>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{editing === "new" ? "Add Project" : "Project Details"}</h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Project name</span><input className={input} value={draft.name} onChange={(e) => set({ name: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Client</span>
                <input className={input} list="fae-project-clients" value={draft.client} onChange={(e) => set({ client: e.target.value })} placeholder="Pick from contacts or type…" />
                <datalist id="fae-project-clients">
                  {clients.map((c) => {
                    const label = c.company ? `${c.name} — ${c.company}` : c.name;
                    return <option key={c.id} value={label} />;
                  })}
                </datalist>
              </label>
              <label className="space-y-1"><span className={lbl}>Owner</span><input className={input} value={draft.owner} onChange={(e) => set({ owner: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Status</span>
                <div className="flex items-center gap-2">
                  <select className={input} value={draft.status} onChange={(e) => set({ status: e.target.value as ProjectStatus })}>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    {draft.status && !statuses.includes(draft.status) && <option value={draft.status}>{draft.status}</option>}
                  </select>
                  <button type="button" onClick={() => setManageStatus(true)} className="shrink-0 rounded-lg border border-firefly/25 px-3 py-2 text-xs font-semibold text-forest hover:border-firefly">Manage</button>
                </div>
              </label>
              <label className="space-y-1"><span className={lbl}>Target date</span><input type="date" className={input} value={draft.targetDate} onChange={(e) => set({ targetDate: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Notes</span><textarea rows={2} className={input} value={draft.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
            </div>
            {editing !== "new" && (
              <div className="mt-5 border-t border-firefly/15 pt-4">
                <div className="flex items-center justify-between">
                  <p className={lbl}>Tasks in this project ({projTasks.length})</p>
                  <Link href="/admin/tasks" className="text-[11px] font-semibold text-firefly-deep hover:underline">Open Tasks →</Link>
                </div>
                <div className="mt-2 max-h-52 space-y-1.5 overflow-auto">
                  {projTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-firefly/12 bg-parchment-warm/40 px-2.5 py-1.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-forest-deep">{t.title}</p>
                        {t.assignees.length > 0 && <p className="truncate text-[10px] text-ink-faint">{t.assignees.join(", ")}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TASK_BADGE[t.status] ?? "bg-stone-200 text-stone-600"}`}>{t.status}</span>
                        <Link href={`/admin/tasks?task=${t.id}`} className="text-[11px] font-semibold text-firefly-deep hover:underline">Open</Link>
                      </div>
                    </div>
                  ))}
                  {projTasks.length === 0 && (
                    <p className="text-[11px] text-ink-faint">No tasks yet — add tasks with Project = &ldquo;{editProj?.name}&rdquo; to see them here.</p>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={save} disabled={!draft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{editing === "new" ? "Add Project" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}

      {manageStatus && <ProjectStatusManager statuses={statuses} projects={projects} onClose={() => setManageStatus(false)} />}
    </>
  );
}

// Add / rename / remove project statuses (board columns) ---------------------
function ProjectStatusManager({ statuses, projects, onClose }: { statuses: string[]; projects: Project[]; onClose: () => void }) {
  const [newName, setNewName] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const count = (s: string) => projects.filter((p) => !p.archived && p.status === s).length;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-8 w-full max-w-md rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-forest-deep">Manage Project Statuses</h2>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>
        <p className="mt-1 text-xs text-ink-faint">These are your project stages. Renaming one updates every project using it.</p>
        <div className="mt-4 space-y-2">
          {statuses.map((s, i) => (
            <div key={s} className="flex items-center gap-2 rounded-xl border border-firefly/15 bg-white/70 px-3 py-2">
              {editIdx === i ? (
                <input autoFocus className="min-w-0 flex-1 rounded-lg border border-firefly/30 px-2 py-1 text-sm outline-none focus:border-firefly" value={editVal} onChange={(e) => setEditVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { renameProjectStatus(s, editVal); setEditIdx(null); } }} />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-forest-deep">{s}</span>
              )}
              <span className="shrink-0 rounded-full bg-firefly/10 px-2 text-[11px] text-ink-faint">{count(s)}</span>
              {editIdx === i ? (
                <>
                  <button onClick={() => { renameProjectStatus(s, editVal); setEditIdx(null); }} className="shrink-0 rounded-lg bg-forest px-2 py-1 text-xs font-semibold text-parchment">Save</button>
                  <button onClick={() => setEditIdx(null)} className="shrink-0 text-xs text-ink-faint">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditIdx(i); setEditVal(s); }} className="shrink-0 rounded-lg border border-firefly/25 px-2 py-1 text-xs font-semibold text-forest hover:border-firefly">Edit</button>
                  <button onClick={() => { if (statuses.length > 1 && confirm(`Remove "${s}"? Projects here move to another stage.`)) removeProjectStatus(s); }} disabled={statuses.length <= 1} className="shrink-0 text-xs font-semibold text-ink-faint hover:text-rose-600 disabled:opacity-30">Remove</button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2 border-t border-firefly/15 pt-4">
          <input className="flex-1 rounded-xl border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly" placeholder="New status name…" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { addProjectStatus(newName); setNewName(""); } }} />
          <button onClick={() => { if (newName.trim()) { addProjectStatus(newName); setNewName(""); } }} disabled={!newName.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">+ Add</button>
        </div>
      </div>
    </div>
  );
}
