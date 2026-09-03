"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getSessions,
  onStoreChange,
  addRegistration,
  logActivity,
  sendRegistrationEmail,
  ComposedEmail,
  sessionDateText,
  sessionSeatText,
  sessionSlug,
  seatsLeft,
  isSoldOut,
  applyPromoToSession,
  PromoResult,
  SessionItem,
} from "@/lib/store";
import { peso } from "@/lib/format";
import { FOUNDER } from "@/lib/content";
import { Eyebrow, Fireflies, FairySwirl, Glow, Star } from "@/components/Motifs";

/**
 * Shared registration landing.
 * `wanted` is an optional session token from a clean URL (/register/<slug>).
 * When omitted, it falls back to the ?session= query param, then the next
 * upcoming session — so /register, /register?session=id and /register/<slug>
 * all render the same experience.
 */
export function RegisterLanding({ wanted }: { wanted?: string }) {
  return (
    <Suspense fallback={<div className="section container-fae text-ink-faint">Loading…</div>}>
      <RegisterInner forced={wanted} />
    </Suspense>
  );
}

function RegisterInner({ forced }: { forced?: string }) {
  const params = useSearchParams();
  const token = forced ?? params.get("session") ?? "";
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  useEffect(() => {
    const sync = () => setSessions(getSessions());
    sync();
    return onStoreChange(sync);
  }, []);

  const session = useMemo(() => {
    if (token) {
      const t = token.trim().toLowerCase();
      const match =
        sessions.find((s) => s.id === token) ?? sessions.find((s) => sessionSlug(s) === t);
      if (match) return match;
    }
    return sessions.find((s) => s.status === "upcoming");
  }, [sessions, token]);

  if (sessions.length === 0) return <div className="section container-fae text-ink-faint">Loading…</div>;

  if (!session)
    return (
      <div className="section container-fae text-center">
        <p className="text-ink-soft">That session couldn’t be found.</p>
        <Link href="/classes" className="mt-3 inline-block font-semibold text-firefly-deep hover:underline">← Back to all classes</Link>
      </div>
    );

  return <Landing s={session} />;
}

// Detect a batch number from a title like "Foundations Class Batch 5".
function parseBatch(title: string): string {
  const m = title.match(/batch\s*(\d+)/i) || title.match(/cohort\s*(\d+)/i);
  return m ? m[1] : "";
}

const PACKAGES = ["Regular", "VIP"] as const;
type Pkg = (typeof PACKAGES)[number];

