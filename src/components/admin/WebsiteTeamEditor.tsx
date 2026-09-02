"use client";

import { useEffect, useRef, useState } from "react";
import {
  getEffectiveTeam,
  addPublicTeamMember,
  updatePublicTeamCustom,
  savePublicTeamMember,
  removePublicTeamMember,
  isCustomTeamMember,
  reorderPublicTeam,
  onStoreChange,
  EffectiveTeamMember,
} from "@/lib/store";
import { Panel } from "@/components/admin/ui";

const input = "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

interface Draft { name: string; role: string; blurb: string; photo?: string }
const EMPTY: Draft = { name: "", role: "", blurb: "", photo: undefined };

// Shrink an uploaded image to a small square-ish thumbnail so the data URL that
// gets stored (and synced to Supabase) stays tiny — photos render at 64px.
async function imageToDataUrl(file: File, max = 256): Promise<string> {
  const raw = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(file);
  });
  try {
    const img = document.createElement("img");
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = raw; });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return raw;
  }
}

export function WebsiteTeamEditor() {
  const [team, setTeam] = useState<EffectiveTeamMember[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setTeam(getEffectiveTeam(true));
    sync();
    return onStoreChange(sync);
  }, []);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function openNew() { setDraft(EMPTY); setEditing("new"); }
  function openEdit(m: EffectiveTeamMember) {
    setDraft({ name: m.name, role: m.role, blurb: m.blurb, photo: m.photo });
    setEditing(m.id);
  }
  function save() {
    if (editing === "new") {
      addPublicTeamMember({ name: draft.name.trim(), role: draft.role.trim(), blurb: draft.blurb.trim(), photo: draft.photo || undefined });
    } else if (editing) {
      const patch = { name: draft.name.trim(), role: draft.role.trim(), blurb: draft.blurb.trim(), photo: draft.photo };
      if (isCustomTeamMember(editing)) updatePublicTeamCustom(editing, patch);
      else savePublicTeamMember(editing, patch);
    }
    setEditing(null);
  }
  function toggleHidden(m: EffectiveTeamMember) {
    // hidden is stored in the override map for seed AND custom members.
    savePublicTeamMember(m.id, { hidden: !m.hidden });
  }
  function move(id: string, dir: -1 | 1) {
    const ids = team.map((m) => m.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    reorderPublicTeam(ids);
  }
  async function pickPhoto(file?: File) {
    if (!file) return;
    const url = await imageToDataUrl(file);
    set({ photo: url });
  }

  return (
    <Panel className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-forest-deep">🌐 Website team — “The people behind the magic”</h2>
          <p className="text-xs text-ink-faint">This is the public team section on your <span className="font-semibold">About</span> page. Edits show to signed-in teammates immediately.</p>
        </div>
        <button onClick={openNew} className="btn-primary !py-2 text-xs">+ Add member</button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m, i) => (
          <div key={m.id} className={`flex items-start gap-3 rounded-xl border border-firefly/15 bg-white/70 p-3 ${m.hidden ? "opacity-55" : ""}`}>
            {m.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.photo} alt={m.name} className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-firefly/30" />
            ) : (
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-twilight to-forest text-firefly-bright">✦</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-forest-deep">{m.name}{m.hidden && <span className="ml-1.5 rounded-full bg-stone-200 px-1.5 text-[9px] font-semibold text-stone-600">hidden</span>}</p>
              <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">{m.role}</p>
              <p className="mt-1 line-clamp-2 text-[11px] text-ink-soft">{m.blurb}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <button onClick={() => move(m.id, -1)} disabled={i === 0} className="rounded-md border border-firefly/25 px-1.5 py-0.5 text-[10px] font-semibold text-forest hover:bg-firefly/10 disabled:opacity-30" aria-label="Move up">↑</button>
                <button onClick={() => move(m.id, 1)} disabled={i === team.length - 1} className="rounded-md border border-firefly/25 px-1.5 py-0.5 text-[10px] font-semibold text-forest hover:bg-firefly/10 disabled:opacity-30" aria-label="Move down">↓</button>
                <button onClick={() => openEdit(m)} className="rounded-md border border-firefly/25 px-2 py-0.5 text-[10px] font-semibold text-forest hover:bg-firefly/10">Edit</button>
                <button onClick={() => toggleHidden(m)} className="rounded-md border border-firefly/25 px-2 py-0.5 text-[10px] font-semibold text-ink-soft hover:bg-firefly/10">{m.hidden ? "Show" : "Hide"}</button>
                {confirmRemove === m.id ? (
                  <button onClick={() => { removePublicTeamMember(m.id); setConfirmRemove(null); }} className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white">Confirm?</button>
                ) : (
                  <button onClick={() => setConfirmRemove(m.id)} className="rounded-md border border-rose-300 px-2 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {team.length === 0 && <p className="text-sm text-ink-faint">No team members yet — click “+ Add member”.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{editing === "new" ? "Add Team Member" : "Edit Team Member"}</h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-4">
                {draft.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.photo} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-firefly/30" />
                ) : (
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-twilight to-forest text-xl text-firefly-bright">✦</div>
                )}
                <div className="flex flex-col gap-1.5">
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />
                  <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">{draft.photo ? "Change photo" : "Upload photo"}</button>
                  {draft.photo && <button type="button" onClick={() => set({ photo: "" })} className="text-[11px] font-semibold text-rose-600 hover:underline">Remove photo (use ✦ placeholder)</button>}
                  <span className="text-[10px] text-ink-faint">Square photo works best. Large images are shrunk automatically.</span>
                </div>
              </div>
              <label className="block space-y-1"><span className={lbl}>Name</span><input className={input} value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Josh" /></label>
              <label className="block space-y-1"><span className={lbl}>Role (gold subtitle)</span><input className={input} value={draft.role} onChange={(e) => set({ role: e.target.value })} placeholder="e.g. SEO & Web · Client Relations" /></label>
              <label className="block space-y-1"><span className={lbl}>Blurb (short description)</span><textarea rows={2} className={input} value={draft.blurb} onChange={(e) => set({ blurb: e.target.value })} placeholder="One friendly line about what they do." /></label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={save} disabled={!draft.name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">{editing === "new" ? "Add member" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
