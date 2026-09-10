"use client";

import {
  getSettings, saveSettings, Settings,
  getEffectiveCategory, saveCategoryOverride,
  getEffectiveList, saveListOverride,
} from "@/lib/store";
import {
  CATEGORIES,
  MENTORING_BUILDS, LEADERSHIP_THEMES, SYSTEMS_FIXES, SYSTEMS_CORE, EXPERIENCES_CREATE,
} from "@/lib/content";
import { Panel } from "@/components/admin/ui";

const cls = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";
const upd = (patch: Partial<Settings>) => saveSettings(patch);

/** Footer/pricing/clients wording + the Smart-VA link. */
export function BrandTaglinesPanel() {
  const s = getSettings();
  const rows: { key: keyof Settings; label: string; area?: boolean }[] = [
    { key: "brandEthos", label: "Footer line (ethos)" },
    { key: "brandCheeky", label: "Footer sub-line", area: true },
    { key: "brandFooterStrip", label: "Footer strip (bottom, caps)" },
    { key: "pricingDisclaimer", label: "Pricing disclaimer", area: true },
    { key: "clientsTagline", label: "Clients section tagline" },
    { key: "smartVaUrl", label: "“Smart VA” link (optional URL)" },
  ];
  return (
    <Panel className="mb-6">
      <h2 className="font-serif text-lg text-forest-deep">Brand &amp; taglines</h2>
      <p className="text-xs text-ink-faint">Wording shown across the public site (footer, pricing, clients section).</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {rows.map(({ key, label, area }) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</label>
            {area ? (
              <textarea defaultValue={s[key] as string} rows={2} onBlur={(e) => upd({ [key]: e.target.value } as Partial<Settings>)} className={cls} />
            ) : (
              <input defaultValue={s[key] as string} onBlur={(e) => upd({ [key]: e.target.value } as Partial<Settings>)} className={cls} />
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

/** The 3 sub-brand pages' name/tagline/audience/description. */
export function SubBrandsPanel() {
  return (
    <Panel className="mb-6">
      <h2 className="font-serif text-lg text-forest-deep">Sub-brand pages</h2>
      <p className="text-xs text-ink-faint">Name, tagline, who-it&rsquo;s-for and description on each sub-brand page (/mentoring, /systems, /experiences) and the home cards. Blank = built-in default.</p>
      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        {CATEGORIES.map((base) => {
          const c = getEffectiveCategory(base.slug);
          return (
            <div key={base.slug} className="space-y-2 rounded-xl border border-firefly/15 bg-parchment-warm/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-firefly-deep">/{base.slug}</p>
              <input className={cls} defaultValue={c.name} placeholder="Name" onBlur={(e) => saveCategoryOverride(base.slug, { name: e.target.value })} />
              <input className={cls} defaultValue={c.tagline} placeholder="Tagline" onBlur={(e) => saveCategoryOverride(base.slug, { tagline: e.target.value })} />
              <input className={cls} defaultValue={c.audience} placeholder="Who it's for" onBlur={(e) => saveCategoryOverride(base.slug, { audience: e.target.value })} />
              <textarea className={cls} rows={3} defaultValue={c.description} placeholder="Description" onBlur={(e) => saveCategoryOverride(base.slug, { description: e.target.value })} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/** Bullet lists on the Mentoring / Systems / Experiences pages. */
export function PageListsPanel() {
  const LISTS: { id: string; label: string; page: string; seed: string[] }[] = [
    { id: "mentoring-builds", label: "What learners build", page: "/mentoring", seed: MENTORING_BUILDS },
    { id: "leadership-themes", label: "Leadership & EVA themes", page: "/mentoring", seed: LEADERSHIP_THEMES },
    { id: "systems-fixes", label: "What we fix", page: "/systems", seed: SYSTEMS_FIXES },
    { id: "systems-core", label: "Core services", page: "/systems", seed: SYSTEMS_CORE },
    { id: "experiences-create", label: "What we create", page: "/experiences", seed: EXPERIENCES_CREATE },
  ];
  return (
    <Panel className="mb-6">
      <h2 className="font-serif text-lg text-forest-deep">Page content lists</h2>
      <p className="text-xs text-ink-faint">The bullet lists on the Mentoring, Systems and Experiences pages. One item per line; blank = built-in default.</p>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {LISTS.map((l) => (
          <div key={l.id}>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">{l.label} <span className="text-ink-faint/60">({l.page})</span></label>
            <textarea className={`${cls} leading-relaxed`} rows={6} defaultValue={getEffectiveList(l.id, l.seed).join("\n")} onBlur={(e) => saveListOverride(l.id, e.target.value.split("\n"))} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/** All site-copy editors, for the Marketing → Site Copy tab. */
export function SiteContentPanels() {
  return (
    <>
      <BrandTaglinesPanel />
      <SubBrandsPanel />
      <PageListsPanel />
    </>
  );
}
