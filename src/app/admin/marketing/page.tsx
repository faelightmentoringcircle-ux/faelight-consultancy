"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getLeads, subscribers, getCampaigns, addCampaign, updateCampaign, removeCampaign,
  getSocialAccounts, saveSocialAccount, getVideos, addVideo, removeVideo,
  getIntros, addIntro, updateIntro, removeIntro, onStoreChange,
  runDueCampaigns, getAutomations, saveAutomations,
  getBrands, addBrand, updateBrand, removeBrand, BRAND_GROUPS, getBrandGroupOptions,
  getSocialPosts, addSocialPost, updateSocialPost, removeSocialPost, SOCIAL_PLATFORMS,
  getPromos, addPromo, updatePromo, removePromo,
  Lead, Campaign, SocialAccount, VideoItem, IntroItem, Automations, Brand,
  SocialPost, SocialPostStatus, Promo,
} from "@/lib/store";
import { CATEGORIES, CategorySlug } from "@/lib/content";
import { formatDateTime, relativeDay, formatDateShort } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { AdminHeader, Panel, StatTile } from "@/components/admin/ui";

type Tab = "overview" | "email" | "calendar" | "social" | "content" | "promos" | "brands";

export default function MarketingPage() {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <>
      <AdminHeader
        title="Marketing"
        subtitle="Email, social scheduling, content, offers and brand partners — one marketing hub."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {([
          ["overview", "◈ Overview"],
          ["email", "✉ Email Marketing"],
          ["calendar", "🗓 Content Calendar"],
          ["social", "◎ Social Accounts"],
          ["content", "▶ Videos & Intros"],
          ["promos", "🏷 Promotions"],
          ["brands", "✦ Brands & Clients"],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "border-forest bg-forest text-parchment" : "border-firefly/25 bg-parchment-card text-ink-soft hover:border-firefly"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && <MarketingOverview onGo={setTab} />}
      {tab === "email" && <EmailMarketing />}
      {tab === "calendar" && <ContentCalendar />}
      {tab === "social" && <SocialAccounts />}
      {tab === "content" && <VideosIntros />}
      {tab === "promos" && <Promotions />}
      {tab === "brands" && <BrandsManager />}
    </>
  );
}

// ======================= OVERVIEW =======================
function MarketingOverview({ onGo }: { onGo: (t: Tab) => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subs, setSubs] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    const sync = () => {
      setLeads(getLeads()); setSubs(subscribers()); setCampaigns(getCampaigns());
      setPosts(getSocialPosts()); setAccounts(getSocialAccounts()); setPromos(getPromos());
    };
    sync();
    return onStoreChange(sync);
  }, []);

  const now = new Date();
  const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
  const newSubs30 = subs.filter((s) => new Date(s.createdAt) >= monthAgo).length;
  const sent = campaigns.filter((c) => c.status === "sent");
  const scheduledCampaigns = campaigns.filter((c) => c.status === "scheduled");
  const scheduledPosts = posts.filter((p) => p.status === "scheduled" && new Date(p.scheduledAt) >= now);
  const connected = accounts.filter((a) => a.connected).length;
  const activePromos = promos.filter((p) => p.active).length;
  const totalReached = sent.reduce((s, c) => s + (c.recipientCount ?? 0), 0);

  const upcoming = [
    ...scheduledCampaigns.map((c) => ({ when: c.scheduledAt!, kind: "Email", label: c.subject })),
    ...scheduledPosts.map((p) => ({ when: p.scheduledAt, kind: "Social", label: p.caption })),
  ].sort((a, b) => +new Date(a.when) - +new Date(b.when)).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Mailing list" value={subs.length} hint={`+${newSubs30} this month`} accent="twilight" onClick={() => onGo("email")} />
        <StatTile label="Campaigns sent" value={sent.length} hint={`${totalReached} total recipients`} accent="forest" onClick={() => onGo("email")} />
        <StatTile label="Scheduled posts" value={scheduledPosts.length} hint="on the calendar" accent="firefly" onClick={() => onGo("calendar")} />
        <StatTile label="Active offers" value={activePromos} hint={`${connected} social accounts linked`} accent="twilight" onClick={() => onGo("promos")} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming schedule */}
        <Panel>
          <h2 className="font-serif text-lg text-forest-deep">What&apos;s Scheduled Next</h2>
          <p className="text-xs text-ink-faint">Upcoming emails &amp; social posts, soonest first.</p>
          <div className="mt-3 space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-ink-faint">Nothing scheduled. Plan a campaign or post ✦</p>}
            {upcoming.map((u, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-firefly/15 px-3 py-2">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${u.kind === "Email" ? "bg-forest/10 text-forest" : "bg-twilight/15 text-twilight"}`}>{u.kind}</span>
                <p className="min-w-0 flex-1 truncate text-sm text-forest-deep">{u.label}</p>
                <span className="shrink-0 text-xs font-semibold text-firefly-deep">{formatDateTime(u.when)}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* UTM link builder */}
        <UtmBuilder />
      </div>

      {/* Quick jump */}
      <Panel>
        <h2 className="font-serif text-lg text-forest-deep">Jump To</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {([
            ["email", "✉ Email Marketing", `${sent.length} sent · ${campaigns.filter((c) => c.status === "draft").length} drafts`],
            ["calendar", "🗓 Content Calendar", `${scheduledPosts.length} scheduled posts`],
            ["social", "◎ Social Accounts", `${connected}/${accounts.length} linked`],
            ["content", "▶ Videos & Intros", "brand clips & copy"],
            ["promos", "🏷 Promotions", `${activePromos} active offers`],
            ["brands", "✦ Brands & Clients", "homepage logos"],
          ] as [Tab, string, string][]).map(([t, label, hint]) => (
            <button key={t} onClick={() => onGo(t)} className="rounded-xl border border-firefly/20 bg-parchment-card p-3 text-left transition hover:border-firefly hover:shadow-glow-sm">
              <p className="text-sm font-semibold text-forest-deep">{label}</p>
              <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function UtmBuilder() {
  const [f, setF] = useState({ base: "https://faelight-demo.netlify.app", source: "facebook", medium: "social", campaign: "" });
  const [copied, setCopied] = useState(false);
  const input = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

  const url = (() => {
    if (!f.base) return "";
    const params = new URLSearchParams();
    if (f.source) params.set("utm_source", f.source.trim());
    if (f.medium) params.set("utm_medium", f.medium.trim());
    if (f.campaign) params.set("utm_campaign", f.campaign.trim().replace(/\s+/g, "-").toLowerCase());
    const q = params.toString();
    return q ? `${f.base}${f.base.includes("?") ? "&" : "?"}${q}` : f.base;
  })();

  return (
    <Panel>
      <h2 className="font-serif text-lg text-forest-deep">UTM Link Builder</h2>
      <p className="text-xs text-ink-faint">Build tracked links so leads show their source in the CRM.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint sm:col-span-2">Destination URL
          <input className={`${input} mt-1 normal-case`} value={f.base} onChange={(e) => setF((x) => ({ ...x, base: e.target.value }))} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Source
          <input className={`${input} mt-1 normal-case`} value={f.source} onChange={(e) => setF((x) => ({ ...x, source: e.target.value }))} placeholder="facebook" />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Medium
          <input className={`${input} mt-1 normal-case`} value={f.medium} onChange={(e) => setF((x) => ({ ...x, medium: e.target.value }))} placeholder="social" />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint sm:col-span-2">Campaign
          <input className={`${input} mt-1 normal-case`} value={f.campaign} onChange={(e) => setF((x) => ({ ...x, campaign: e.target.value }))} placeholder="july-foundations" />
        </label>
      </div>
      <div className="mt-3 rounded-lg border border-firefly/20 bg-white/70 p-2.5">
        <p className="break-all text-xs text-forest-deep">{url}</p>
      </div>
      <button
        onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="btn-primary mt-3 !px-4 !py-2 text-sm"
      >
        {copied ? "✓ Copied" : "Copy link"}
      </button>
    </Panel>
  );
}

// ======================= BRANDS & CLIENTS =======================
function BrandsManager() {
  const [editId, setEditId] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandGroups, setBrandGroups] = useState<string[]>([...BRAND_GROUPS]);
  const [form, setForm] = useState({ name: "", group: BRAND_GROUPS[0], logoUrl: "" });

  useEffect(() => {
    const sync = () => { setBrands(getBrands()); setBrandGroups(getBrandGroupOptions()); };
    sync();
    return onStoreChange(sync);
  }, []);

  const input = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

  function onFile(e: React.ChangeEvent<HTMLInputElement>, cb: (dataUrl: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) { alert("Please use an image under 500KB."); return; }
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result));
    reader.readAsDataURL(file);
  }

  function add() {
    if (!form.name.trim()) return;
    addBrand({ name: form.name.trim(), group: form.group, logoUrl: form.logoUrl || undefined });
    setForm({ name: "", group: form.group, logoUrl: "" });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-firefly/25 bg-firefly/8 p-3 text-xs text-ink-soft">
        <span className="font-semibold text-forest-deep">✦</span> Add the clients &amp; brands you support.
        Upload a logo (or paste a URL) and they appear in the <strong>“Clients and Brands We Support”</strong> section
        on the homepage. Untick “Show” to hide one without deleting it.
      </div>

      {/* Add form */}
      <Panel>
        <h2 className="font-serif text-lg text-forest-deep">Add a Brand</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Brand name</label>
            <input className={input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Mean Bean Coffee Co." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Group</label>
            <select className={input} value={form.group} onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}>
              {brandGroups.map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Logo</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input className={input} value={form.logoUrl.startsWith("data:") ? "" : form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} placeholder="Paste logo URL, or upload →" />
              <label className="shrink-0 cursor-pointer rounded-lg border border-firefly/30 px-3 py-2 text-xs font-semibold text-forest hover:border-firefly">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e, (d) => setForm((f) => ({ ...f, logoUrl: d })))} />
              </label>
              {form.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="preview" className="h-9 w-14 rounded border border-firefly/20 bg-white object-contain p-0.5" />
              )}
            </div>
            <p className="mt-1 text-[11px] text-ink-faint">Optional — without a logo, the brand shows as a name. Uploads are stored locally (≤500KB).</p>
          </div>
        </div>
        <button onClick={add} disabled={!form.name.trim()} className="btn-primary mt-3 !px-4 !py-2 text-sm disabled:opacity-40">+ Add brand</button>
      </Panel>

      {/* Grouped list */}
      {brandGroups.filter((g) => brands.some((b) => b.group === g)).map((group) => (
        <div key={group}>
          <h3 className="mb-2 font-serif text-base text-forest-deep">{group} <span className="text-xs text-ink-faint">({brands.filter((b) => b.group === group).length})</span></h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {brands.filter((b) => b.group === group).map((b) => (
              <div key={b.id} className={`flex items-center gap-3 rounded-xl border border-firefly/15 bg-parchment-card p-2.5 ${b.active ? "" : "opacity-50"}`}>
                <label className="group relative grid h-10 w-14 shrink-0 cursor-pointer place-items-center overflow-hidden rounded bg-white ring-1 ring-firefly/15" title={b.logoUrl ? "Replace logo" : "Upload a logo"}>
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logoUrl} alt={b.name} className="max-h-full max-w-full object-contain p-0.5" />
                  ) : (
                    <span className="text-[9px] font-semibold text-firefly-deep">＋ Logo</span>
                  )}
                  <span className="absolute inset-0 hidden place-items-center bg-forest/70 text-[8px] font-bold text-parchment group-hover:grid">
                    {b.logoUrl ? "REPLACE" : "UPLOAD"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e, (d) => updateBrand(b.id, { logoUrl: d }))} />
                </label>
                {editId === b.id ? (
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <input defaultValue={b.name} onBlur={(e) => updateBrand(b.id, { name: e.target.value })} className="min-w-0 flex-1 rounded border border-firefly/25 px-2 py-1 text-sm outline-none focus:border-firefly" />
                    <select defaultValue={b.group} onChange={(e) => updateBrand(b.id, { group: e.target.value })} className="rounded border border-firefly/25 px-1 py-1 text-[11px] outline-none focus:border-firefly">
                      {brandGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button onClick={() => setEditId(null)} className="text-[11px] font-semibold text-forest hover:underline">Done</button>
                  </div>
                ) : (
                  <>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-forest-deep">{b.name}</p>
                    <button onClick={() => setEditId(b.id)} className="text-xs font-semibold text-firefly-deep hover:underline">✎ Edit</button>
                  </>
                )}
                {b.logoUrl && editId !== b.id && (
                  <button onClick={() => updateBrand(b.id, { logoUrl: undefined })} title="Remove logo" className="text-xs text-ink-faint hover:text-rose-600">⌫</button>
                )}
                <label className="flex items-center gap-1 text-[11px] text-ink-soft">
                  <input type="checkbox" checked={b.active} onChange={(e) => updateBrand(b.id, { active: e.target.checked })} className="h-3.5 w-3.5 rounded border-firefly/40 text-forest focus:ring-firefly" />
                  Show
                </label>
                <button onClick={() => { if (confirm(`Remove ${b.name}?`)) removeBrand(b.id); }} className="text-xs font-semibold text-rose-600 hover:underline">✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================ EMAIL ============================
function EmailMarketing() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subs, setSubs] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [autos, setAutos] = useState<Automations>({ autoWelcome: true, monthlyDigest: false });
  const [form, setForm] = useState({ subject: "", body: "", audience: "all" as "all" | CategorySlug, schedDate: "", schedTime: "09:00" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      runDueCampaigns(); // automation: send any scheduled campaigns now due
      setLeads(getLeads());
      setSubs(subscribers());
      setCampaigns(getCampaigns());
      setAutos(getAutomations());
    };
    sync();
    const unsub = onStoreChange(sync);
    const timer = setInterval(sync, 20000); // keep checking while open
    return () => { unsub(); clearInterval(timer); };
  }, []);

  const audienceCount = (aud: "all" | CategorySlug) =>
    aud === "all" ? subs.length : subs.filter((l) => l.categorySlug === aud).length;

  function resetForm() {
    setForm({ subject: "", body: "", audience: "all", schedDate: "", schedTime: "09:00" });
    setEditingId(null);
  }
  function scheduledISO(): string | undefined {
    if (!form.schedDate) return undefined;
    return new Date(`${form.schedDate}T${form.schedTime || "09:00"}`).toISOString();
  }
  function save(status: "draft" | "sent" | "scheduled") {
    if (!form.subject.trim()) return;
    const iso = scheduledISO();
    if (status === "scheduled" && !iso) return;
    const count = audienceCount(form.audience);
    const base = { subject: form.subject.trim(), body: form.body.trim(), audience: form.audience };
    if (editingId) {
      updateCampaign(editingId, {
        ...base,
        status,
        scheduledAt: status === "scheduled" ? iso : undefined,
        ...(status === "sent" ? { sentAt: new Date().toISOString(), recipientCount: count } : {}),
      });
    } else {
      addCampaign({
        ...base,
        author: user?.name ?? "Team",
        status,
        ...(status === "sent" ? { sentAt: new Date().toISOString(), recipientCount: count } : {}),
        ...(status === "scheduled" ? { scheduledAt: iso } : {}),
      });
    }
    resetForm();
  }
  function startEdit(c: Campaign) {
    let sd = "";
    let st = "09:00";
    if (c.scheduledAt) {
      const d = new Date(c.scheduledAt);
      sd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      st = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    setForm({ subject: c.subject, body: c.body, audience: c.audience, schedDate: sd, schedTime: st });
    setEditingId(c.id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function send(c: Campaign) {
    const count = audienceCount(c.audience);
    if (confirm(`Send "${c.subject}" to ${count} subscriber(s)? In production this sends via your email service (Resend/Mailchimp).`)) {
      updateCampaign(c.id, { status: "sent", sentAt: new Date().toISOString(), recipientCount: count });
    }
  }

  const sent = campaigns.filter((c) => c.status === "sent").length;
  const drafts = campaigns.filter((c) => c.status === "draft").length;
  const input = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Mailing list" value={subs.length} hint={`of ${leads.length} leads opted in`} accent="twilight" />
        <StatTile label="Campaigns sent" value={sent} accent="forest" />
        <StatTile label="Drafts" value={drafts} accent="firefly" />
      </div>

      <div className="mb-2 rounded-xl border border-firefly/25 bg-firefly/8 p-3 text-xs text-ink-soft">
        <span className="font-semibold text-forest-deep">✦ Demo note:</span> subscribers are captured
        automatically from bookings &amp; the inquiry form (opt-in). Sending is simulated — in production
        it goes out through your email service and tracks opens/clicks.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Composer */}
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-forest-deep">{editingId ? "Edit Campaign" : "New Campaign"}</h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-semibold text-ink-faint hover:text-forest">✕ Cancel edit</button>
            )}
          </div>
          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Subject</label>
              <input className={input} value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Your email subject line" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Audience</label>
              <select className={input} value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as "all" | CategorySlug }))}>
                <option value="all">Everyone on the list ({audienceCount("all")})</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name} interest ({audienceCount(c.slug)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Message</label>
              <textarea rows={5} className={input} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Write your update…" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Schedule for later <span className="normal-case text-ink-faint">(optional — pick a date)</span></label>
              <MiniCalendar value={form.schedDate} onPick={(d) => setForm((f) => ({ ...f, schedDate: f.schedDate === d ? "" : d }))} />
              {form.schedDate && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-ink-faint">at</span>
                  <input type="time" className="rounded-lg border border-firefly/25 bg-white/70 px-3 py-1.5 text-sm outline-none focus:border-firefly" value={form.schedTime} onChange={(e) => setForm((f) => ({ ...f, schedTime: e.target.value }))} />
                  <button onClick={() => setForm((f) => ({ ...f, schedDate: "" }))} className="text-xs text-ink-faint hover:text-forest">clear</button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => save("draft")} disabled={!form.subject.trim()} className="btn-ghost !px-4 !py-2 text-sm disabled:opacity-40">Save draft</button>
              {form.schedDate ? (
                <button onClick={() => save("scheduled")} disabled={!form.subject.trim()} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-40">◷ {editingId ? "Update &amp; schedule" : "Schedule send"}</button>
              ) : (
                <button onClick={() => save("sent")} disabled={!form.subject.trim()} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-40">{editingId ? "Update &amp; send" : "Send now"}</button>
              )}
            </div>
          </div>
        </Panel>

        {/* Subscribers */}
        <Panel>
          <h2 className="font-serif text-lg text-forest-deep">Subscribers ({subs.length})</h2>
          <p className="text-xs text-ink-faint">Everyone who opted into updates.</p>
          <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
            {subs.length === 0 && <p className="text-sm text-ink-faint">No subscribers yet.</p>}
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-firefly/12 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-forest-deep">{s.name}</p>
                  <p className="truncate text-xs text-ink-faint">{s.email}</p>
                </div>
                {s.categorySlug && <span className="shrink-0 rounded-full bg-forest/8 px-2 py-0.5 text-[10px] capitalize text-forest">{s.categorySlug}</span>}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Automations */}
      <Panel>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-forest-deep">Automations</h2>
            <p className="text-xs text-ink-faint">Standing rules that run on their own — no manual send needed.</p>
          </div>
          <span className="text-xl text-firefly">⚡</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AutomationToggle
            on={autos.autoWelcome}
            title="Auto-welcome new subscribers"
            desc="Every new opt-in automatically receives the welcome email."
            onToggle={() => saveAutomations({ autoWelcome: !autos.autoWelcome })}
          />
          <AutomationToggle
            on={autos.monthlyDigest}
            title="Monthly digest reminder"
            desc="Nudge the team to send the monthly roundup on the 1st."
            onToggle={() => saveAutomations({ monthlyDigest: !autos.monthlyDigest })}
          />
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Scheduled campaigns send automatically at their set time (this demo checks while the page is open;
          production uses a server cron/queue).
        </p>
      </Panel>

      {/* Campaign history */}
      <Panel>
        <h2 className="font-serif text-lg text-forest-deep">Campaigns</h2>
        <div className="mt-3 space-y-2">
          {campaigns.length === 0 && <p className="text-sm text-ink-faint">No campaigns yet.</p>}
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-firefly/15 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-forest-deep">{c.subject}</p>
                  <p className="text-xs text-ink-faint">
                    To {c.audience === "all" ? "everyone" : `${c.audience} interest`} · by {c.author} ·{" "}
                    {c.status === "sent"
                      ? `sent ${relativeDay(c.sentAt!)} to ${c.recipientCount}`
                      : c.status === "scheduled"
                      ? `⏱ scheduled for ${formatDateTime(c.scheduledAt!)}`
                      : `draft · ${relativeDay(c.createdAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CampaignBadge status={c.status} />
                  {c.status !== "sent" && (
                    <button onClick={() => startEdit(c)} className="rounded-lg border border-firefly/25 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
                  )}
                  {c.status !== "sent" && (
                    <button onClick={() => send(c)} className="rounded-lg border border-forest/30 px-3 py-1.5 text-xs font-semibold text-forest hover:border-firefly">Send</button>
                  )}
                  <button onClick={() => { if (confirm("Delete this campaign?")) removeCampaign(c.id); }} className="text-xs font-semibold text-rose-600 hover:underline">Delete</button>
                </div>
              </div>
              {c.body && <p className="mt-2 line-clamp-2 text-xs text-ink-soft">{c.body}</p>}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// Mini month calendar for scheduling. Picks a YYYY-MM-DD; past dates disabled.
function MiniCalendar({ value, onPick }: { value: string; onPick: (ymd: string) => void }) {
  const init = value ? new Date(`${value}T00:00`) : new Date();
  const [view, setView] = useState({ y: init.getFullYear(), m: init.getMonth() });
  const first = new Date(view.y, view.m, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthLabel = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const fmt = (d: number) => `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const shift = (delta: number) => {
    const m = view.m + delta;
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };
  return (
    <div className="rounded-xl border border-firefly/25 bg-white/70 p-3">
      <div className="flex items-center justify-between">
        <button onClick={() => shift(-1)} className="grid h-7 w-7 place-items-center rounded-lg text-forest hover:bg-firefly/10" aria-label="Previous month">‹</button>
        <p className="text-sm font-semibold text-forest-deep">{monthLabel}</p>
        <button onClick={() => shift(1)} className="grid h-7 w-7 place-items-center rounded-lg text-forest hover:bg-firefly/10" aria-label="Next month">›</button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-ink-faint">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const iso = fmt(d);
          const dateObj = new Date(view.y, view.m, d);
          const past = dateObj < today;
          const selected = value === iso;
          const isToday = dateObj.getTime() === today.getTime();
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => onPick(iso)}
              className={`grid h-8 place-items-center rounded-lg text-xs transition ${
                selected
                  ? "bg-forest font-semibold text-parchment"
                  : past
                  ? "cursor-not-allowed text-ink-faint/40"
                  : isToday
                  ? "bg-firefly/15 text-forest hover:bg-firefly/25"
                  : "text-ink-soft hover:bg-firefly/10"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CampaignBadge({ status }: { status: Campaign["status"] }) {
  const map = { draft: "bg-stone-200 text-stone-600", scheduled: "bg-amber-100 text-amber-800", sent: "bg-emerald-100 text-emerald-700" };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status]}`}>{status}</span>;
}

function AutomationToggle({
  on, title, desc, onToggle,
}: {
  on: boolean; title: string; desc: string; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
        on ? "border-forest bg-forest/5" : "border-firefly/20 hover:border-firefly/50"
      }`}
    >
      <span className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${on ? "bg-forest" : "bg-stone-300"}`}>
        <span className={`h-4 w-4 rounded-full bg-white transition ${on ? "translate-x-4" : ""}`} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-forest-deep">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-soft">{desc}</span>
      </span>
    </button>
  );
}

