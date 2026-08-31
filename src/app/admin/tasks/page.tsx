"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getTasks,
  addTask,
  updateTask,
  archiveTask,
  removeTask,
  onStoreChange,
  Task,
  TaskStatus,
  TaskPriority,
  TASK_PRIORITIES,
  getProjects,
  Project,
  getClients,
  ClientContact,
  getTaskStatuses,
  addTaskStatus,
  renameTaskStatus,
  removeTaskStatus,
} from "@/lib/store";
import { getAllUsers, useAuth, canEditModule } from "@/lib/auth";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";
const sel = "rounded-lg border border-firefly/25 bg-parchment-card px-3 py-2 text-sm outline-none focus:border-firefly";

// Known status looks; custom statuses fall back to a stable palette by name.
const KNOWN_STATUS: Record<string, { badge: string; dot: string }> = {
  "Not started": { badge: "bg-stone-200 text-stone-600", dot: "bg-stone-400" },
  "In progress": { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-400" },
  "Follow up": { badge: "bg-pink-100 text-pink-800", dot: "bg-pink-400" },
  "To Review": { badge: "bg-blue-100 text-blue-800", dot: "bg-blue-400" },
  "On Hold": { badge: "bg-orange-100 text-orange-800", dot: "bg-orange-400" },
  Approved: { badge: "bg-violet-100 text-violet-800", dot: "bg-violet-400" },
  Done: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};
const STATUS_PALETTE = [
  { badge: "bg-teal-100 text-teal-800", dot: "bg-teal-400" },
  { badge: "bg-indigo-100 text-indigo-800", dot: "bg-indigo-400" },
  { badge: "bg-rose-100 text-rose-800", dot: "bg-rose-400" },
  { badge: "bg-lime-100 text-lime-800", dot: "bg-lime-500" },
  { badge: "bg-cyan-100 text-cyan-800", dot: "bg-cyan-400" },
  { badge: "bg-fuchsia-100 text-fuchsia-800", dot: "bg-fuchsia-400" },
];
function statusLook(status: string) {
  if (KNOWN_STATUS[status]) return KNOWN_STATUS[status];
  let h = 0;
  for (let i = 0; i < status.length; i++) h = (h * 31 + status.charCodeAt(i)) >>> 0;
  return STATUS_PALETTE[h % STATUS_PALETTE.length];
}
const PRIORITY_STYLES: Record<TaskPriority, string> = {
  Low: "bg-stone-100 text-stone-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-amber-100 text-amber-800",
  Urgent: "bg-rose-100 text-rose-700",
};

type Draft = Omit<Task, "id" | "createdAt" | "archived" | "assignees"> & { assignees: string };
const EMPTY: Draft = {
  title: "", description: "", assignees: "", dueDate: "", priority: "Medium", project: "", clientList: "",
  status: "Not started", notes: "", createdBy: "",
};

function toDraft(t: Task): Draft {
  return { ...t, assignees: t.assignees.join(", ") };
}

function TasksInner() {
  const { user, isAdmin } = useAuth();
  // Everyone can view all tasks; you can only EDIT a task you're assigned to
  // (admins can edit any). Team members with view-only Tasks access edit none.
  const moduleCanEdit = canEditModule(user, "tasks");
  const canEditTask = (t: Task) =>
    moduleCanEdit && (isAdmin || (!!user?.name && t.assignees.includes(user.name)));
  const params = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fStatus, setFStatus] = useState("All");
  const [fAssignee, setFAssignee] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [view, setView] = useState<"board" | "table">("board");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<TaskStatus | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientContact[]>([]);
  const [manageStatus, setManageStatus] = useState(false);

  useEffect(() => {
    const sync = () => {
      setTasks(getTasks());
      setStatuses(getTaskStatuses());
      setProjects(getProjects());
      setClients(getClients());
    };
    sync();
    return onStoreChange(sync);
  }, []);

  // Deep-link: /admin/tasks?task=<id> opens that task directly.
  useEffect(() => {
    const id = params.get("task");
    if (id && getTasks().some((t) => t.id === id)) {
      const t = getTasks().find((x) => x.id === id)!;
      setDraft(toDraft(t));
      setEditing(id);
    }
  }, [params]);

  const assignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.assignees.forEach((a) => set.add(a)));
    if (user?.name) set.add(user.name); // always let the signed-in user filter to themselves
    return ["All", ...Array.from(set).sort()];
  }, [tasks, user]);

  // On first load, default to the signed-in user's own tasks. Admins can flip
  // to "Everyone"; team members land straight on what's assigned to them.
  const didDefault = useRef(false);
  useEffect(() => {
    if (!didDefault.current && user?.name) {
      setFAssignee(user.name);
      didDefault.current = true;
    }
  }, [user]);

  const visible = tasks
    .filter((t) => (showArchived ? t.archived : !t.archived))
    .filter((t) => fStatus === "All" || t.status === fStatus)
    .filter((t) => fAssignee === "All" || t.assignees.includes(fAssignee));

  // Board columns = configured statuses + any status a visible task actually
  // has that isn't a configured column (so a task can never disappear from the
  // board just because its status was renamed/removed in Manage statuses).
  const boardStages = useMemo(() => {
    const extra = visible
      .map((t) => t.status)
      .filter((s): s is string => !!s && !statuses.includes(s));
    return [...statuses, ...Array.from(new Set(extra))];
  }, [statuses, visible]);

  const activeCount = tasks.filter((t) => !t.archived).length;
  const archivedCount = tasks.filter((t) => t.archived).length;
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function openNew() { setDraft({ ...EMPTY, createdBy: user?.name ?? "Team" }); setEditing("new"); }
  function openEdit(t: Task) { setDraft(toDraft(t)); setEditing(t.id); }
  const assigneeList = draft.assignees.split(",").map((x) => x.trim()).filter(Boolean);
  function addAssignee(name: string) {
    const n = name.trim();
    if (!n || assigneeList.includes(n) || assigneeList.length >= 5) return;
    set({ assignees: [...assigneeList, n].join(", ") });
  }
  function removeAssignee(name: string) {
    set({ assignees: assigneeList.filter((a) => a !== name).join(", ") });
  }
  function save() {
    const payload = { ...draft, assignees: assigneeList.slice(0, 5) };
    if (editing === "new") addTask({ ...payload, createdBy: payload.createdBy || user?.name || "Team" });
    else if (editing) updateTask(editing, payload);
    setEditing(null);
  }

  const editorTask = editing && editing !== "new" ? tasks.find((t) => t.id === editing) ?? null : null;
  const editorEditable = editing === "new" ? true : (editorTask ? canEditTask(editorTask) : true);

  return (
    <>
      <AdminHeader
        title="Tasks"
        subtitle="Assign work to the team. Assignees get an in-system notification (🔔) + email, and clicking it opens the task directly."
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-firefly/25 bg-parchment-card p-1">
              <button onClick={() => setView("board")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${view === "board" ? "bg-forest text-parchment" : "text-ink-soft"}`}>▦ Board</button>
              <button onClick={() => setView("table")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${view === "table" ? "bg-forest text-parchment" : "text-ink-soft"}`}>☰ Table</button>
            </div>
            <button onClick={() => setShowArchived((s) => !s)} className="btn-ghost !py-2 text-xs">
              {showArchived ? `← Active (${activeCount})` : `Archived (${archivedCount})`}
            </button>
            <button onClick={openNew} className="btn-primary !py-2 text-xs">+ Add task</button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {user?.name && (
          <div className="flex rounded-full border border-firefly/25 bg-parchment-card p-1">
            <button onClick={() => setFAssignee(user.name)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${fAssignee === user.name ? "bg-forest text-parchment" : "text-ink-soft"}`}>My tasks</button>
            <button onClick={() => setFAssignee("All")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${fAssignee === "All" ? "bg-forest text-parchment" : "text-ink-soft"}`}>Everyone</button>
          </div>
        )}
        {view === "table" && (
          <label className="flex items-center gap-1.5 text-xs text-ink-faint">Status
            <select className={sel} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
              {["All", ...statuses].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}
        <label className="flex items-center gap-1.5 text-xs text-ink-faint">Assignee
          <select className={sel} value={fAssignee} onChange={(e) => setFAssignee(e.target.value)}>
            {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <button onClick={() => setManageStatus(true)} className="rounded-full border border-firefly/25 bg-parchment-card px-3 py-1.5 text-xs font-semibold text-forest hover:border-firefly">⚙ Manage statuses</button>
        <span className="ml-auto text-xs text-ink-faint">{visible.length} shown</span>
      </div>

      {/* Kanban board — columns are the task statuses */}
      {view === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {boardStages.map((stage) => {
            const col = visible.filter((t) => t.status === stage);
            const isOrphan = !statuses.includes(stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
                onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
                onDrop={() => { if (dragId) updateTask(dragId, { status: stage }); setDragId(null); setOverStage(null); }}
                className={`w-72 shrink-0 rounded-2xl border p-3 transition ${overStage === stage ? "border-firefly bg-firefly/8" : "border-firefly/20 bg-parchment-warm/40"}`}
              >
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusLook(stage).dot}`} />
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest-deep">{stage}</p>
                  {isOrphan && <span title="This status isn't in your configured list — drag the task to a listed column, or add this status in Manage statuses." className="rounded-full bg-amber-100 px-1.5 text-[9px] font-semibold text-amber-800">unlisted</span>}
                  <span className="ml-auto rounded-full bg-white px-2 text-[11px] font-medium text-ink-faint ring-1 ring-firefly/20">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map((t) => {
                    const editable = canEditTask(t);
                    return (
                    <div
                      key={t.id}
                      draggable={editable}
                      onDragStart={() => editable && setDragId(t.id)}
                      onDragEnd={() => { setDragId(null); setOverStage(null); }}
                      className={`rounded-xl border border-firefly/15 bg-parchment-card p-3 shadow-sm ${editable ? "cursor-grab active:cursor-grabbing" : ""} ${dragId === t.id ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button onClick={() => openEdit(t)} className="text-left text-sm font-semibold text-forest-deep hover:underline">{t.title}</button>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {t.project && <p className="text-[11px] text-ink-faint">{t.project}</p>}
                        {t.notes?.trim() && <span title="Has notes" className="text-[11px] text-firefly-deep">🗒</span>}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {t.assignees.map((a) => (
                            <span key={a} className="grid h-5 w-5 place-items-center rounded-full bg-forest text-[9px] font-bold text-firefly-bright" title={a}>{a[0]}</span>
                          ))}
                        </div>
                        {t.dueDate && <span className="text-[10px] text-ink-faint">{t.dueDate}</span>}
                      </div>
                      {!editable && <p className="mt-1 text-[10px] text-ink-faint">🔒 View only</p>}
                    </div>
                    );
                  })}
                  {col.length === 0 && <p className="px-1 py-4 text-center text-[11px] text-ink-faint">Drop a task here</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "table" && (
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-firefly/20 text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="py-2 pr-3 font-semibold">Task</th>
              <th className="py-2 pr-3 font-semibold">Assignees</th>
              <th className="py-2 pr-3 font-semibold">Due</th>
              <th className="py-2 pr-3 font-semibold">Priority</th>
              <th className="py-2 pr-3 font-semibold">Project</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2 pr-0 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id} className="border-b border-firefly/10 last:border-0">
                <td className="py-3 pr-3">
                  <button onClick={() => openEdit(t)} className="text-left font-medium text-forest-deep hover:underline">{t.title}</button>
                  {t.description && <p className="text-[11px] text-ink-faint">{t.description}</p>}
                </td>
                <td className="py-3 pr-3">
                  <div className="flex flex-wrap gap-1">
                    {t.assignees.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 rounded-full bg-forest/8 px-2 py-0.5 text-[11px] text-forest">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-forest text-[8px] font-bold text-firefly-bright">{a[0]}</span>{a}
                      </span>
                    ))}
                    {t.assignees.length === 0 && <span className="text-ink-faint">—</span>}
                  </div>
                </td>
                <td className="py-3 pr-3 text-ink-soft">{t.dueDate || "—"}</td>
                <td className="py-3 pr-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span></td>
                <td className="py-3 pr-3 text-ink-soft">{t.project || "—"}</td>
                <td className="py-3 pr-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusLook(t.status).badge}`}>{t.status}</span></td>
                <td className="py-3 pr-0">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => openEdit(t)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">{canEditTask(t) ? "Edit" : "View"}</button>
                    {canEditTask(t) ? (
                      <>
                        <button onClick={() => archiveTask(t.id, !t.archived)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10">{t.archived ? "Restore" : "Archive"}</button>
                        {confirmRemove === t.id ? (
                          <button onClick={() => { removeTask(t.id); setConfirmRemove(null); }} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">Confirm?</button>
                        ) : (
                          <button onClick={() => setConfirmRemove(t.id)} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                        )}
                      </>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] text-ink-faint">🔒 View only</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-ink-faint">No tasks match.</td></tr>}
          </tbody>
        </table>
      </Panel>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{editing === "new" ? "Add Task" : editorEditable ? "Task Details" : "Task Details (view only)"}</h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            {!editorEditable && (
              <p className="mt-3 rounded-lg border border-firefly/20 bg-firefly/8 px-3 py-2 text-xs text-ink-soft">🔒 You&rsquo;re not assigned to this task, so it&rsquo;s view-only. Ask an admin or an assignee to make changes.</p>
            )}
            <fieldset disabled={!editorEditable} className="mt-5 grid gap-4 border-0 p-0 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Task name</span><input className={input} value={draft.title} onChange={(e) => set({ title: e.target.value })} /></label>
              <div className="space-y-1 sm:col-span-2">
                <span className={lbl}>Assignees — up to 5 ({assigneeList.length}/5) · they&rsquo;ll be notified</span>
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-firefly/25 bg-white px-2.5 py-2">
                  {assigneeList.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 rounded-full bg-forest/8 px-2 py-0.5 text-xs font-medium text-forest">
                      {a}
                      <button type="button" onClick={() => removeAssignee(a)} className="text-sm leading-none text-ink-faint hover:text-rose-600">×</button>
                    </span>
                  ))}
                  {assigneeList.length < 5 && (
                    <input
                      list="fae-team"
                      placeholder={assigneeList.length ? "add…" : "Add assignee…"}
                      className="min-w-[110px] flex-1 border-0 bg-transparent text-sm outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const t = e.target as HTMLInputElement;
                          addAssignee(t.value);
                          t.value = "";
                        }
                      }}
                      onBlur={(e) => { if (e.target.value.trim()) { addAssignee(e.target.value); e.target.value = ""; } }}
                    />
                  )}
                </div>
                <datalist id="fae-team">{getAllUsers().map((u) => <option key={u.id} value={u.name} />)}</datalist>
                {assigneeList.length >= 5 && <span className="text-[11px] text-amber-700">Maximum of 5 assignees reached.</span>}
              </div>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Description</span><textarea rows={2} className={input} value={draft.description} onChange={(e) => set({ description: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Due date</span><input type="date" className={input} value={draft.dueDate} onChange={(e) => set({ dueDate: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Priority</span>
                <select className={input} value={draft.priority} onChange={(e) => set({ priority: e.target.value as TaskPriority })}>
                  {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="space-y-1"><span className={lbl}>Project</span>
                <select className={input} value={draft.project} onChange={(e) => set({ project: e.target.value })}>
                  <option value="">— No project —</option>
                  {projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  {draft.project && !projects.some((p) => p.name === draft.project) && (
                    <option value={draft.project}>{draft.project} (not in Projects)</option>
                  )}
                </select>
              </label>
              <label className="space-y-1"><span className={lbl}>Client</span>
                <select className={input} value={draft.clientList} onChange={(e) => set({ clientList: e.target.value })}>
                  <option value="">— No client —</option>
                  {clients.map((c) => {
                    const label = c.company ? `${c.name} — ${c.company}` : c.name;
                    return <option key={c.id} value={label}>{label}</option>;
                  })}
                  {draft.clientList && !clients.some((c) => (c.company ? `${c.name} — ${c.company}` : c.name) === draft.clientList) && (
                    <option value={draft.clientList}>{draft.clientList} (not in Clients)</option>
                  )}
                </select>
              </label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Status</span>
                <div className="flex items-center gap-2">
                  <select className={input} value={draft.status} onChange={(e) => set({ status: e.target.value as TaskStatus })}>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    {draft.status && !statuses.includes(draft.status) && <option value={draft.status}>{draft.status}</option>}
                  </select>
                  <button type="button" onClick={() => setManageStatus(true)} className="shrink-0 rounded-lg border border-firefly/25 px-3 py-2 text-xs font-semibold text-forest hover:border-firefly">Manage</button>
                </div>
              </label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Notes</span>
                <textarea rows={3} className={input} placeholder="Internal notes, links, context… (not emailed to assignees)" value={draft.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} />
              </label>
            </fieldset>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">{editorEditable ? "Cancel" : "Close"}</button>
              {editorEditable && <button onClick={save} disabled={!draft.title.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{editing === "new" ? "Create & notify" : "Save changes"}</button>}
            </div>
          </div>
        </div>
      )}

      {manageStatus && (
        <StatusManager statuses={statuses} tasks={tasks} onClose={() => setManageStatus(false)} />
      )}
    </>
  );
}

// --- Add / rename / remove task statuses (Kanban stages) ---------------
function StatusManager({ statuses, tasks, onClose }: { statuses: string[]; tasks: Task[]; onClose: () => void }) {
  const [newName, setNewName] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const count = (s: string) => tasks.filter((t) => !t.archived && t.status === s).length;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-8 w-full max-w-md rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-forest-deep">Manage Statuses</h2>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>
        <p className="mt-1 text-xs text-ink-faint">These are your Kanban stages. Renaming one updates every task using it.</p>

        <div className="mt-4 space-y-2">
          {statuses.map((s, i) => (
            <div key={s} className="flex items-center gap-2 rounded-xl border border-firefly/15 bg-white/70 px-3 py-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusLook(s).dot}`} />
              {editIdx === i ? (
                <input
                  autoFocus
                  className="min-w-0 flex-1 rounded-lg border border-firefly/30 px-2 py-1 text-sm outline-none focus:border-firefly"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { renameTaskStatus(s, editVal); setEditIdx(null); } }}
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-forest-deep">{s}</span>
              )}
              <span className="shrink-0 rounded-full bg-firefly/10 px-2 text-[11px] text-ink-faint">{count(s)}</span>
              {editIdx === i ? (
                <>
                  <button onClick={() => { renameTaskStatus(s, editVal); setEditIdx(null); }} className="shrink-0 rounded-lg bg-forest px-2 py-1 text-xs font-semibold text-parchment">Save</button>
                  <button onClick={() => setEditIdx(null)} className="shrink-0 text-xs text-ink-faint">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditIdx(i); setEditVal(s); }} className="shrink-0 rounded-lg border border-firefly/25 px-2 py-1 text-xs font-semibold text-forest hover:border-firefly">Edit</button>
                  <button
                    onClick={() => { if (statuses.length > 1 && confirm(`Remove "${s}"? Tasks here move to another stage.`)) removeTaskStatus(s); }}
                    disabled={statuses.length <= 1}
                    className="shrink-0 text-xs font-semibold text-ink-faint hover:text-rose-600 disabled:opacity-30"
                    title={statuses.length <= 1 ? "At least one status is required" : "Remove"}
                  >Remove</button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2 border-t border-firefly/15 pt-4">
          <input
            className="flex-1 rounded-xl border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly"
            placeholder="New status name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { addTaskStatus(newName); setNewName(""); } }}
          />
          <button onClick={() => { if (newName.trim()) { addTaskStatus(newName); setNewName(""); } }} disabled={!newName.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">+ Add</button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-faint">Loading tasks…</p>}>
      <TasksInner />
    </Suspense>
  );
}
