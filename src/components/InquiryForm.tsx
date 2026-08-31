"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CATEGORIES,
  CategorySlug,
  HEARD_OPTIONS,
  SERVICES,
  BRAND,
} from "@/lib/content";
import { addLead } from "@/lib/store";
import { Star } from "./Motifs";

export function InquiryForm(props: {
  defaultCategory?: CategorySlug;
  compact?: boolean;
}) {
  return (
    <Suspense fallback={<div className="card h-96 animate-pulse bg-parchment-warm/40" />}>
      <InquiryFormInner {...props} />
    </Suspense>
  );
}

function InquiryFormInner({
  defaultCategory,
  compact = false,
}: {
  defaultCategory?: CategorySlug;
  compact?: boolean;
}) {
  const params = useSearchParams();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    categorySlug: (defaultCategory ?? "") as CategorySlug | "",
    serviceId: "",
    message: "",
    source: "",
    agreedToUpdates: false,
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const serviceOptions = form.categorySlug
    ? SERVICES.filter((s) => s.categorySlug === form.categorySlug)
    : SERVICES;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addLead({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
      categorySlug: form.categorySlug || null,
      serviceId: form.serviceId || null,
      message: form.message.trim(),
      source: form.source || "Not specified",
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
      agreedToUpdates: form.agreedToUpdates,
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-forest text-2xl text-firefly-bright shadow-glow">
          ✦
        </div>
        <h3 className="font-serif text-2xl text-forest-deep">
          Your message found its way to us.
        </h3>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Thank you, {form.name.split(" ")[0] || "friend"}. Someone from the
          Faelight team will reach out soon. In the meantime, feel free to book a
          discovery call.
        </p>
        <p className="mt-4 text-xs text-ink-faint">
          <em>Demo note:</em> this saved a lead to the admin pipeline and would
          normally email {BRAND ? "the team" : ""} via Resend.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/book" className="btn-primary">Book a Discovery Call</a>
          <button
            onClick={() => {
              setSent(false);
              setForm((f) => ({ ...f, message: "" }));
            }}
            className="btn-ghost"
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-firefly/25 bg-white/70 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-firefly focus:ring-2 focus:ring-firefly/30";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

  return (
    <form onSubmit={submit} className="card space-y-4">
      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div>
          <label className={labelCls} htmlFor="if-name">Name<span className="text-firefly-deep">*</span></label>
          <input id="if-name" required className={inputCls} value={form.name}
            onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="if-email">Email<span className="text-firefly-deep">*</span></label>
          <input id="if-email" required type="email" className={inputCls} value={form.email}
            onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="if-phone">Phone <span className="normal-case text-ink-faint">(optional)</span></label>
          <input id="if-phone" className={inputCls} value={form.phone}
            onChange={(e) => set("phone", e.target.value)} placeholder="+63 …" />
        </div>
        <div>
          <label className={labelCls} htmlFor="if-company">Company / team <span className="normal-case text-ink-faint">(optional)</span></label>
          <input id="if-company" className={inputCls} value={form.company}
            onChange={(e) => set("company", e.target.value)} placeholder="Your business" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="if-cat">I'm interested in</label>
          <select id="if-cat" className={inputCls} value={form.categorySlug}
            onChange={(e) => { set("categorySlug", e.target.value); set("serviceId", ""); }}>
            <option value="">Not sure yet</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="if-svc">Specific service <span className="normal-case text-ink-faint">(optional)</span></label>
          <select id="if-svc" className={inputCls} value={form.serviceId}
            onChange={(e) => set("serviceId", e.target.value)}>
            <option value="">Any / not sure</option>
            {serviceOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="if-msg">Message<span className="text-firefly-deep">*</span></label>
        <textarea id="if-msg" required rows={compact ? 3 : 4} className={inputCls} value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us what's on your mind — the mess, the goal, the dream." />
      </div>

      <div>
        <label className={labelCls} htmlFor="if-heard">How did you hear about us?</label>
        <select id="if-heard" className={inputCls} value={form.source}
          onChange={(e) => set("source", e.target.value)}>
          <option value="">Select one</option>
          {HEARD_OPTIONS.map((h) => (<option key={h} value={h}>{h}</option>))}
        </select>
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" checked={form.agreedToUpdates}
          onChange={(e) => set("agreedToUpdates", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-firefly/40 text-forest focus:ring-firefly" />
        <span>Keep me in the loop with occasional Faelight updates and offers.</span>
      </label>

      <button type="submit" className="btn-primary w-full">
        <Star className="text-firefly-bright" /> Send message
      </button>
      <p className="text-center text-xs text-ink-faint">
        We reply within 1–2 business days. No spam, ever.
      </p>
    </form>
  );
}
