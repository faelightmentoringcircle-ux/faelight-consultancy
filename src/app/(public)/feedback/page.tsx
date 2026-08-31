"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getSessions,
  onStoreChange,
  addFeedback,
  logActivity,
  FEEDBACK_CLASSES,
  SessionItem,
} from "@/lib/store";
import { Eyebrow, Fireflies, FairySwirl, Glow, Star } from "@/components/Motifs";

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="section container-fae text-ink-faint">Loading…</div>}>
      <FeedbackInner />
    </Suspense>
  );
}

function FeedbackInner() {
  const params = useSearchParams();
  const wanted = params.get("session");
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  useEffect(() => {
    const sync = () => setSessions(getSessions());
    sync();
    return onStoreChange(sync);
  }, []);

  const session = useMemo(() => sessions.find((s) => s.id === wanted), [sessions, wanted]);
  return <FeedbackForm presetClass={session?.title} presetBatch={session ? batchFromTitle(session.title) : ""} />;
}

function batchFromTitle(title: string): string {
  const m = title.match(/batch\s*(\d+)/i) || title.match(/cohort\s*(\d+)/i);
  return m ? m[1] : "";
}

function FeedbackForm({ presetClass, presetBatch }: { presetClass?: string; presetBatch?: string }) {
  const classOptions = useMemo(() => {
    const base = [...FEEDBACK_CLASSES];
    if (presetClass && !base.includes(presetClass)) base.unshift(presetClass);
    return base;
  }, [presetClass]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [classTaken, setClassTaken] = useState(presetClass ?? FEEDBACK_CLASSES[0]);
  const [batch, setBatch] = useState(presetBatch ?? "");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [canShare, setCanShare] = useState(true);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { if (presetClass) setClassTaken(presetClass); }, [presetClass]);
  useEffect(() => { if (presetBatch) setBatch(presetBatch); }, [presetBatch]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setErr("Please add your name and email."); return; }
    if (rating === 0) { setErr("Please pick a star rating."); return; }
    addFeedback({
      name: name.trim(),
      email: email.trim(),
      classTaken,
      batch: batch.trim(),
      rating,
      liked: liked.trim(),
      improve: improve.trim(),
      canShare,
    });
    logActivity("review", `New feedback: ${name.trim()}`, `${classTaken} · ${rating}★`, "/admin/feedback");
    setDone(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done)
    return (
      <section className="starfield relative grid min-h-[70vh] place-items-center overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={26} />
        <FairySwirl count={4} />
        <Glow className="left-1/2 top-1/4 -translate-x-1/2" size={520} />
        <div className="container-fae relative z-10 max-w-lg text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-firefly/20 text-4xl text-firefly-bright animate-twinkle">♥</div>
          <h1 className="mt-6 font-serif text-3xl sm:text-4xl">Thank you! ✦</h1>
          <p className="mt-4 text-parchment/80">
            Your feedback means the world to us, <span className="text-firefly-bright">{name.split(" ")[0]}</span>. The
            Faelight team reads every response and uses it to make each class better.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/classes" className="btn-gold">Explore more classes</Link>
            <Link href="/" className="btn-ghost-light">Back to home</Link>
          </div>
        </div>
      </section>
    );

  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={20} />
        <FairySwirl count={3} />
        <Glow className="-left-16 top-4" size={440} />
        <div className="container-fae relative z-10 py-14 text-center sm:py-16">
          <Eyebrow light>We’re listening</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-5xl">
            How was your <span className="text-firefly-bright">Faelight</span> experience?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-parchment/75">
            Your honest words help us grow — and might just inspire the next student to begin.
          </p>
        </div>
      </section>

      <section className="section relative overflow-hidden">
        <FairySwirl count={2} variant="light" />
        <div className="container-fae relative z-10 max-w-2xl">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-firefly/25 via-transparent to-twilight/20 blur-2xl" />
            <form onSubmit={submit} className="relative overflow-hidden rounded-3xl border border-firefly/30 bg-parchment-card p-6 shadow-card sm:p-8">
              <div className="relative -mx-6 -mt-6 mb-6 overflow-hidden bg-enchanted px-6 py-6 text-parchment sm:-mx-8 sm:px-8">
                <Fireflies count={12} />
                <FairySwirl count={2} />
                <div className="relative z-10">
                  <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-firefly-bright/80">Feedback</p>
                  <p className="mt-1 font-serif text-2xl">Tell us how it went</p>
                </div>
              </div>

              <div className="space-y-4">
                <Field label="Your name" required>
                  <input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} className={inputCls} placeholder="Full name" />
                </Field>
                <Field label="Email address" required>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} className={inputCls} placeholder="you@email.com" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Class taken" required>
                    <select value={classTaken} onChange={(e) => setClassTaken(e.target.value)} className={inputCls}>
                      {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Batch number">
                    <input value={batch} onChange={(e) => setBatch(e.target.value)} className={inputCls} placeholder="e.g. 3" />
                  </Field>
                </div>

                <Field label="Overall rating" required>
                  <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => { setRating(n); setErr(""); }}
                        onMouseEnter={() => setHover(n)}
                        className={`text-3xl transition ${(hover || rating) >= n ? "text-firefly drop-shadow-[0_0_6px_rgba(230,183,82,0.6)]" : "text-firefly/25"}`}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="What did you enjoy or learn?">
                  <textarea rows={3} value={liked} onChange={(e) => setLiked(e.target.value)} className={inputCls} placeholder="The parts that stood out for you…" />
                </Field>
                <Field label="Anything we could improve?">
                  <textarea rows={2} value={improve} onChange={(e) => setImprove(e.target.value)} className={inputCls} placeholder="Optional — we truly want to know." />
                </Field>

                <label className="flex items-start gap-2.5 rounded-xl border border-firefly/20 bg-white/50 p-3 text-sm text-ink-soft">
                  <input type="checkbox" checked={canShare} onChange={(e) => setCanShare(e.target.checked)} className="mt-0.5" />
                  <span>You may share my feedback as a testimonial on the Faelight site. <Star className="text-firefly" /></span>
                </label>

                {err && <p className="text-sm text-rose-600">{err}</p>}

                <button type="submit" className="btn-gold w-full !py-3.5 text-sm">✦ Send my feedback</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

const inputCls =
  "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-firefly focus:ring-2 focus:ring-firefly/20";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {label}{required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
