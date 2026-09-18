"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getFeedback,
  updateFeedback,
  removeFeedback,
  feedbackAverage,
  publishFeedbackAsReview,
  unpublishFeedbackReview,
  onStoreChange,
  Feedback,
  FeedbackKind,
  FEEDBACK_CLASSES,
  FEEDBACK_SERVICES,
} from "@/lib/store";
import { compressImage } from "@/lib/image";
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
  const [fKind, setFKind] = useState<"All" | "student" | "client">("All");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [editing, setEditing] = useState<Feedback | null>(null);

  useEffect(() => {
    const sync = () => setItems(getFeedback());
    sync();
    return onStoreChange(sync);
  }, []);

  const classes = useMemo(() => ["All", ...Array.from(new Set(items.filter((f) => f.kind !== "client" && f.classTaken).map((f) => f.classTaken))).sort()], [items]);
  const visible = items
    .filter((f) => (showArchived ? f.archived : !f.archived))
    .filter((f) => fKind === "All" || (f.kind ?? "student") === fKind)
    .filter((f) => fClass === "All" || f.classTaken === fClass);

  const active = items.filter((f) => !f.archived);
  const avg = feedbackAverage();
  const shareable = active.filter((f) => f.canShare).length;
  const clientCount = active.filter((f) => f.kind === "client").length;

  return (
    <>
      <AdminHeader
        title="Feedback"
        subtitle="Reviews from class students and consultancy clients — collected on the site. Star the best ones and publish them under Reviews & Video Testimonials."
        action={
          <button onClick={() => setShowArchived((s) => !s)} className="btn-ghost !py-2 text-xs">
            {showArchived ? `← Active (${active.length})` : `Archived (${items.filter((f) => f.archived).length})`}
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Average rating" value={avg ? `${avg} ★` : "—"} hint={`${active.length} responses`} accent="firefly" />
        <StatTile label="Responses" value={active.length} hint={`${active.length - clientCount} students · ${clientCount} clients`} accent="forest" />
        <StatTile label="Shareable" value={shareable} hint="opted in as testimonial" accent="twilight" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-ink-faint">Type
          <select className="rounded-lg border border-firefly/25 bg-parchment-card px-3 py-2 text-sm outline-none focus:border-firefly" value={fKind} onChange={(e) => setFKind(e.target.value as "All" | "student" | "client")}>
            <option value="All">All</option>
            <option value="student">Students</option>
            <option value="client">Clients</option>
          </select>
        </label>
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
              <div className="flex min-w-0 gap-3">
                {f.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.photo} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-firefly/40" />
                )}
                <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-forest-deep">{f.name || "Anonymous"}</p>
                  <Stars n={f.rating} />
                  {f.kind === "client"
                    ? <span className="rounded-full bg-twilight/15 px-2 py-0.5 text-[10px] font-semibold text-twilight">Client</span>
                    : <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-semibold text-forest">Student</span>}
                  {f.featured && <span className="rounded-full bg-firefly/15 px-2 py-0.5 text-[10px] font-semibold text-firefly-deep">★ Featured</span>}
                  {f.canShare && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Can share</span>}
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {f.kind === "client"
                    ? <>{f.service || "Service"}{f.company && ` · ${f.company}`}</>
                    : <>{f.classTaken}{f.batch && ` · Batch ${f.batch}`}</>}
                  {" · "}{formatDateShort(f.createdAt)}{f.email && ` · ${f.email}`}
                </p>
                {f.liked && <p className="mt-2 text-sm text-ink-soft">“{f.liked}”</p>}
                {f.improve && <p className="mt-1.5 text-sm text-ink-faint"><span className="font-semibold uppercase tracking-wide text-[10px]">Suggests:</span> {f.improve}</p>}
                {(f.logo || (f.images && f.images.length > 0) || f.videoUrl) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {f.logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.logo} alt="logo" title="Company logo" className="h-9 max-w-[80px] rounded border border-firefly/20 bg-white object-contain p-0.5" />
                    )}
                    {f.images?.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ))}
                    {f.videoUrl && (
                      <a href={f.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-twilight/10 px-2.5 py-1 text-[11px] font-semibold text-twilight hover:bg-twilight/20">🎥 Video</a>
                    )}
                  </div>
                )}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                <button onClick={() => setEditing(f)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">
                  ✎ Edit
                </button>
                <button onClick={() => updateFeedback(f.id, { featured: !f.featured })} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">
                  {f.featured ? "★ Unfeature" : "☆ Feature"}
                </button>
                {f.publishedReviewId ? (
                  <button onClick={() => unpublishFeedbackReview(f.id)} title="Remove from the public site" className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                    ✓ Published · unpublish
                  </button>
                ) : (
                  <button onClick={() => publishFeedbackAsReview(f.id)} title="Show this on the public testimonials" className="rounded-lg border border-twilight/40 px-2.5 py-1 text-xs font-semibold text-twilight hover:bg-twilight/10">
                    ✦ Publish as testimonial
                  </button>
                )}
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

      {editing && <EditFeedbackModal f={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function EditFeedbackModal({ f, onClose }: { f: Feedback; onClose: () => void }) {
  const [kind, setKind] = useState<FeedbackKind>(f.kind ?? "student");
  const [name, setName] = useState(f.name);
  const [email, setEmail] = useState(f.email);
  const [classTaken, setClassTaken] = useState(f.classTaken || FEEDBACK_CLASSES[0]);
  const [batch, setBatch] = useState(f.batch || "");
  const [service, setService] = useState(f.service || FEEDBACK_SERVICES[0]);
  const [company, setCompany] = useState(f.company || "");
  const [rating, setRating] = useState(f.rating);
  const [liked, setLiked] = useState(f.liked || "");
  const [improve, setImprove] = useState(f.improve || "");
  const [videoUrl, setVideoUrl] = useState(f.videoUrl || "");
  const [photo, setPhoto] = useState(f.photo || "");
  const [logo, setLogo] = useState(f.logo || "");
  const [images, setImages] = useState<string[]>(f.images || []);

  const inp = "w-full rounded-lg border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly";
  const lbl = "block text-[11px] font-semibold uppercase tracking-wide text-ink-faint";

  function save() {
    const isClient = kind === "client";
    updateFeedback(f.id, {
      kind,
      name: name.trim(),
      email: email.trim(),
      classTaken: isClient ? "" : classTaken,
      batch: isClient ? "" : batch.trim(),
      service: isClient ? service : undefined,
      company: isClient ? company.trim() : undefined,
      rating,
      liked: liked.trim(),
      improve: improve.trim(),
      videoUrl: videoUrl.trim() || undefined,
      photo: photo || undefined,
      logo: isClient && logo ? logo : undefined,
      images: images.length ? images : undefined,
    });
    // Keep the live testimonial in sync if this review is already published.
    if (f.publishedReviewId) publishFeedbackAsReview(f.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-forest-deep/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-forest-deep">Edit review</h2>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>
        {f.publishedReviewId && (
          <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">Published — saving updates the public testimonial too.</p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1"><span className={lbl}>Type</span>
            <select className={inp} value={kind} onChange={(e) => setKind(e.target.value as FeedbackKind)}>
              <option value="student">Student</option>
              <option value="client">Client</option>
            </select>
          </label>
          <label className="space-y-1"><span className={lbl}>Rating</span>
            <div className="flex gap-1 pt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-firefly" : "text-firefly/25"}`} aria-label={`${n} stars`}>★</button>
              ))}
            </div>
          </label>
          <label className="space-y-1 sm:col-span-2"><span className={lbl}>Name</span><input className={inp} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="space-y-1 sm:col-span-2"><span className={lbl}>Email</span><input className={inp} value={email} onChange={(e) => setEmail(e.target.value)} /></label>

          {kind === "student" ? (
            <>
              <label className="space-y-1"><span className={lbl}>Class taken</span>
                <select className={inp} value={classTaken} onChange={(e) => setClassTaken(e.target.value)}>
                  {FEEDBACK_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="space-y-1"><span className={lbl}>Batch</span><input className={inp} value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. 3" /></label>
            </>
          ) : (
            <>
              <label className="space-y-1"><span className={lbl}>Service</span>
                <select className={inp} value={service} onChange={(e) => setService(e.target.value)}>
                  {FEEDBACK_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="space-y-1"><span className={lbl}>Company</span><input className={inp} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" /></label>
            </>
          )}

          <label className="space-y-1 sm:col-span-2"><span className={lbl}>{kind === "client" ? "What they valued (quote)" : "What they enjoyed (quote)"}</span><textarea rows={3} className={inp} value={liked} onChange={(e) => setLiked(e.target.value)} /></label>
          <label className="space-y-1 sm:col-span-2"><span className={lbl}>Suggestions</span><textarea rows={2} className={inp} value={improve} onChange={(e) => setImprove(e.target.value)} /></label>
          <label className="space-y-1 sm:col-span-2"><span className={lbl}>Video link</span><input className={inp} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube / Vimeo / Loom / Drive" /></label>
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-5">
          <EditImage label="Profile photo" shape="circle" value={photo} onPick={setPhoto} max={320} />
          {kind === "client" && <EditImage label="Company logo" shape="square" value={logo} onPick={setLogo} max={400} format="png" />}
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-faint">More photos (up to 3)</span>
          <div className="flex flex-wrap items-center gap-2">
            {images.map((src, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] text-white">✕</button>
              </div>
            ))}
            {images.length < 3 && (
              <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-lg border border-dashed border-firefly/40 text-xl text-firefly-deep hover:bg-firefly/10">
                +
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const url = await compressImage(file, 800, "jpeg");
                  setImages((arr) => [...arr, url].slice(0, 3));
                  e.target.value = "";
                }} />
              </label>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost !py-2 text-xs">Cancel</button>
          <button onClick={save} disabled={!name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">Save changes</button>
        </div>
      </div>
    </div>
  );
}

function EditImage({
  label, shape, value, onPick, max, format = "jpeg",
}: {
  label: string; shape: "circle" | "square"; value: string;
  onPick: (v: string) => void; max: number; format?: "jpeg" | "png";
}) {
  const round = shape === "circle" ? "rounded-full" : "rounded-xl";
  return (
    <div className="text-center">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
      <label className={`relative grid h-16 w-16 cursor-pointer place-items-center overflow-hidden border-2 border-firefly/40 bg-white ${round} hover:border-firefly`}>
        {value
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={value} alt="" className="h-full w-full object-cover" />
          : <span className="text-xl text-firefly-deep">＋</span>}
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
          const file = e.target.files?.[0]; if (!file) return;
          onPick(await compressImage(file, max, format));
          e.target.value = "";
        }} />
      </label>
      {value && <button type="button" onClick={() => onPick("")} className="mt-1 block w-full text-[10px] font-semibold text-rose-600 hover:underline">Remove</button>}
    </div>
  );
}