// ============================ SOCIAL ============================
const SOCIAL_GLYPH: Record<string, string> = {
  facebook: "f", instagram: "◉", linkedin: "in", tiktok: "♪", youtube: "▶",
};

function SocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  useEffect(() => {
    const sync = () => setAccounts(getSocialAccounts());
    sync();
    return onStoreChange(sync);
  }, []);
  const input = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-firefly/25 bg-firefly/8 p-3 text-xs text-ink-soft">
        <span className="font-semibold text-forest-deep">✦</span> Link Faelight's social accounts here.
        Handles &amp; links feed the site footer and campaigns. (Marked connected = live.)
      </div>
      {accounts.map((a) => (
        <Panel key={a.platform}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-twilight to-forest text-sm font-bold text-firefly-bright">
                {SOCIAL_GLYPH[a.platform] ?? "✦"}
              </span>
              <div>
                <p className="font-semibold text-forest-deep">{a.label}</p>
                <span className={`text-[11px] font-semibold ${a.connected ? "text-emerald-600" : "text-ink-faint"}`}>
                  {a.connected ? "● Connected" : "Not linked"}
                </span>
              </div>
            </div>
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <input className={input} defaultValue={a.handle} placeholder="Handle (@name)" onBlur={(e) => saveSocialAccount(a.platform, { handle: e.target.value })} />
              <input className={input} defaultValue={a.url} placeholder="https://…" onBlur={(e) => saveSocialAccount(a.platform, { url: e.target.value, connected: !!e.target.value.trim() })} />
            </div>
            <button
              onClick={() => saveSocialAccount(a.platform, { connected: !a.connected })}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition ${a.connected ? "border-firefly/30 text-ink-soft hover:border-firefly" : "border-forest/30 text-forest hover:border-firefly"}`}
            >
              {a.connected ? "Unlink" : "Mark linked"}
            </button>
          </div>
        </Panel>
      ))}
    </div>
  );
}

// ======================= VIDEOS & INTROS =======================
function VideosIntros() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [intros, setIntros] = useState<IntroItem[]>([]);
  const [vForm, setVForm] = useState({ title: "", url: "", description: "", kind: "intro" as VideoItem["kind"] });
  const [iForm, setIForm] = useState({ title: "", text: "" });

  useEffect(() => {
    const sync = () => { setVideos(getVideos()); setIntros(getIntros()); };
    sync();
    return onStoreChange(sync);
  }, []);
  const input = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Videos */}
      <div className="space-y-4">
        <Panel>
          <h2 className="font-serif text-lg text-forest-deep">Add a Video</h2>
          <p className="text-xs text-ink-faint">Brand intros, promos and short clips (paste a YouTube / Vimeo link).</p>
          <div className="mt-3 space-y-2">
            <input className={input} placeholder="Title" value={vForm.title} onChange={(e) => setVForm((f) => ({ ...f, title: e.target.value }))} />
            <input className={input} placeholder="Video URL" value={vForm.url} onChange={(e) => setVForm((f) => ({ ...f, url: e.target.value }))} />
            <div className="flex gap-2">
              <select className={input} value={vForm.kind} onChange={(e) => setVForm((f) => ({ ...f, kind: e.target.value as VideoItem["kind"] }))}>
                <option value="intro">Intro</option>
                <option value="promo">Promo</option>
                <option value="testimonial">Testimonial</option>
                <option value="other">Other</option>
              </select>
            </div>
            <textarea className={input} rows={2} placeholder="Short description" value={vForm.description} onChange={(e) => setVForm((f) => ({ ...f, description: e.target.value }))} />
            <button
              onClick={() => { if (vForm.title.trim()) { addVideo(vForm); setVForm({ title: "", url: "", description: "", kind: "intro" }); } }}
              disabled={!vForm.title.trim()}
              className="btn-primary w-full !py-2 text-sm disabled:opacity-40"
            >+ Add video</button>
          </div>
        </Panel>

        {videos.map((v) => (
          <Panel key={v.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-forest/8 text-forest">▶</span>
                  <p className="font-medium text-forest-deep">{v.title}</p>
                  <span className="rounded-full bg-firefly/20 px-2 py-0.5 text-[10px] font-semibold capitalize text-firefly-deep">{v.kind}</span>
                </div>
                {v.description && <p className="mt-1 text-xs text-ink-soft">{v.description}</p>}
                {v.url && <a href={v.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-firefly-deep hover:underline">{v.url}</a>}
              </div>
              <button onClick={() => { if (confirm("Remove this video?")) removeVideo(v.id); }} className="shrink-0 text-xs font-semibold text-rose-600 hover:underline">Remove</button>
            </div>
          </Panel>
        ))}
      </div>

      {/* Intros */}
      <div className="space-y-4">
        <Panel>
          <h2 className="font-serif text-lg text-forest-deep">Short Intros &amp; Copy</h2>
          <p className="text-xs text-ink-faint">Reusable blurbs for socials, bios and pitches.</p>
          <div className="mt-3 space-y-2">
            <input className={input} placeholder="Title (e.g. Instagram bio)" value={iForm.title} onChange={(e) => setIForm((f) => ({ ...f, title: e.target.value }))} />
            <textarea className={input} rows={3} placeholder="The copy…" value={iForm.text} onChange={(e) => setIForm((f) => ({ ...f, text: e.target.value }))} />
            <button
              onClick={() => { if (iForm.title.trim() && iForm.text.trim()) { addIntro(iForm); setIForm({ title: "", text: "" }); } }}
              disabled={!iForm.title.trim() || !iForm.text.trim()}
              className="btn-primary w-full !py-2 text-sm disabled:opacity-40"
            >+ Add intro</button>
          </div>
        </Panel>

        {intros.map((i) => (
          <Panel key={i.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-firefly-deep">{i.title}</p>
                <textarea
                  defaultValue={i.text}
                  rows={3}
                  onBlur={(e) => updateIntro(i.id, { text: e.target.value })}
                  className="mt-1 w-full resize-none rounded-lg border border-transparent bg-transparent p-1 text-sm text-ink-soft outline-none hover:border-firefly/20 focus:border-firefly focus:bg-white/60"
                />
                <button onClick={() => navigator.clipboard?.writeText(i.text)} className="text-xs font-semibold text-forest hover:underline">Copy</button>
              </div>
              <button onClick={() => { if (confirm("Remove this intro?")) removeIntro(i.id); }} className="shrink-0 text-xs font-semibold text-rose-600 hover:underline">Remove</button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

// ======================= CONTENT CALENDAR =======================
const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", tiktok: "TikTok", youtube: "YouTube",
};

function ContentCalendar() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [form, setForm] = useState({ platforms: [] as string[], caption: "", link: "", date: "", time: "09:00" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const input = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

  useEffect(() => {
    const sync = () => setPosts(getSocialPosts());
    sync();
    return onStoreChange(sync);
  }, []);

  const now = new Date();
  const upcoming = posts.filter((p) => p.status !== "posted");
  const posted = posts.filter((p) => p.status === "posted");

  function togglePlatform(p: string) {
    setForm((f) => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p] }));
  }
  function reset() { setForm({ platforms: [], caption: "", link: "", date: "", time: "09:00" }); setEditingId(null); }
  function iso() {
    if (!form.date) return new Date().toISOString();
    return new Date(`${form.date}T${form.time || "09:00"}`).toISOString();
  }
  function save(status: SocialPostStatus) {
    if (!form.caption.trim() || form.platforms.length === 0) return;
    const payload = { platforms: form.platforms, caption: form.caption.trim(), link: form.link.trim() || undefined, scheduledAt: iso(), status };
    if (editingId) updateSocialPost(editingId, payload);
    else addSocialPost(payload);
    reset();
  }
  function edit(p: SocialPost) {
    const d = new Date(p.scheduledAt);
    setForm({
      platforms: p.platforms, caption: p.caption, link: p.link ?? "",
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    });
    setEditingId(p.id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Scheduled" value={upcoming.filter((p) => p.status === "scheduled").length} accent="firefly" />
        <StatTile label="Drafts" value={upcoming.filter((p) => p.status === "draft").length} accent="twilight" />
        <StatTile label="Posted" value={posted.length} accent="forest" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Composer */}
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-forest-deep">{editingId ? "Edit Post" : "Plan a Post"}</h2>
            {editingId && <button onClick={reset} className="text-xs font-semibold text-ink-faint hover:text-forest">✕ Cancel edit</button>}
          </div>
          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      form.platforms.includes(p) ? "border-forest bg-forest text-parchment" : "border-firefly/25 text-ink-soft hover:border-firefly"
                    }`}
                  >
                    <span>{SOCIAL_GLYPH[p] ?? "✦"}</span> {PLATFORM_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Caption</label>
              <textarea rows={4} className={input} value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} placeholder="Write the post…" />
              <p className="mt-1 text-right text-[11px] text-ink-faint">{form.caption.length} chars</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Link (optional)</label>
              <input className={input} value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/classes or https://…" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Schedule date</label>
              <MiniCalendar value={form.date} onPick={(d) => setForm((f) => ({ ...f, date: f.date === d ? "" : d }))} />
              {form.date && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-ink-faint">at</span>
                  <input type="time" className="rounded-lg border border-firefly/25 bg-white/70 px-3 py-1.5 text-sm outline-none focus:border-firefly" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                  <button onClick={() => setForm((f) => ({ ...f, date: "" }))} className="text-xs text-ink-faint hover:text-forest">clear</button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => save("draft")} disabled={!form.caption.trim() || !form.platforms.length} className="btn-ghost !px-4 !py-2 text-sm disabled:opacity-40">Save draft</button>
              <button onClick={() => save("scheduled")} disabled={!form.caption.trim() || !form.platforms.length || !form.date} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-40">◷ {editingId ? "Update" : "Schedule"}</button>
            </div>
          </div>
        </Panel>

        {/* Pipeline */}
        <div className="space-y-4">
          <Panel>
            <h2 className="font-serif text-lg text-forest-deep">Upcoming &amp; Drafts</h2>
            <div className="mt-3 space-y-2">
              {upcoming.length === 0 && <p className="text-sm text-ink-faint">Nothing planned yet.</p>}
              {upcoming.map((p) => (
                <PostRow key={p.id} p={p} now={now} onEdit={() => edit(p)} />
              ))}
            </div>
          </Panel>
          {posted.length > 0 && (
            <Panel>
              <h2 className="font-serif text-lg text-forest-deep">Posted</h2>
              <div className="mt-3 space-y-2">
                {posted.map((p) => <PostRow key={p.id} p={p} now={now} onEdit={() => edit(p)} />)}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function PostRow({ p, now, onEdit }: { p: SocialPost; now: Date; onEdit: () => void }) {
  const overdue = p.status === "scheduled" && new Date(p.scheduledAt) < now;
  const badge = p.status === "posted" ? "bg-emerald-100 text-emerald-700" : p.status === "scheduled" ? "bg-amber-100 text-amber-800" : "bg-stone-200 text-stone-600";
  return (
    <div className="rounded-xl border border-firefly/15 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {p.platforms.map((pl) => (
          <span key={pl} className="grid h-6 w-6 place-items-center rounded-lg bg-forest/8 text-xs text-forest" title={PLATFORM_LABEL[pl] ?? pl}>{SOCIAL_GLYPH[pl] ?? "✦"}</span>
        ))}
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${badge}`}>{p.status}</span>
        <span className="text-xs text-ink-faint">{formatDateTime(p.scheduledAt)}</span>
        {overdue && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">due — mark posted</span>}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{p.caption}</p>
      {p.link && <p className="mt-1 truncate text-xs text-firefly-deep">{p.link}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {p.status !== "posted" && <button onClick={() => updateSocialPost(p.id, { status: "posted" })} className="rounded-lg border border-emerald-400 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Mark posted</button>}
        {p.status === "posted" && <button onClick={() => updateSocialPost(p.id, { status: "scheduled" })} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs text-ink-soft hover:border-firefly">Reopen</button>}
        <button onClick={() => { navigator.clipboard?.writeText(p.caption); }} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Copy</button>
        <button onClick={onEdit} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
        <button onClick={() => { if (confirm("Delete this post?")) removeSocialPost(p.id); }} className="text-xs font-semibold text-rose-600 hover:underline">Delete</button>
      </div>
    </div>
  );
}

// ======================= PROMOTIONS =======================
function Promotions() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [form, setForm] = useState({ code: "", title: "", description: "", discount: "", validFrom: "", validTo: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const input = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

  useEffect(() => {
    const sync = () => setPromos(getPromos());
    sync();
    return onStoreChange(sync);
  }, []);

  function reset() { setForm({ code: "", title: "", description: "", discount: "", validFrom: "", validTo: "" }); setEditingId(null); }
  function save() {
    if (!form.title.trim() || !form.code.trim()) return;
    const payload = {
      code: form.code.trim().toUpperCase(), title: form.title.trim(), description: form.description.trim(),
      discount: form.discount.trim() || "Offer", validFrom: form.validFrom || undefined, validTo: form.validTo || undefined,
    };
    if (editingId) updatePromo(editingId, payload);
    else addPromo({ ...payload, active: true });
    reset();
  }
  function edit(p: Promo) {
    setForm({ code: p.code, title: p.title, description: p.description, discount: p.discount, validFrom: p.validFrom ?? "", validTo: p.validTo ?? "" });
    setEditingId(p.id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-firefly/25 bg-firefly/8 p-3 text-xs text-ink-soft">
        <span className="font-semibold text-forest-deep">🏷</span> Create promo codes &amp; offers to feature in campaigns,
        on social posts and across the site. Toggle one off to retire it without deleting the record.
      </div>

      <Panel>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-forest-deep">{editingId ? "Edit Offer" : "Add an Offer"}</h2>
          {editingId && <button onClick={reset} className="text-xs font-semibold text-ink-faint hover:text-forest">✕ Cancel edit</button>}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Promo code
            <input className={`${input} mt-1 uppercase`} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="EARLYBIRD" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Discount / benefit
            <input className={`${input} mt-1 normal-case`} value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} placeholder="15% off" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint sm:col-span-2">Title
            <input className={`${input} mt-1 normal-case`} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Foundations early-bird" />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint sm:col-span-2">Description
            <textarea rows={2} className={`${input} mt-1 normal-case`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Who it's for and what they get." />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Valid from
            <input type="date" className={`${input} mt-1 normal-case`} value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Valid until
            <input type="date" className={`${input} mt-1 normal-case`} value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} />
          </label>
        </div>
        <button onClick={save} disabled={!form.title.trim() || !form.code.trim()} className="btn-primary mt-3 !px-4 !py-2 text-sm disabled:opacity-40">{editingId ? "Save offer" : "+ Add offer"}</button>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2">
        {promos.length === 0 && <Panel><p className="py-4 text-center text-sm text-ink-faint">No offers yet.</p></Panel>}
        {promos.map((p) => {
          const expired = p.validTo && p.validTo < today;
          return (
            <div key={p.id} className={`rounded-xl border p-4 ${p.active && !expired ? "border-firefly/25 bg-parchment-card" : "border-firefly/15 bg-parchment-warm/40 opacity-70"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-forest px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-firefly-bright">{p.code}</span>
                    <span className="rounded-full bg-firefly/15 px-2 py-0.5 text-xs font-semibold text-firefly-deep">{p.discount}</span>
                    {expired && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">expired</span>}
                    {!p.active && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">off</span>}
                  </div>
                  <p className="mt-2 font-medium text-forest-deep">{p.title}</p>
                  {p.description && <p className="mt-0.5 text-xs text-ink-soft">{p.description}</p>}
                  <p className="mt-1 text-[11px] text-ink-faint">
                    {p.validFrom ? `From ${formatDateShort(p.validFrom)}` : "No start"}{p.validTo ? ` · until ${formatDateShort(p.validTo)}` : " · no end date"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="flex items-center gap-1 text-[11px] text-ink-soft">
                  <input type="checkbox" checked={p.active} onChange={(e) => updatePromo(p.id, { active: e.target.checked })} className="h-3.5 w-3.5 rounded border-firefly/40 text-forest focus:ring-firefly" />
                  Active
                </label>
                <button onClick={() => { navigator.clipboard?.writeText(p.code); }} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Copy code</button>
                <button onClick={() => edit(p)} className="rounded-lg border border-firefly/25 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-firefly/10">Edit</button>
                <button onClick={() => { if (confirm(`Delete offer "${p.title}"?`)) removePromo(p.id); }} className="ml-auto text-xs font-semibold text-rose-600 hover:underline">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
