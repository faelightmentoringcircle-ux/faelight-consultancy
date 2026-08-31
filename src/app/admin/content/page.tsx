"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_HOME,
  HomeContent,
  getHomeContent,
  saveHomeContent,
  resetHomeContent,
  onStoreChange,
} from "@/lib/store";
import { AdminHeader, Panel } from "@/components/admin/ui";

const input =
  "w-full rounded-xl border border-firefly/25 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-firefly";
const labelCls = "block text-xs font-semibold uppercase tracking-wide text-ink-faint";

function Field({
  label,
  value,
  onChange,
  textarea = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className={labelCls}>{label}</span>
      {textarea ? (
        <textarea rows={2} className={input} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={input} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <span className="block text-[11px] text-ink-faint">{hint}</span>}
    </label>
  );
}

export default function ContentEditorPage() {
  const [form, setForm] = useState<HomeContent>(DEFAULT_HOME);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setForm(getHomeContent());
    sync();
    return onStoreChange(sync);
  }, []);

  const set = (patch: Partial<HomeContent>) => {
    setForm((f) => ({ ...f, ...patch }));
    setSaved(false);
  };

  function save() {
    saveHomeContent(form);
    setSaved(true);
  }
  function reset() {
    resetHomeContent();
    setForm(DEFAULT_HOME);
    setSaved(false);
  }

  return (
    <>
      <AdminHeader
        title="Landing / Content"
        subtitle="Edit the homepage hero and call-to-action buttons. Changes appear live on the site."
        action={
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="btn-ghost !py-2 text-xs">
              View site ↗
            </Link>
            <button onClick={reset} className="btn-ghost !py-2 text-xs">
              Reset to default
            </button>
            <button onClick={save} className="btn-primary !py-2 text-xs">
              {saved ? "✓ Saved" : "Save changes"}
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <Panel className="space-y-4">
          <h2 className="font-serif text-lg text-forest-deep">Hero Section</h2>
          <Field label="Eyebrow" value={form.eyebrow} onChange={(v) => set({ eyebrow: v })} />
          <Field label="Headline — line 1" value={form.titleLine1} onChange={(v) => set({ titleLine1: v })} />
          <Field
            label="Headline — accent line (gold)"
            value={form.titleAccent}
            onChange={(v) => set({ titleAccent: v })}
          />
          <Field label="Subline" value={form.subline} onChange={(v) => set({ subline: v })} textarea />
          <Field label="Tagline (italic)" value={form.tagline} onChange={(v) => set({ tagline: v })} textarea />

          <h2 className="pt-2 font-serif text-lg text-forest-deep">Call-to-Action Buttons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary button label" value={form.ctaPrimaryLabel} onChange={(v) => set({ ctaPrimaryLabel: v })} />
            <Field label="Primary button link" value={form.ctaPrimaryHref} onChange={(v) => set({ ctaPrimaryHref: v })} hint="e.g. /book" />
            <Field label="Secondary button label" value={form.ctaSecondaryLabel} onChange={(v) => set({ ctaSecondaryLabel: v })} />
            <Field label="Secondary button link" value={form.ctaSecondaryHref} onChange={(v) => set({ ctaSecondaryHref: v })} hint="e.g. /classes" />
          </div>

          <h2 className="pt-2 font-serif text-lg text-forest-deep">About-Page Video / Trailer</h2>
          <Field
            label="Video link"
            value={form.aboutVideoUrl}
            onChange={(v) => set({ aboutVideoUrl: v })}
            hint="YouTube, Vimeo or a direct .mp4 link. Leave blank to show a “coming soon” placeholder."
          />
          <Field label="Video caption / title" value={form.aboutVideoCaption} onChange={(v) => set({ aboutVideoCaption: v })} />
        </Panel>

        {/* Live preview */}
        <Panel className="space-y-4">
          <h2 className="font-serif text-lg text-forest-deep">Preview</h2>
          <div className="starfield relative overflow-hidden rounded-2xl bg-enchanted p-6 text-parchment">
            <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-firefly-bright">
              ✦ {form.eyebrow}
            </p>
            <h3 className="mt-3 font-serif text-2xl leading-tight">
              {form.titleLine1}
              <br />
              <span className="text-firefly-bright">{form.titleAccent}</span>
            </h3>
            <p className="mt-3 text-sm text-parchment/80">{form.subline}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="btn-gold !py-2 text-xs">{form.ctaPrimaryLabel || "Primary"}</span>
              <span className="btn-ghost-light !py-2 text-xs">{form.ctaSecondaryLabel || "Secondary"}</span>
            </div>
            {form.tagline && <p className="mt-4 text-xs italic text-parchment/55">{form.tagline}</p>}
          </div>
          <p className="text-xs text-ink-faint">
            This demo saves content in your browser. In production it writes to the shared database and
            updates the live homepage for everyone.
          </p>
        </Panel>
      </div>
    </>
  );
}
