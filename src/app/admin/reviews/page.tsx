"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getReviews, addReview, updateReview, removeReview, onStoreChange, Review, ReviewStatus,
} from "@/lib/store";
import { CATEGORIES, CategorySlug } from "@/lib/content";
import { relativeDay, videoEmbed } from "@/lib/format";
import { AdminHeader, Panel, StatTile, CategoryTag } from "@/components/admin/ui";

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

// Uploaded videos are stored as base64 data URLs in localStorage (demo only).
// Keep them small so we don't blow the storage quota.
const MAX_UPLOAD_MB = 25;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<ReviewStatus | "all">("pending");
  const [adding, setAdding] = useState(false);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setReviews(getReviews());
    sync();
    return onStoreChange(sync);
  }, []);

  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };
  const videoCount = reviews.filter((r) => videoEmbed(r.videoUrl)).length;
  const shown = useMemo(
    () => (tab === "all" ? reviews : reviews.filter((r) => r.status === tab)),
    [reviews, tab]
  );

  return (
    <>
      <AdminHeader
        title="Reviews & Video Testimonials"
        subtitle="Approve written reviews and publish video testimonials on the public site."
        action={
          <button onClick={() => setAdding(true)} className="btn-primary text-sm">
            ✦ Add testimonial
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatTile label="Awaiting approval" value={counts.pending} accent="firefly" />
        <StatTile label="Published" value={counts.approved} hint="live on the site" accent="forest" />
        <StatTile label="Video stories" value={videoCount} accent="twilight" />
        <StatTile label="Rejected" value={counts.rejected} accent="twilight" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition ${
              tab === t ? "border-forest bg-forest text-parchment" : "border-firefly/25 bg-parchment-card text-ink-soft hover:border-firefly"
            }`}
          >
            {t}{t !== "all" ? ` · ${counts[t]}` : ""}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.length === 0 && (
          <Panel><p className="py-6 text-center text-ink-faint">No {tab === "all" ? "" : tab} reviews.</p></Panel>
        )}
        {shown.map((r) => {
          const v = videoEmbed(r.videoUrl);
          return (
            <Panel key={r.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  {v && (
                    <div className="hidden w-40 shrink-0 overflow-hidden rounded-lg bg-forest-deep sm:block">
                      <div className="relative aspect-video w-full">
                        {v.kind === "iframe" ? (
                          <iframe src={v.src} title={`${r.author} video`} className="absolute inset-0 h-full w-full" allowFullScreen />
                        ) : (
                          // eslint-disable-next-line jsx-a11y/media-has-caption
                          <video src={v.src} controls className="absolute inset-0 h-full w-full object-cover" />
                        )}
                      </div>
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-forest-deep">{r.author}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                      {v && <span className="rounded-full bg-twilight/15 px-2.5 py-0.5 text-xs font-semibold text-twilight">▶ Video</span>}
                      {r.rating && <span className="text-sm text-firefly">{"★".repeat(r.rating)}</span>}
                      <CategoryTag slug={r.categorySlug} />
                      <span className="text-xs text-ink-faint">{relativeDay(r.createdAt)}</span>
                    </div>
                    <p className="text-xs text-ink-faint">{r.roleCompany}</p>
                    {r.quote && (
                      <blockquote className="mt-2 border-l-2 border-firefly/40 pl-3 font-serif text-forest-deep">
                        “{r.quote}”
                      </blockquote>
                    )}
                    <button
                      onClick={() => setEditingVideo(editingVideo === r.id ? null : r.id)}
                      className="mt-2 text-xs font-semibold text-twilight hover:underline"
                    >
                      {v ? "Replace / remove video" : "▶ Attach a video"}
                    </button>
                    {editingVideo === r.id && (
                      <VideoEditor review={r} onDone={() => setEditingVideo(null)} />
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                  {r.status !== "approved" && (
                    <button onClick={() => updateReview(r.id, { status: "approved" })} className="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                      ✓ Approve &amp; publish
                    </button>
                  )}
                  {r.status === "approved" && (
                    <button onClick={() => updateReview(r.id, { status: "pending" })} className="rounded-lg border border-firefly/30 px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-firefly">
                      Unpublish
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button onClick={() => updateReview(r.id, { status: "rejected" })} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                      Reject
                    </button>
                  )}
                  <button onClick={() => { if (confirm("Delete this review permanently?")) removeReview(r.id); }} className="text-xs font-semibold text-ink-faint hover:text-rose-600">
                    Delete
                  </button>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {adding && <AddTestimonial onDone={() => setAdding(false)} />}
    </>
  );
}

// --- Attach / replace / remove a video on an existing review ------------
function VideoEditor({ review, onDone }: { review: Review; onDone: () => void }) {
  const [link, setLink] = useState(review.videoUrl?.startsWith("data:") ? "" : review.videoUrl ?? "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setErr(`Video is too large (max ${MAX_UPLOAD_MB} MB for uploads). Paste a YouTube/Vimeo link instead.`);
      return;
    }
    setBusy(true); setErr("");
    try {
      const dataUrl = await fileToDataUrl(file);
      updateReview(review.id, { videoUrl: dataUrl });
      onDone();
    } catch {
      setErr("Could not read that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-twilight/25 bg-twilight/5 p-3">
      <p className="text-xs font-semibold text-twilight">Video testimonial</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste YouTube, Vimeo or video URL…"
          className="flex-1 rounded-lg border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly"
        />
        <button
          onClick={() => { updateReview(review.id, { videoUrl: link.trim() }); onDone(); }}
          disabled={!link.trim()}
          className="btn-primary text-xs disabled:opacity-40"
        >
          Save link
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button onClick={() => fileRef.current?.click()} disabled={busy} className="btn-ghost text-xs">
          {busy ? "Uploading…" : "⬆ Upload video file"}
        </button>
        <input ref={fileRef} type="file" accept="video/*" onChange={onFile} className="hidden" />
        {review.videoUrl && (
          <button
            onClick={() => { updateReview(review.id, { videoUrl: undefined }); onDone(); }}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Remove video
          </button>
        )}
        <span className="text-[11px] text-ink-faint">Links are best. Uploads max {MAX_UPLOAD_MB} MB.</span>
      </div>
      {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
    </div>
  );
}

// --- Add a brand-new testimonial (written or video) --------------------
function AddTestimonial({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({
    author: "", roleCompany: "", quote: "", categorySlug: "" as CategorySlug | "", rating: 5, videoUrl: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const input = "w-full rounded-xl border border-firefly/25 bg-white px-4 py-2.5 text-sm outline-none focus:border-firefly";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setErr(`Video is too large (max ${MAX_UPLOAD_MB} MB). Paste a link instead.`);
      return;
    }
    setBusy(true); setErr("");
    try {
      const dataUrl = await fileToDataUrl(file);
      setF((x) => ({ ...x, videoUrl: dataUrl }));
    } catch {
      setErr("Could not read that file.");
    } finally {
      setBusy(false);
    }
  }

  function save(status: ReviewStatus) {
    if (!f.author.trim()) { setErr("Please add a name."); return; }
    addReview({
      author: f.author.trim(),
      roleCompany: f.roleCompany.trim() || "Faelight client",
      quote: f.quote.trim(),
      categorySlug: f.categorySlug || null,
      rating: f.rating,
      videoUrl: f.videoUrl.trim() || undefined,
      status,
    });
    onDone();
  }

  const hasVideo = !!f.videoUrl.trim();
  const isUpload = f.videoUrl.startsWith("data:");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-forest-deep/40 p-4" onClick={onDone}>
      <div className="w-full max-w-lg rounded-2xl bg-parchment-card p-6 shadow-glow" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-xl text-forest-deep">Add a Testimonial</h3>
        <p className="mt-1 text-xs text-ink-faint">Add a written quote, a video, or both.</p>

        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={input} placeholder="Name *" value={f.author} onChange={(e) => setF((x) => ({ ...x, author: e.target.value }))} />
            <input className={input} placeholder="Role / company" value={f.roleCompany} onChange={(e) => setF((x) => ({ ...x, roleCompany: e.target.value }))} />
          </div>
          <select className={input} value={f.categorySlug} onChange={(e) => setF((x) => ({ ...x, categorySlug: e.target.value as CategorySlug | "" }))}>
            <option value="">Which service? (optional)</option>
            {CATEGORIES.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
          </select>
          <div className="flex items-center gap-1">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Rating</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setF((x) => ({ ...x, rating: n }))} className={`text-xl ${n <= f.rating ? "text-firefly" : "text-firefly/25"}`} aria-label={`${n} stars`}>★</button>
            ))}
          </div>
          <textarea rows={3} className={input} placeholder="Quote / caption (optional for video)" value={f.quote} onChange={(e) => setF((x) => ({ ...x, quote: e.target.value }))} />

          <div className="rounded-xl border border-twilight/25 bg-twilight/5 p-3">
            <p className="text-xs font-semibold text-twilight">Video (optional)</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="flex-1 rounded-lg border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly"
                placeholder="Paste YouTube, Vimeo or video URL…"
                value={isUpload ? "" : f.videoUrl}
                onChange={(e) => setF((x) => ({ ...x, videoUrl: e.target.value }))}
              />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="btn-ghost whitespace-nowrap text-xs">
                {busy ? "Uploading…" : "⬆ Upload file"}
              </button>
              <input ref={fileRef} type="file" accept="video/*" onChange={onFile} className="hidden" />
            </div>
            {hasVideo && (
              <p className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
                ✓ {isUpload ? "Video file attached" : "Video link added"}
                <button type="button" onClick={() => setF((x) => ({ ...x, videoUrl: "" }))} className="text-rose-600 hover:underline">remove</button>
              </p>
            )}
            <p className="mt-1 text-[11px] text-ink-faint">Links are best. Uploads max {MAX_UPLOAD_MB} MB.</p>
          </div>

          {err && <p className="text-xs text-rose-600">{err}</p>}
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={() => save("approved")} className="btn-primary flex-1">Save &amp; publish</button>
          <button onClick={() => save("pending")} className="btn-ghost">Save as draft</button>
          <button onClick={onDone} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}
