"use client";

import { useEffect, useState } from "react";
import { getApprovedReviews, addReview, onStoreChange, Review } from "@/lib/store";
import { CATEGORIES, CategorySlug } from "@/lib/content";
import { videoEmbed } from "@/lib/format";
import { Eyebrow } from "./Motifs";

function Stars({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <div className="text-sm text-firefly" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
      <span className="text-firefly/25">{"★".repeat(5 - n)}</span>
    </div>
  );
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setReviews(getApprovedReviews());
    sync();
    return onStoreChange(sync);
  }, []);

  const videoReviews = reviews.filter((r) => videoEmbed(r.videoUrl));
  const textReviews = reviews.filter((r) => !videoEmbed(r.videoUrl));

  return (
    <section className="section bg-parchment-warm/60">
      <div className="container-fae">
        <div className="text-center">
          <Eyebrow>Kind words</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">What people say</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-faint">
            Real words from the people and teams we've worked with.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="mt-12">
            <TestimonialsGrid reviews={[...videoReviews, ...textReviews].slice(0, 6)} />
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-ink-faint">Be the first to share your experience ✦</p>
        )}

        <div className="mt-10 text-center">
          {open ? (
            <ReviewForm onDone={() => setOpen(false)} />
          ) : (
            <button onClick={() => setOpen(true)} className="btn-ghost">
              ✦ Share your experience
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "★";
}

// Lays reviews out by count: one is centered and prominent, two sit as a
// centered pair, three or more fill a professional 3-up grid. Videos first.
export function TestimonialsGrid({ reviews }: { reviews: Review[] }) {
  const ordered = [...reviews].sort(
    (a, b) => (videoEmbed(b.videoUrl) ? 1 : 0) - (videoEmbed(a.videoUrl) ? 1 : 0)
  );
  const n = ordered.length;
  const cls =
    n <= 1
      ? "mx-auto grid max-w-xl gap-6"
      : n === 2
      ? "mx-auto grid max-w-3xl gap-6 sm:grid-cols-2"
      : "grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={cls}>
      {ordered.map((t) =>
        videoEmbed(t.videoUrl) ? <VideoCard key={t.id} t={t} /> : <TestimonialCard key={t.id} t={t} />
      )}
    </div>
  );
}

// Branded "Client Testimonial" card — dark forest panel, firefly-ringed avatar,
// gold stars and quote marks. Photo/logo are optional (from a published review).
export function TestimonialCard({ t }: { t: Review }) {
  return (
    <figure className="relative flex flex-col overflow-hidden rounded-3xl border border-firefly/20 bg-forest-deep p-7 text-parchment shadow-card">
      <span aria-hidden className="pointer-events-none absolute -right-1 top-1 select-none font-serif text-7xl leading-none text-firefly/20">”</span>
      <span aria-hidden className="pointer-events-none absolute left-4 top-3 select-none font-serif text-4xl leading-none text-firefly/30">“</span>

      <div className="flex flex-col items-center text-center">
        {t.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.photo} alt={t.author} className="h-20 w-20 rounded-full object-cover ring-4 ring-firefly shadow-glow" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-firefly/15 font-serif text-2xl text-firefly ring-4 ring-firefly">
            {initials(t.author)}
          </div>
        )}
        <figcaption className="mt-3">
          <p className="font-serif text-lg font-bold uppercase tracking-wide text-parchment">{t.author}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-eyebrow text-firefly">{t.roleCompany}</p>
        </figcaption>
        <div className="mt-2"><Stars n={t.rating} /></div>
        {t.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.logo} alt="" className="mt-3 h-6 max-w-[100px] object-contain opacity-90" />
        )}
      </div>

      {t.quote && (
        <blockquote className="mt-4 text-center text-sm leading-relaxed text-parchment/85">{t.quote}</blockquote>
      )}
    </figure>
  );
}

export function VideoCard({ t }: { t: Review }) {
  const v = videoEmbed(t.videoUrl);
  if (!v) return null;
  return (
    <figure className="flex flex-col overflow-hidden rounded-3xl border border-firefly/20 bg-forest-deep text-parchment shadow-card">
      <div className="relative aspect-video w-full bg-twilight-deep">
        {v.kind === "iframe" ? (
          <iframe
            src={v.src}
            title={`${t.author} — video testimonial`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={v.src} controls playsInline className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="truncate font-serif text-base font-bold uppercase tracking-wide text-parchment">{t.author}</p>
          <p className="truncate text-[11px] font-semibold uppercase tracking-eyebrow text-firefly">{t.roleCompany}</p>
          {t.quote && <p className="mt-1 line-clamp-2 text-sm text-parchment/80">“{t.quote}”</p>}
        </div>
        <Stars n={t.rating} />
      </figcaption>
    </figure>
  );
}

function ReviewForm({ onDone }: { onDone: () => void }) {
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ author: "", roleCompany: "", quote: "", categorySlug: "" as CategorySlug | "", rating: 5 });
  const input = "w-full rounded-xl border border-firefly/25 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-firefly";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addReview({
      author: f.author.trim(),
      roleCompany: f.roleCompany.trim() || "Faelight client",
      quote: f.quote.trim(),
      categorySlug: f.categorySlug || null,
      rating: f.rating,
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg card text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-forest text-2xl text-firefly-bright shadow-glow">✦</div>
        <p className="font-serif text-xl text-forest-deep">Thank you!</p>
        <p className="mt-1 text-sm text-ink-soft">
          Your review has been submitted and is awaiting approval before it appears on the site.
        </p>
        <button onClick={onDone} className="btn-ghost mt-4">Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg card space-y-3 text-left">
      <h3 className="font-serif text-lg text-forest-deep">Share your experience</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required className={input} placeholder="Your name" value={f.author} onChange={(e) => setF((x) => ({ ...x, author: e.target.value }))} />
        <input className={input} placeholder="Role / company (optional)" value={f.roleCompany} onChange={(e) => setF((x) => ({ ...x, roleCompany: e.target.value }))} />
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
      <textarea required rows={3} className={input} placeholder="Tell us about your experience…" value={f.quote} onChange={(e) => setF((x) => ({ ...x, quote: e.target.value }))} />
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">Submit review</button>
        <button type="button" onClick={onDone} className="btn-ghost">Cancel</button>
      </div>
      <p className="text-center text-xs text-ink-faint">Reviews are approved by the Faelight team before appearing on the site.</p>
    </form>
  );
}
