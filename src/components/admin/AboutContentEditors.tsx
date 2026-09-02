"use client";

import { useEffect, useState } from "react";
import {
  getFounder, saveFounder, FounderInfo,
  getProjectTeams, addProjectTeam, updateProjectTeam, removeProjectTeam,
  onStoreChange, ProjectTeam,
} from "@/lib/store";
import { Panel } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

// ---- Founder editor -------------------------------------------------------
export function FounderEditor() {
  const [d, setD] = useState<FounderInfo | null>(null);
  const [personalText, setPersonalText] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const f = getFounder();
    setD(f);
    setPersonalText(f.personal.join(", "));
  }, []);

  if (!d) return null;
  const set = (patch: Partial<FounderInfo>) => setD((c) => ({ ...(c as FounderInfo), ...patch }));
  const setStat = (i: number, patch: Partial<{ value: string; label: string }>) =>
    set({ stats: d.stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });

  function save() {
    saveFounder({ ...d, personal: personalText.split(",").map((t) => t.trim()).filter(Boolean) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Panel className="mb-5">
      <h2 className="font-serif text-lg text-forest-deep">👑 Founder — About page</h2>
      <p className="text-xs text-ink-faint">The founder bio, stats and tags shown on the public About page.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1"><span className={lbl}>Name</span><input className={input} value={d.name} onChange={(e) => set({ name: e.target.value })} /></label>
        <label className="space-y-1"><span className={lbl}>Title</span><input className={input} value={d.title} onChange={(e) => set({ title: e.target.value })} /></label>
        <label className="space-y-1 sm:col-span-2"><span className={lbl}>Role (headline)</span><input className={input} value={d.role} onChange={(e) => set({ role: e.target.value })} /></label>
        <label className="space-y-1 sm:col-span-2"><span className={lbl}>Bio</span><textarea rows={3} className={input} value={d.bio} onChange={(e) => set({ bio: e.target.value })} /></label>
        <label className="space-y-1 sm:col-span-2"><span className={lbl}>Personal tags (comma-separated)</span><input className={input} value={personalText} onChange={(e) => setPersonalText(e.target.value)} placeholder="Artist, Fur mom, Gamer…" /></label>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className={lbl}>Stats (the 3 highlight numbers)</span>
          <button type="button" onClick={() => set({ stats: [...d.stats, { value: "", label: "" }] })} className="text-[11px] font-semibold text-firefly-deep hover:underline">+ Add stat</button>
        </div>
        <div className="mt-2 space-y-2">
          {d.stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${input} max-w-[110px]`} value={s.value} onChange={(e) => setStat(i, { value: e.target.value })} placeholder="20+" />
              <input className={input} value={s.label} onChange={(e) => setStat(i, { label: e.target.value })} placeholder="years experience" />
              <button type="button" onClick={() => set({ stats: d.stats.filter((_, idx) => idx !== i) })} className="shrink-0 rounded-md border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50">✕</button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button onClick={save} className="btn-primary !py-2 text-xs">💾 Save founder</button>
        {saved && <span className="text-xs font-semibold text-emerald-700">✓ Saved</span>}
      </div>
    </Panel>
  );
}

// ---- Project teams editor -------------------------------------------------
interface TeamDraft { name: string; focus: string; glyph: string; members: { name: string; role: string }[]; projectsText: string }
const EMPTY_TEAM: TeamDraft = { name: "", focus: "", glyph: "✦", members: [{ name: "", role: "" }], projectsText: "" };

export function ProjectTeamsEditor() {
  const [teams, setTeams] = useState<ProjectTeam[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<TeamDraft>(EMPTY_TEAM);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setTeams(getProjectTeams());
    sync();
    return onStoreChange(sync);
  }, []);

  const set = (patch: Partial<TeamDraft>) => setDraft((d) => ({ ...d, ...patch }));
  function openNew() { setDraft(EMPTY_TEAM); setEditing("new"); }
  function openEdit(t: ProjectTeam) {
    setDraft({ name: t.name, focus: t.focus, glyph: t.glyph, members: t.members.length ? t.members : [{ name: "", role: "" }], projectsText: t.projects.join(", ") });
    setEditing(t.id);
  }
  function save() {
    const payload = {
      name: draft.name.trim(), focus: draft.focus.trim(), glyph: draft.glyph.trim() || "✦",
      members: draft.members.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), role: m.role.trim() })),
      projects: draft.projectsText.split(",").map((p) => p.trim()).filter(Boolean),
    };
    if (editing === "new") addProjectTeam(payload);
    else if (editing) updateProjectTeam(editing, payload);
    setEditing(null);
  }

  return (
    <Panel className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-forest-deep">🧩 Project teams — About page</h2>
          <p className="text-xs text-ink-faint">The &ldquo;How the work gets done&rdquo; section on the public About page.</p>
        </div>
        <button onClick={openNew} className="btn-primary !py-2 text-xs">+ Add team</button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((t) => (
          <div key={t.id} className="rounded-xl border border-firefly/15 bg-white/70 p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-firefly/10 text-firefly-deep">{t.glyph}</span>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-forest-deep">{t.name}</p>
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] text-ink-soft">{t.focus}</p>
            <p className="mt-1 text-[10px] text-ink-faint">{t.members.map((m) => m.name).join(", ")}</p>
            <div className="mt-2 flex gap-1">
              <button onClick={() => openEdit(t)} className="rounded-md border border-firefly/25 px-2 py-0.5 text-[10px] font-semibold text-forest hover:bg-firefly/10">Edit</button>
              {confirmRemove === t.id ? (
                <button onClick={() => { removeProjectTeam(t.id); setConfirmRemove(null); }} className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white">Confirm?</button>
              ) : (
                <button onClick={() => setConfirmRemove(t.id)} className="rounded-md border border-rose-300 px-2 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
              )}
            </div>
          </div>
        ))}
        {teams.length === 0 && <p className="text-sm text-ink-faint">No project teams — click &ldquo;+ Add team&rdquo;.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{editing === "new" ? "Add Project Team" : "Edit Project Team"}</h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <label className="space-y-1"><span className={lbl}>Icon</span><input className={input} value={draft.glyph} onChange={(e) => set({ glyph: e.target.value })} maxLength={2} /></label>
                <label className="space-y-1 sm:col-span-3"><span className={lbl}>Team name</span><input className={input} value={draft.name} onChange={(e) => set({ name: e.target.value })} /></label>
              </div>
              <label className="block space-y-1"><span className={lbl}>Focus (one line)</span><input className={input} value={draft.focus} onChange={(e) => set({ focus: e.target.value })} /></label>
              <div>
                <div className="flex items-center justify-between">
                  <span className={lbl}>Members</span>
                  <button type="button" onClick={() => set({ members: [...draft.members, { name: "", role: "" }] })} className="text-[11px] font-semibold text-firefly-deep hover:underline">+ Add member</button>
                </div>
                <div className="mt-2 space-y-2">
                  {draft.members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input className={`${input} max-w-[140px]`} value={m.name} onChange={(e) => set({ members: draft.members.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)) })} placeholder="Name" />
                      <input className={input} value={m.role} onChange={(e) => set({ members: draft.members.map((x, idx) => (idx === i ? { ...x, role: e.target.value } : x)) })} placeholder="Role" />
                      <button type="button" onClick={() => set({ members: draft.members.filter((_, idx) => idx !== i) })} className="shrink-0 rounded-md border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50">✕</button>
                    </div>
                  ))}
                </div>
              </div>
              <label className="block space-y-1"><span className={lbl}>Projects (comma-separated)</span><input className={input} value={draft.projectsText} onChange={(e) => set({ projectsText: e.target.value })} placeholder="Project A, Project B" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={save} disabled={!draft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{editing === "new" ? "Add team" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
