"use client";

import { useEffect, useState } from "react";
import {
  getSessions,
  addSession,
  updateSession,
  removeSession,
  getRegistrations,
  logActivity,
  onStoreChange,
  sessionDateText,
  sessionSeatText,
  sessionSlug,
  SessionItem,
  SessionPromo,
  SessionDay,
  DAY_ICONS,
} from "@/lib/store";
import { peso } from "@/lib/format";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input =
  "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

type Draft = Omit<SessionItem, "id">;

const EMPTY: Draft = {
  title: "",
  kind: "class",
  date: "",
  host: "",
  blurb: "",
  status: "upcoming",
  detail: "",
  registerUrl: "",
  replayUrl: "",
  meetingUrl: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  seatsTotal: undefined,
  seatsTaken: undefined,
  price: undefined,
  promos: [],
  curriculum: [],
  perks: [],
  posterUrl: "",
  hostPhoto: "",
  hostRole: "",
  hostBio: "",
};

const MAX_POSTER_MB = 2.5;

function numOrUndef(v: string): number | undefined {
  const n = Number(v.replace(/[^\d.]/g, ""));
  return v.trim() === "" || isNaN(n) ? undefined : n;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [sendFor, setSendFor] = useState<SessionItem | null>(null);
  const [sendMsg, setSendMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function copyLink(s: SessionItem) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/register/${sessionSlug(s)}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopied(s.id);
    setTimeout(() => setCopied((c) => (c === s.id ? null : c)), 1800);
  }

  function openSend(s: SessionItem) {
    const recips = getRegistrations().filter((r) => !r.archived && r.item === s.title);
    setSendFor(s);
    setSent(false);
    setSendMsg(
      `Hi! Reminder for "${s.title}" on ${s.date}.\n\n` +
        (s.meetingUrl ? `Join here: ${s.meetingUrl}\n\n` : `(Add the Zoom/Meet link in this session first.)\n\n`) +
        `See you there!\n— Faelight` +
        `\n\nRecipients: ${recips.length} registered attendee(s).`
    );
  }
  function doSend() {
    if (!sendFor) return;
    const recips = getRegistrations().filter((r) => !r.archived && r.item === sendFor.title);
    logActivity("event", `Update sent: ${sendFor.title}`, `${recips.length} attendee(s) · email${sendFor.meetingUrl ? " + Zoom link" : ""}`, "/admin/sessions");
    setSent(true);
  }

  useEffect(() => {
    const sync = () => setSessions(getSessions());
    sync();
    return onStoreChange(sync);
  }, []);

  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const past = sessions.filter((s) => s.status === "past");
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  function openNew() {
    setDraft(EMPTY);
    setEditing("new");
  }
  function openEdit(s: SessionItem) {
    const { id: _id, ...rest } = s;
    void _id;
    setDraft(rest);
    setEditing(s.id);
  }
  function save() {
    // Keep the display text in sync with structured fields when they're set.
    const synced: Draft = { ...draft };
    if (draft.startDate) synced.date = sessionDateText({ ...draft, id: "x" } as SessionItem);
    if (typeof draft.seatsTotal === "number") synced.detail = sessionSeatText({ ...draft, id: "x" } as SessionItem);
    if (editing === "new") {
      const created = addSession(synced);
      // Point the public "Register" button at the clean per-program landing page.
      updateSession(created.id, { registerUrl: draft.registerUrl?.trim() || `/register/${sessionSlug(created)}` });
    } else if (editing) {
      updateSession(editing, {
        ...synced,
        registerUrl: draft.registerUrl?.trim() || `/register/${sessionSlug({ ...synced, id: editing } as SessionItem)}`,
      });
    }
    setEditing(null);
  }

  // Promo repeater helpers (edit modal)
  function addPromo() {
    setDraft((d) => ({ ...d, promos: [...(d.promos ?? []), { code: "", label: "", kind: "percent", value: 10, active: true }] }));
  }
  function patchPromo(i: number, patch: Partial<SessionPromo>) {
    setDraft((d) => ({ ...d, promos: (d.promos ?? []).map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }));
  }
  function removePromo(i: number) {
    setDraft((d) => ({ ...d, promos: (d.promos ?? []).filter((_, idx) => idx !== i) }));
  }

  // Curriculum (day-by-day) helpers — number of rows = number of days
  function addDay() {
    setDraft((d) => ({ ...d, curriculum: [...(d.curriculum ?? []), { title: "", detail: "" }] }));
  }
  function patchDay(i: number, patch: Partial<SessionDay>) {
    setDraft((d) => ({ ...d, curriculum: (d.curriculum ?? []).map((x, idx) => (idx === i ? { ...x, ...patch } : x)) }));
  }
  function removeDay(i: number) {
    setDraft((d) => ({ ...d, curriculum: (d.curriculum ?? []).filter((_, idx) => idx !== i) }));
  }

  function Group({ title, items }: { title: string; items: SessionItem[] }) {
    return (
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">
          {title} ({items.length})
        </h2>
        <div className="space-y-3">
          {items.map((s) => (
            <Panel key={s.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${s.kind === "webinar" ? "bg-twilight/10 text-twilight-light" : "bg-forest/10 text-forest"}`}>
                      {s.kind}
                    </span>
                    <p className="font-medium text-forest-deep">{s.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">
                    {sessionDateText(s)} · Hosted by {s.host} · {sessionSeatText(s)}
                    {typeof s.price === "number" && <> · {s.price > 0 ? peso(s.price) : "Free"}</>}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-faint">
                    <span className="text-firefly-deep">🔗</span>
                    <code className="rounded bg-firefly/10 px-1.5 py-0.5 font-mono text-forest">/register/{sessionSlug(s)}</code>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <button onClick={() => copyLink(s)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">
                    {copied === s.id ? "✓ Copied!" : "🔗 Copy link"}
                  </button>
                  {s.status === "upcoming" && (
                    <button onClick={() => openSend(s)} className="rounded-lg bg-forest px-2.5 py-1 text-xs font-semibold text-parchment hover:bg-forest-deep">✉ Send update</button>
                  )}
                  <button onClick={() => openEdit(s)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
                  <button
                    onClick={() => updateSession(s.id, { status: s.status === "upcoming" ? "past" : "upcoming" })}
                    className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-firefly/10"
                  >
                    {s.status === "upcoming" ? "→ Past" : "→ Upcoming"}
                  </button>
                  {confirmRemove === s.id ? (
                    <button onClick={() => { removeSession(s.id); setConfirmRemove(null); }} className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">Confirm?</button>
                  ) : (
                    <button onClick={() => setConfirmRemove(s.id)} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Remove</button>
                  )}
                </div>
              </div>
            </Panel>
          ))}
          {items.length === 0 && <p className="text-sm text-ink-faint">None yet.</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminHeader
        title="Classes & Sessions"
        subtitle="Manage upcoming classes/webinars and past replays shown on the public /classes page."
        action={<button onClick={openNew} className="btn-primary !py-2 text-xs">+ Add session</button>}
      />

      <div className="space-y-8">
        <Group title="Upcoming" items={upcoming} />
        <Group title="Past" items={past} />
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">{editing === "new" ? "Add Session" : "Edit Session"}</h2>
              <button onClick={() => setEditing(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Title</span><input className={input} value={draft.title} onChange={(e) => set({ title: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Type</span>
                <select className={input} value={draft.kind} onChange={(e) => set({ kind: e.target.value as SessionItem["kind"] })}>
                  <option value="class">Class</option>
                  <option value="webinar">Webinar</option>
                </select>
              </label>
              <label className="space-y-1"><span className={lbl}>Status</span>
                <select className={input} value={draft.status} onChange={(e) => set({ status: e.target.value as SessionItem["status"] })}>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </label>
              <label className="space-y-1"><span className={lbl}>Host</span><input className={input} value={draft.host} onChange={(e) => set({ host: e.target.value })} /></label>
              <label className="space-y-1"><span className={lbl}>Regular price (₱)</span><input type="number" min={0} className={input} value={draft.price ?? ""} onChange={(e) => set({ price: numOrUndef(e.target.value) })} placeholder="0 = free" /></label>
              <label className="space-y-1"><span className={lbl}>VIP price (₱) <span className="text-ink-faint/70">(optional)</span></span><input type="number" min={0} className={input} value={draft.vipPrice ?? ""} onChange={(e) => set({ vipPrice: numOrUndef(e.target.value) })} placeholder="leave blank to hide VIP price" /></label>

              {/* Poster / banner image */}
              <fieldset className="space-y-2 rounded-xl border border-firefly/20 bg-white/40 p-3 sm:col-span-2">
                <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">Poster / banner image</legend>
                <p className="text-xs text-ink-faint">Upload a promo image (like your class poster) — shown big at the top of the registration page.</p>
                {draft.posterUrl ? (
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.posterUrl} alt="Poster preview" className="h-24 w-auto rounded-lg border border-firefly/25 object-cover" />
                    <div className="flex flex-col gap-1.5">
                      <label className="cursor-pointer rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">
                        Replace
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > MAX_POSTER_MB * 1024 * 1024) { alert(`Please choose an image under ${MAX_POSTER_MB} MB.`); return; } const url = await fileToDataUrl(f); set({ posterUrl: url }); }} />
                      </label>
                      <button onClick={() => set({ posterUrl: "" })} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">Remove</button>
                    </div>
                  </div>
                ) : (
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-firefly/25 px-3 py-2 text-xs font-semibold text-forest hover:bg-firefly/10">
                    ⬆ Upload image
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > MAX_POSTER_MB * 1024 * 1024) { alert(`Please choose an image under ${MAX_POSTER_MB} MB.`); return; } const url = await fileToDataUrl(f); set({ posterUrl: url }); }} />
                  </label>
                )}
              </fieldset>

              {/* Coach / host profile */}
              <fieldset className="space-y-2 rounded-xl border border-firefly/20 bg-white/40 p-3 sm:col-span-2">
                <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">Coach / host profile</legend>
                <p className="text-xs text-ink-faint">Shown on the right side of the registration hero. Name comes from the Host field above.</p>
                <div className="flex items-start gap-3">
                  {draft.hostPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.hostPhoto} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-firefly/30" />
                  ) : (
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-forest/10 text-2xl text-firefly-deep">☺</span>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className="cursor-pointer rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">
                      Upload coach photo
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > MAX_POSTER_MB * 1024 * 1024) { alert(`Please choose an image under ${MAX_POSTER_MB} MB.`); return; } const url = await fileToDataUrl(f); set({ hostPhoto: url }); }} />
                    </label>
                    {draft.hostPhoto && <button onClick={() => set({ hostPhoto: "" })} className="text-left text-xs text-rose-600 hover:underline">Remove photo</button>}
                  </div>
                </div>
                <label className="block space-y-1"><span className={lbl}>Role / title</span><input className={input} value={draft.hostRole ?? ""} onChange={(e) => set({ hostRole: e.target.value })} placeholder="Founder · Fairy VA Mentor" /></label>
                <label className="block space-y-1"><span className={lbl}>Short bio</span><textarea rows={2} className={input} value={draft.hostBio ?? ""} onChange={(e) => set({ hostBio: e.target.value })} placeholder="A sentence or two about the coach." /></label>
              </fieldset>

              {/* Date range + time */}
              <fieldset className="space-y-2 rounded-xl border border-firefly/20 bg-white/40 p-3 sm:col-span-2">
                <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">Date range &amp; time</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1"><span className={lbl}>Start date</span><input type="date" className={input} value={draft.startDate ?? ""} onChange={(e) => set({ startDate: e.target.value })} /></label>
                  <label className="space-y-1"><span className={lbl}>End date <span className="text-ink-faint/70">(optional)</span></span><input type="date" className={input} value={draft.endDate ?? ""} onChange={(e) => set({ endDate: e.target.value })} /></label>
                  <label className="space-y-1"><span className={lbl}>Start time</span><input type="time" className={input} value={draft.startTime ?? ""} onChange={(e) => set({ startTime: e.target.value })} /></label>
                  <label className="space-y-1"><span className={lbl}>End time</span><input type="time" className={input} value={draft.endTime ?? ""} onChange={(e) => set({ endTime: e.target.value })} /></label>
                </div>
                {draft.startDate && (
                  <p className="pt-1 text-xs text-ink-faint">Shows as: <strong className="text-forest">{sessionDateText({ ...draft, id: "x" } as SessionItem)}</strong></p>
                )}
              </fieldset>

              {/* Seats */}
              <fieldset className="space-y-2 rounded-xl border border-firefly/20 bg-white/40 p-3 sm:col-span-2">
                <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">Seats</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1"><span className={lbl}>Total seats</span><input type="number" min={0} className={input} value={draft.seatsTotal ?? ""} onChange={(e) => set({ seatsTotal: numOrUndef(e.target.value) })} placeholder="24" /></label>
                  <label className="space-y-1"><span className={lbl}>Seats taken</span><input type="number" min={0} className={input} value={draft.seatsTaken ?? ""} onChange={(e) => set({ seatsTaken: numOrUndef(e.target.value) })} placeholder="16" /></label>
                </div>
                {typeof draft.seatsTotal === "number" && (
                  <p className="pt-1 text-xs text-ink-faint">Shows as: <strong className="text-forest">{sessionSeatText({ ...draft, id: "x" } as SessionItem)}</strong></p>
                )}
              </fieldset>

              {/* Discounts / promo codes */}
              <fieldset className="space-y-2 rounded-xl border border-firefly/20 bg-white/40 p-3 sm:col-span-2">
                <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">Discounts / promo codes</legend>
                <p className="text-xs text-ink-faint">Give a code to students — they enter it on the registration page to unlock the discount.</p>
                <div className="space-y-2">
                  {(draft.promos ?? []).map((p, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-firefly/15 bg-white/60 p-2">
                      <input className="w-28 rounded-lg border border-firefly/25 bg-white px-2 py-1.5 text-xs font-mono uppercase outline-none focus:border-firefly" value={p.code} onChange={(e) => patchPromo(i, { code: e.target.value.toUpperCase() })} placeholder="CODE" />
                      <input className="w-32 rounded-lg border border-firefly/25 bg-white px-2 py-1.5 text-xs outline-none focus:border-firefly" value={p.label ?? ""} onChange={(e) => patchPromo(i, { label: e.target.value })} placeholder="Label (Early bird)" />
                      <select className="rounded-lg border border-firefly/25 bg-white px-2 py-1.5 text-xs outline-none focus:border-firefly" value={p.kind} onChange={(e) => patchPromo(i, { kind: e.target.value as SessionPromo["kind"] })}>
                        <option value="percent">% off</option>
                        <option value="amount">₱ off</option>
                      </select>
                      <input type="number" min={0} className="w-20 rounded-lg border border-firefly/25 bg-white px-2 py-1.5 text-xs outline-none focus:border-firefly" value={p.value} onChange={(e) => patchPromo(i, { value: Number(e.target.value) || 0 })} />
                      <label className="flex items-center gap-1 text-xs text-ink-soft"><input type="checkbox" checked={p.active !== false} onChange={(e) => patchPromo(i, { active: e.target.checked })} />on</label>
                      <button onClick={() => removePromo(i)} className="ml-auto rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Remove</button>
                    </div>
                  ))}
                </div>
                <button onClick={addPromo} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">+ Add promo code</button>
              </fieldset>

              {/* Curriculum — what they'll get, day by day */}
              <fieldset className="space-y-2 rounded-xl border border-firefly/20 bg-white/40 p-3 sm:col-span-2">
                <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-firefly-deep">
                  What they&rsquo;ll get — day by day ({(draft.curriculum ?? []).length} {(draft.curriculum ?? []).length === 1 ? "day" : "days"})
                </legend>
                <p className="text-xs text-ink-faint">Add or remove days to change the length (e.g. a 4-day class = 4 rows).</p>
                <div className="space-y-2">
                  {(draft.curriculum ?? []).map((day, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-firefly/15 bg-white/60 p-2">
                      <span className="mt-1.5 shrink-0 rounded-full bg-forest px-2 py-0.5 text-[10px] font-semibold text-firefly-bright">Day {i + 1}</span>
                      {/* Photo (overrides the emoji icon when set) */}
                      {day.image ? (
                        <div className="mt-0.5 flex shrink-0 flex-col items-center gap-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={day.image} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-firefly/30" />
                          <button onClick={() => patchDay(i, { image: "" })} className="text-[10px] text-rose-600 hover:underline">remove</button>
                        </div>
                      ) : (
                        <label className="mt-0.5 grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg border border-dashed border-firefly/40 text-firefly-deep hover:bg-firefly/10" title="Upload a photo for this day">
                          🖼
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > MAX_POSTER_MB * 1024 * 1024) { alert(`Please choose an image under ${MAX_POSTER_MB} MB.`); return; } const url = await fileToDataUrl(f); patchDay(i, { image: url }); }} />
                        </label>
                      )}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex gap-1.5">
                          <select className="shrink-0 rounded-lg border border-firefly/25 bg-white px-1.5 py-1.5 text-base outline-none focus:border-firefly disabled:opacity-40" value={day.icon ?? ""} onChange={(e) => patchDay(i, { icon: e.target.value })} aria-label="Day icon" disabled={!!day.image} title={day.image ? "Using uploaded photo" : "Emoji icon"}>
                            <option value="">—</option>
                            {DAY_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                          </select>
                          <input className="w-full rounded-lg border border-firefly/25 bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-firefly" value={day.title} onChange={(e) => patchDay(i, { title: e.target.value })} placeholder="Title (e.g. Foundations)" />
                        </div>
                        <input className="w-full rounded-lg border border-firefly/25 bg-white px-2 py-1.5 text-xs outline-none focus:border-firefly" value={day.detail} onChange={(e) => patchDay(i, { detail: e.target.value })} placeholder="What they'll cover this day" />
                      </div>
                      <button onClick={() => removeDay(i)} className="mt-1 shrink-0 rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={addDay} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">+ Add day</button>
              </fieldset>

              {/* Perks / inclusions */}
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Inclusions / perks <span className="text-ink-faint/70">(one per line — e.g. VIP: interview practice)</span></span>
                <textarea rows={3} className={input} value={(draft.perks ?? []).join("\n")} onChange={(e) => set({ perks: e.target.value.split("\n") })} placeholder={"Certificate of completion\nVIP: portfolio review\nAccess to the Faelight community"} />
              </label>

              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Description</span><textarea rows={2} className={input} value={draft.blurb} onChange={(e) => set({ blurb: e.target.value })} /></label>

              {/* Clean public link */}
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Custom link name <span className="text-ink-faint/70">(optional — leave blank to auto-name from the title)</span></span>
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0 text-sm text-ink-faint">/register/</span>
                  <input className={input} value={draft.slug ?? ""} onChange={(e) => set({ slug: e.target.value })} placeholder={draft.title ? sessionSlug({ ...draft, id: "x" } as SessionItem) : "notion"} />
                </div>
                <p className="text-[11px] text-ink-faint">Share link: <code className="rounded bg-firefly/10 px-1.5 py-0.5 font-mono text-forest">/register/{draft.title || draft.slug ? sessionSlug({ ...draft, id: "x" } as SessionItem) : "…"}</code></p>
              </label>

              {/* Links */}
              <label className="space-y-1"><span className={lbl}>Register link <span className="text-ink-faint/70">(auto — in-system)</span></span><input className={input} value={draft.registerUrl ?? ""} onChange={(e) => set({ registerUrl: e.target.value })} placeholder="/register/…" /></label>
              <label className="space-y-1"><span className={lbl}>Replay link (past)</span><input className={input} value={draft.replayUrl ?? ""} onChange={(e) => set({ replayUrl: e.target.value })} /></label>
              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Zoom / Meet link (for attendee updates)</span><input className={input} value={draft.meetingUrl ?? ""} onChange={(e) => set({ meetingUrl: e.target.value })} placeholder="https://us02web.zoom.us/j/…" /></label>

              <label className="space-y-1 sm:col-span-2"><span className={lbl}>Availability note <span className="text-ink-faint/70">(override — leave blank to auto-build from seats)</span></span><input className={input} value={draft.detail ?? ""} onChange={(e) => set({ detail: e.target.value })} placeholder="Free live webinar" /></label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
              <button onClick={save} disabled={!draft.title.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">
                {editing === "new" ? "Add Session" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send update to registered attendees */}
      {sendFor && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-forest-deep">Send Update</h2>
              <button onClick={() => setSendFor(null)} className="text-xl text-ink-faint hover:text-forest">✕</button>
            </div>
            <p className="mt-1 text-xs text-ink-faint">To registered attendees of &ldquo;{sendFor.title}&rdquo;. In production this emails them via your email service.</p>
            {sent ? (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <p className="text-2xl">✓</p>
                <p className="mt-1 font-serif text-lg text-forest-deep">Update sent!</p>
                <p className="mt-1 text-sm text-ink-soft">Attendees were notified{sendFor.meetingUrl ? " with the Zoom link" : ""}. It&rsquo;s logged in notifications.</p>
                <button onClick={() => setSendFor(null)} className="btn-primary mt-4 !py-2 text-xs">Close</button>
              </div>
            ) : (
              <>
                {!sendFor.meetingUrl && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                    Tip: add a Zoom/Meet link to this session (Edit) so it&rsquo;s included automatically.
                  </p>
                )}
                <textarea rows={9} className={`${input} mt-3`} value={sendMsg} onChange={(e) => setSendMsg(e.target.value)} />
                <div className="mt-5 flex justify-end gap-2">
                  <button onClick={() => setSendFor(null)} className="btn-ghost !py-2 text-xs">Cancel</button>
                  <button onClick={doSend} className="btn-primary !py-2 text-xs">✉ Send update</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