function Landing({ s }: { s: SessionItem }) {
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState<PromoResult | null>(null);

  // Google-Form fields, mirrored inline
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [fb, setFb] = useState("");
  const [pkg, setPkg] = useState<Pkg>("Regular");
  const [goal, setGoal] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [sentEmail, setSentEmail] = useState<ComposedEmail | null>(null);
  const [delivery, setDelivery] = useState<string>("");
  const [showEmail, setShowEmail] = useState(false);

  const sold = isSoldOut(s);
  const left = seatsLeft(s);
  const free = s.price === 0 || (s.price == null && s.kind === "webinar");
  const base = s.price ?? 0;
  const finalPrice = promo?.ok ? promo.final : base;
  const days = (s.curriculum ?? []).filter((d) => d.title.trim() || d.detail.trim());
  const perks = (s.perks ?? []).map((p) => p.trim()).filter(Boolean);
  // Coach profile — fall back to Maia (founder) for Maia-hosted sessions so it
  // shows even on older saved data without coach fields.
  const isMaia = /maia|casta/i.test(s.host);
  const coachName = s.host || FOUNDER.name;
  const coachPhoto = s.hostPhoto || (isMaia ? "/brand/maia-portrait.jpg" : "");
  const coachRole = s.hostRole || (isMaia ? FOUNDER.role : "");
  const coachBio = s.hostBio || (isMaia ? FOUNDER.bio : "");
  const showCoach = !!(coachPhoto || coachBio || coachRole);

  function checkCode() {
    setPromo(applyPromoToSession(s, code));
  }
  function clearCode() {
    setCode("");
    setPromo(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErr("Please add your name and email.");
      return;
    }
    const notes = [
      goal.trim() && `Wants to learn: ${goal.trim()}`,
      mobile.trim() && `Mobile: ${mobile.trim()}`,
      fb.trim() && `FB: ${fb.trim()}`,
      promo?.ok && promo.discount > 0 && `Promo ${promo.code} (−${peso(promo.discount)})`,
    ]
      .filter(Boolean)
      .join(" · ");

    addRegistration({
      name: name.trim(),
      email: email.trim(),
      item: s.title,
      type: s.kind,
      batch: parseBatch(s.title),
      tier: pkg,
      amountPaid: "",
      paymentMethod: "",
      datePaid: "",
      status: "registered",
      leadFrom: "Website",
      viaWebsite: true,
      niche: "",
      notes,
    });
    logActivity("event", `New registration: ${name.trim()}`, `${s.title} · ${pkg}`, "/admin/registrations");
    setDone(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    // Send the confirmation email (admin-editable template, auto-filled with
    // THIS person's name and details; delivered to their inbox if configured).
    const res = await sendRegistrationEmail({
      to: email.trim(),
      name: name.trim(),
      session: s,
      packageLabel: pkg,
      price: promo?.ok ? promo.final : s.price,
    });
    setSentEmail(res.email);
    setDelivery(res.delivery);
  }

  // ---- Success state ----
  if (done)
    return (
      <section className="starfield relative grid min-h-[70vh] place-items-center overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={26} />
        <FairySwirl count={4} />
        <Glow className="left-1/2 top-1/4 -translate-x-1/2" size={520} />
        <div className="container-fae relative z-10 max-w-lg text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-firefly/20 text-4xl text-firefly-bright animate-twinkle">✓</div>
          <h1 className="mt-6 font-serif text-3xl sm:text-4xl">You’re on the list! ✦</h1>
          <p className="mt-4 text-parchment/80">
            Thanks, <span className="text-firefly-bright">{name.split(" ")[0]}</span> — your spot for{" "}
            <strong className="text-parchment">{s.title}</strong> is saved. The Faelight team will reach out with the
            next steps and payment details.
          </p>

          {sentEmail && (
            <div className="mx-auto mt-6 max-w-md text-left">
              <p className="text-center text-sm text-firefly-bright">
                {delivery === "delivered"
                  ? <>✉ A confirmation email is on its way to <strong>{sentEmail.to}</strong> — check your inbox!</>
                  : <>✉ Your confirmation for <strong>{sentEmail.to}</strong> is ready</>}
              </p>
              <button
                onClick={() => setShowEmail((v) => !v)}
                className="mx-auto mt-2 block text-xs text-parchment/60 underline hover:text-firefly-bright"
              >
                {showEmail ? "Hide email" : "Preview the email"}
              </button>
              {showEmail && (
                <div className="mt-3 rounded-2xl border border-firefly/25 bg-white/5 p-4 backdrop-blur">
                  <p className="text-[11px] text-parchment/50">From: {sentEmail.from}</p>
                  <p className="mt-0.5 text-sm font-semibold text-parchment">{sentEmail.subject}</p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-parchment/75">{sentEmail.body}</pre>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/classes" className="btn-gold">Browse more classes</Link>
            <Link href="/" className="btn-ghost-light">Back to home</Link>
          </div>
        </div>
      </section>
    );

  return (
    <>
      {/* Hero — gold blinking lights */}
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={22} />
        <FairySwirl count={3} />
        <Glow className="-left-16 top-4" size={460} />
        <Glow className="right-0 bottom-0" color="rgba(230,183,82,0.25)" size={360} />
        <div className="container-fae relative z-10 grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.35fr,0.65fr]">
          <div>
          <Link href="/classes" className="text-xs text-parchment/60 hover:text-firefly-bright">← All classes &amp; webinars</Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${s.kind === "webinar" ? "bg-twilight/30 text-parchment" : "bg-firefly/20 text-firefly-bright"}`}>
              {s.kind}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${sold ? "text-rose-300" : "text-firefly-bright"}`}>
              <span className="h-2 w-2 animate-twinkle rounded-full bg-firefly-bright shadow-[0_0_8px_2px_rgba(244,212,136,0.7)]" />
              {sessionSeatText(s)}
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.05] sm:text-6xl">
            Save your seat.<br /><span className="text-firefly-bright">Start your glow-up.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-parchment/80">{s.title} — {s.blurb}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2"><Star className="text-firefly" /> {sessionDateText(s)}</span>
            <span className="inline-flex items-center gap-2"><Star className="text-firefly" /> Hosted by {s.host}</span>
            {typeof s.price === "number" && (
              <span className="inline-flex items-center gap-2"><Star className="text-firefly" /> {free ? "Free to join" : `${peso(s.price)} / seat`}</span>
            )}
          </div>
          <a href="#register" className="btn-gold mt-8 inline-block">✦ Reserve my seat</a>
          </div>

          {/* Coach / host profile card */}
          {showCoach && (
            <div className="relative mx-auto w-full max-w-sm">
              <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-firefly/30 via-transparent to-twilight/25 blur-2xl" />
              <div className="relative rounded-3xl border border-firefly/30 bg-white/[0.06] p-6 text-center backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-eyebrow text-firefly-bright/70">Your coach</p>
                {coachPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coachPhoto} alt={coachName} className="mx-auto mt-3 h-28 w-28 rounded-full object-cover ring-2 ring-firefly/50 shadow-[0_0_30px_rgba(230,183,82,0.35)]" />
                ) : (
                  <div className="mx-auto mt-3 grid h-28 w-28 place-items-center rounded-full bg-firefly/15 text-3xl font-serif text-firefly-bright ring-2 ring-firefly/50">
                    {coachName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </div>
                )}
                <h3 className="mt-4 font-serif text-xl text-parchment">{coachName}</h3>
                {coachRole && <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-firefly-bright">{coachRole}</p>}
                {coachBio && <p className="mt-3 text-sm leading-relaxed text-parchment/75">{coachBio}</p>}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Poster / banner image */}
      {s.posterUrl && (
        <section className="relative overflow-hidden bg-enchanted py-10">
          <Fireflies count={10} />
          <div className="container-fae relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.posterUrl}
              alt={s.title}
              className="mx-auto w-full max-w-4xl rounded-2xl border-2 border-firefly/40 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
            />
          </div>
        </section>
      )}

      {/* Body */}
      <section id="register" className="section relative overflow-hidden scroll-mt-16">
        <FairySwirl count={2} variant="light" />
        <div className="container-fae relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1fr,1.1fr]">
          {/* Left — why join + seats */}
          <div>
            <Eyebrow>Why join</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl text-forest-deep">Learn live, with people who care.</h2>
            <ul className="mt-5 space-y-3">
              {[
                "Live sessions — not another course you never finish.",
                "A warm cohort and mentors who actually reply.",
                "Real tools, templates and a first-week playbook.",
                "A community that cheers you on after class ends.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-ink-soft">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-firefly/15 text-[11px] text-firefly-deep">✦</span>
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoTile label="When" value={sessionDateText(s)} />
              <InfoTile label="Format" value={s.kind === "webinar" ? "Live online webinar" : "Live cohort class"} />
            </div>

            {typeof s.seatsTotal === "number" && left !== null && (
              <div className="mt-6 rounded-2xl border border-firefly/20 bg-parchment-warm/50 p-4">
                <div className="mb-1 flex justify-between text-xs text-ink-faint">
                  <span>{s.seatsTotal - left} enrolled</span>
                  <span className="font-semibold text-firefly-deep">{left} of {s.seatsTotal} seats left</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-forest/10">
                  <div
                    className={`h-full rounded-full ${left === 0 ? "bg-rose-400" : left / s.seatsTotal <= 0.25 ? "bg-firefly" : "bg-forest"}`}
                    style={{ width: `${Math.max(6, Math.round(((s.seatsTotal - left) / s.seatsTotal) * 100))}%` }}
                  />
                </div>
                {left / s.seatsTotal <= 0.35 && left > 0 && (
                  <p className="mt-2 text-xs font-semibold text-firefly-deep">🔥 Filling fast — grab your seat!</p>
                )}
              </div>
            )}

            {/* What you'll get — day by day (fills the space under Why join) */}
            {days.length > 0 && (
              <div className="mt-8">
                <Eyebrow>What you&rsquo;ll get</Eyebrow>
                <h3 className="mt-3 font-serif text-xl text-forest-deep">Your {days.length}-day journey</h3>
                <div className="mt-4 space-y-2.5">
                    {days.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-firefly/15 bg-white/50 p-3">
                        {d.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={d.image} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-firefly/40" />
                        ) : (
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-lg text-firefly-bright">{d.icon || "✦"}</div>
                        )}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-eyebrow text-firefly-deep">Day {i + 1}</p>
                          <p className="font-semibold text-forest-deep">{d.title}</p>
                          <p className="text-xs text-ink-soft">{d.detail}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — the form, glowing */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-firefly/25 via-transparent to-twilight/20 blur-2xl" />
            <form
              onSubmit={submit}
              className="relative overflow-hidden rounded-3xl border border-firefly/30 bg-parchment-card p-6 shadow-card sm:p-8"
            >
              {/* blinking gold lights inside the card header */}
              <div className="relative -mx-6 -mt-6 mb-6 overflow-hidden bg-enchanted px-6 py-6 text-parchment sm:-mx-8 sm:px-8">
                <Fireflies count={12} />
                <FairySwirl count={2} />
                <div className="relative z-10">
                  <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-firefly-bright/80">Registration</p>
                  <p className="mt-1 font-serif text-2xl">Reserve your seat</p>
                  {!free && (
                    <p className="mt-2 text-sm text-parchment/75">
                      {promo?.ok && promo.discount > 0 ? (
                        <>
                          <span className="font-serif text-xl text-firefly-bright">{peso(finalPrice)}</span>{" "}
                          <span className="text-parchment/50 line-through">{peso(base)}</span>
                        </>
                      ) : (
                        <span className="font-serif text-xl text-firefly-bright">{peso(base)}</span>
                      )}
                      <span className="text-parchment/60"> / seat</span>
                    </p>
                  )}
                </div>
              </div>

              {sold ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-center text-sm text-rose-700">
                  This session is sold out. <Link href="/classes" className="font-semibold underline">See other classes →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="Email address" required>
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} className={inputCls} placeholder="you@email.com" />
                  </Field>
                  <Field label="Your name" required>
                    <input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} className={inputCls} placeholder="Full name" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Mobile number">
                      <input value={mobile} onChange={(e) => setMobile(e.target.value)} className={inputCls} placeholder="09xx xxx xxxx" />
                    </Field>
                    <Field label="FB Messenger name">
                      <input value={fb} onChange={(e) => setFb(e.target.value)} className={inputCls} placeholder="Your Messenger name" />
                    </Field>
                  </div>

                  <Field label="Which package are you interested in?">
                    <div className="flex flex-wrap justify-center gap-3">
                      {PACKAGES.map((p) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setPkg(p)}
                          className={`min-w-[140px] flex-1 rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition sm:max-w-[180px] ${
                            pkg === p ? "border-firefly bg-firefly/15 text-forest-deep shadow-glow-sm" : "border-firefly/25 bg-white text-ink-soft hover:border-firefly"
                          }`}
                        >
                          {p}
                          {p === "Regular" && !free && <span className="block text-[10px] text-ink-faint">{peso(base)}</span>}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="What do you hope to learn?">
                    <textarea rows={3} value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls} placeholder="Tell us what you're hoping to get out of this…" />
                  </Field>

                  {/* Promo code */}
                  {!free && (
                    <Field label="Promo / scholarship code (optional)">
                      <div className="flex gap-2">
                        <input
                          value={code}
                          onChange={(e) => { setCode(e.target.value.toUpperCase()); if (promo) setPromo(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); checkCode(); } }}
                          className={`${inputCls} font-mono uppercase`}
                          placeholder="ENTER CODE"
                        />
                        <button type="button" onClick={checkCode} className="shrink-0 rounded-xl border border-forest bg-forest px-4 text-xs font-semibold text-parchment hover:bg-forest-deep">Apply</button>
                      </div>
                      {promo && !promo.ok && <p className="mt-1.5 text-xs text-rose-600">{promo.reason}</p>}
                      {promo?.ok && promo.discount > 0 && (
                        <p className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                          ✓ {promo.label ?? promo.code} applied — you save {peso(promo.discount)}
                          <button type="button" onClick={clearCode} className="text-ink-faint hover:text-forest">remove ✕</button>
                        </p>
                      )}
                    </Field>
                  )}

                  {err && <p className="text-sm text-rose-600">{err}</p>}

                  <button type="submit" className="btn-gold w-full !py-3.5 text-sm">
                    ✦ Reserve my seat
                  </button>
                  <p className="text-center text-[11px] text-ink-faint">
                    Free to join the waitlist — no payment now. We’ll confirm your seat and send payment details by email &amp; Messenger.
                  </p>
                </div>
              )}
            </form>
          </div>
          </div>

          {/* Also included — full-width glowing band */}
          {perks.length > 0 && (
            <div className="relative mt-8">
              <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-gradient-to-r from-firefly/30 via-firefly/10 to-twilight/25 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-firefly/40 bg-enchanted p-6 text-parchment shadow-[0_0_40px_rgba(230,183,82,0.25)] sm:p-8">
                <Fireflies count={10} />
                <FairySwirl count={2} />
                <div className="relative z-10">
                  <p className="text-center text-[11px] font-bold uppercase tracking-eyebrow text-firefly-bright">✦ Also included 👑</p>
                  <ul className="mx-auto mt-4 grid max-w-3xl gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {perks.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-parchment/90">
                        <span className="mt-0.5 text-firefly-bright drop-shadow-[0_0_6px_rgba(230,183,82,0.7)]">✦</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
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
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-firefly/15 bg-white/50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-sm font-medium text-forest-deep">{value}</p>
    </div>
  );
}
