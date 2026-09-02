"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getSettings, saveSettings, onStoreChange, calendarReady, activeCalendarAccount,
  CALENDAR_LABELS, Settings, CalendarProvider,
  renderTemplate, emailDeliveryReady, getUpcomingSessions, sessionDateText,
} from "@/lib/store";
import {
  getAllUsers, addUser, removeUser, updateUser, archiveUser, emailExists,
  getUserModules, setUserModuleLevel, ADMIN_MODULES, inviteUser, isSupabaseAuth,
  useAuth, AdminUser, Role, DEMO_PASSWORD, AccessLevel,
} from "@/lib/auth";
import { initials } from "@/lib/format";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { ManagedListsPanel } from "@/components/admin/ManagedLists";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SettingsPage() {
  const { isAdmin, ready } = useAuth();
  const [s, setS] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setS(getSettings());
    sync();
    return onStoreChange(sync);
  }, []);

  if (!ready || !s) return null;
  if (!isAdmin) {
    return (
      <Panel className="mx-auto max-w-md text-center">
        <p className="text-2xl">✦</p>
        <h2 className="mt-2 font-serif text-xl text-forest-deep">Admins Only</h2>
        <p className="mt-2 text-sm text-ink-soft">Settings are limited to admin accounts. Ask Maia if you need access.</p>
        <Link href="/admin" className="btn-primary mt-4">← Dashboard</Link>
      </Panel>
    );
  }

  const update = (patch: Partial<Settings>) => {
    saveSettings(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const toggleDay = (d: number) => {
    const days = s.workingDays.includes(d)
      ? s.workingDays.filter((x) => x !== d)
      : [...s.workingDays, d].sort();
    update({ workingDays: days });
  };

  return (
    <>
      <AdminHeader
        title="Settings"
        subtitle="Booking rules, calendar connection and team accounts."
        action={saved ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Saved ✓</span> : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking rules */}
        <Panel>
          <h2 className="font-serif text-lg text-forest-deep">Booking Rules</h2>
          <p className="text-xs text-ink-faint">Used by the public booking slot engine.</p>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Working days</p>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => toggleDay(i)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    s.workingDays.includes(i) ? "bg-forest text-parchment" : "bg-firefly/10 text-ink-faint hover:bg-firefly/20"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <NumberField label="Start hour" value={s.startHour} min={0} max={23} onChange={(v) => update({ startHour: v })} suffix=":00" />
            <NumberField label="End hour" value={s.endHour} min={1} max={24} onChange={(v) => update({ endHour: v })} suffix=":00" />
            <NumberField label="Buffer between (min)" value={s.bufferMin} min={0} max={60} step={5} onChange={(v) => update({ bufferMin: v })} />
            <NumberField label="Min notice (hours)" value={s.minNoticeHours} min={0} max={168} onChange={(v) => update({ minNoticeHours: v })} />
            <NumberField label="Max advance (days)" value={s.maxAdvanceDays} min={1} max={120} onChange={(v) => update({ maxAdvanceDays: v })} />
          </div>
          <p className="mt-3 text-xs text-ink-faint">All times in Asia/Manila (GMT+8).</p>
        </Panel>

        {/* Google connection */}
        <div className="space-y-6">
          <CalendarPanel s={s} update={update} />

          <Panel>
            <h2 className="font-serif text-lg text-forest-deep">Notifications & Payment</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Notify email (new leads & bookings)</label>
                <input
                  defaultValue={s.notifyEmail}
                  onBlur={(e) => update({ notifyEmail: e.target.value })}
                  className="w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Payment instructions (shown on booking confirmation)</label>
                <textarea
                  defaultValue={s.paymentInstructions}
                  rows={3}
                  onBlur={(e) => update({ paymentInstructions: e.target.value })}
                  className="w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly"
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Registration confirmation email */}
      <RegEmailPanel s={s} update={update} />

      {/* Curatable dropdown option lists */}
      <ManagedListsPanel />

      {/* Team accounts */}
      <TeamAccounts />
    </>
  );
}

function RegEmailPanel({ s, update }: { s: Settings; update: (patch: Partial<Settings>) => void }) {
  const ready = emailDeliveryReady(s);
  const sample = getUpcomingSessions()[0];
  const vars: Record<string, string> = {
    name: "Jamie Cruz",
    firstName: "Jamie",
    class: sample?.title ?? "Foundations Class",
    date: sample ? sessionDateText(sample) : "Sept 14–17, 2026 · 6–9 PM",
    package: "Regular",
    price: "₱2,500",
    host: sample?.host ?? "Coach Maia",
    studio: s.regEmailFromName,
  };
  const inputCls = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";
  const PLACEHOLDERS = ["{name}", "{firstName}", "{class}", "{date}", "{package}", "{price}", "{host}", "{studio}"];

  return (
    <Panel className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-forest-deep">Registration Confirmation Email</h2>
          <p className="text-xs text-ink-faint">Automatically sent to each student when they reserve a seat — personalised with their name and class.</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-forest">
          <input type="checkbox" checked={s.regEmailEnabled} onChange={(e) => update({ regEmailEnabled: e.target.checked })} />
          {s.regEmailEnabled ? "On" : "Off"}
        </label>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">From name</label>
            <input defaultValue={s.regEmailFromName} onBlur={(e) => update({ regEmailFromName: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Subject</label>
            <input defaultValue={s.regEmailSubject} onBlur={(e) => update({ regEmailSubject: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Email body</label>
            <textarea defaultValue={s.regEmailBody} rows={12} onBlur={(e) => update({ regEmailBody: e.target.value })} className={`${inputCls} font-mono text-xs leading-relaxed`} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Placeholders — auto-filled per person</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {PLACEHOLDERS.map((p) => (
                <span key={p} className="rounded-full bg-firefly/12 px-2 py-0.5 font-mono text-[11px] text-firefly-deep">{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Preview (with sample data)</p>
          <div className="rounded-2xl border border-firefly/20 bg-white/60 p-4 shadow-inner">
            <p className="text-[11px] text-ink-faint">From: <strong className="text-forest-deep">{s.regEmailFromName}</strong></p>
            <p className="mt-0.5 text-sm font-semibold text-forest-deep">{renderTemplate(s.regEmailSubject, vars)}</p>
            <div className="my-2 border-t border-firefly/15" />
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-ink-soft">{renderTemplate(s.regEmailBody, vars)}</pre>
          </div>
        </div>
      </div>

      {/* Real delivery via EmailJS */}
      <div className="mt-6 rounded-2xl border border-firefly/20 bg-parchment-warm/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-forest-deep">Email delivery</h3>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
            {ready ? "● Live — reaches inboxes" : "Demo — logged only"}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-faint">
          To actually deliver these emails, connect a free <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="font-semibold text-firefly-deep hover:underline">EmailJS</a> account
          (create a Service + a Template with fields <code className="font-mono">to_email</code>, <code className="font-mono">subject</code>, <code className="font-mono">message</code>, <code className="font-mono">from_name</code>), then paste the three IDs below. Until then, confirmations are composed and logged in the activity feed. These keys are public and safe to store here.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Service ID</label>
            <input defaultValue={s.emailjsServiceId} onBlur={(e) => update({ emailjsServiceId: e.target.value.trim() })} className={inputCls} placeholder="service_xxxxxxx" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Template ID</label>
            <input defaultValue={s.emailjsTemplateId} onBlur={(e) => update({ emailjsTemplateId: e.target.value.trim() })} className={inputCls} placeholder="template_xxxxxxx" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Public key</label>
            <input defaultValue={s.emailjsPublicKey} onBlur={(e) => update({ emailjsPublicKey: e.target.value.trim() })} className={inputCls} placeholder="xxxxxxxxxxxxxx" />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function CalendarPanel({
  s,
  update,
}: {
  s: Settings;
  update: (patch: Partial<Settings>) => void;
}) {
  const [connecting, setConnecting] = useState<CalendarProvider | null>(null);

  // Simulate an OAuth connect flow (Google / Microsoft).
  function connect(provider: "google" | "microsoft") {
    setConnecting(provider);
    setTimeout(() => {
      if (provider === "google") {
        update({
          googleConnected: true,
          googleAccount: s.googleAccount || "maia@faelight.ph",
          calendarProvider: "google",
        });
      } else {
        update({
          microsoftConnected: true,
          microsoftAccount: s.microsoftAccount || "maia@faelight.onmicrosoft.com",
          calendarProvider: "microsoft",
        });
      }
      setConnecting(null);
    }, 900);
  }

  const providers: {
    id: CalendarProvider;
    label: string;
    glyph: string;
    desc: string;
    connected: boolean;
    account: string;
  }[] = [
    {
      id: "default",
      label: "Faelight calendar",
      glyph: "✦",
      desc: "Built-in calendar — no account needed. Availability comes from your working hours and existing Faelight bookings.",
      connected: true,
      account: "Always available",
    },
    {
      id: "google",
      label: "Google Calendar",
      glyph: "G",
      desc: "Sync availability + create events with Meet links on your Google Calendar.",
      connected: s.googleConnected,
      account: s.googleAccount,
    },
    {
      id: "microsoft",
      label: "Microsoft / Teams",
      glyph: "⊞",
      desc: "Sync availability + create events with Teams links on your Outlook / Microsoft 365 calendar.",
      connected: s.microsoftConnected,
      account: s.microsoftAccount,
    },
  ];

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-forest-deep">Calendar</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          calendarReady(s) ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}>
          {calendarReady(s) ? "Booking live" : "Booking paused"}
        </span>
      </div>
      <p className="text-xs text-ink-faint">
        Choose which calendar drives public booking. Active: <strong className="text-forest">{CALENDAR_LABELS[s.calendarProvider]}</strong>
        {" · "}{activeCalendarAccount(s)}
      </p>

      <div className="mt-4 space-y-3">
        {providers.map((p) => {
          const active = s.calendarProvider === p.id;
          const linkable = p.id !== "default";
          return (
            <div
              key={p.id}
              className={`rounded-xl border p-3 transition ${
                active ? "border-forest bg-forest/5 ring-1 ring-forest/20" : "border-firefly/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                  p.id === "default" ? "bg-gradient-to-br from-twilight to-forest text-firefly-bright"
                  : p.id === "google" ? "bg-white text-[#4285F4] ring-1 ring-firefly/20"
                  : "bg-[#464EB8] text-white"
                }`}>
                  {p.glyph}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-forest-deep">{p.label}</p>
                    {p.connected && linkable && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">● Connected</span>
                    )}
                    {active && (
                      <span className="rounded-full bg-firefly/20 px-2 py-0.5 text-[10px] font-semibold text-firefly-deep">Active</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-soft">{p.desc}</p>
                  {linkable && p.connected && (
                    <p className="mt-0.5 text-xs text-ink-faint">{p.account}</p>
                  )}

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {/* Use-this-calendar */}
                    {!active && (linkable ? p.connected : true) && (
                      <button
                        onClick={() => update({ calendarProvider: p.id })}
                        className="rounded-lg border border-forest/30 px-3 py-1.5 text-xs font-semibold text-forest hover:border-firefly"
                      >
                        Use this calendar
                      </button>
                    )}
                    {/* Connect / disconnect for linkable providers */}
                    {linkable && !p.connected && (
                      <button
                        onClick={() => connect(p.id as "google" | "microsoft")}
                        disabled={connecting === p.id}
                        className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-60"
                      >
                        {connecting === p.id ? "Connecting…" : `Connect ${p.label}`}
                      </button>
                    )}
                    {linkable && p.connected && (
                      <button
                        onClick={() => {
                          const patch: Partial<Settings> = p.id === "google"
                            ? { googleConnected: false }
                            : { microsoftConnected: false };
                          // if disconnecting the active calendar, fall back to default
                          if (active) patch.calendarProvider = "default";
                          update(patch);
                        }}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        If the active calendar is a disconnected provider, the public{" "}
        <Link href="/book" className="text-firefly-deep hover:underline">/book</Link> page degrades to the
        inquiry form. In production, Connect runs the provider's OAuth flow (Google: calendar.readonly +
        calendar.events; Microsoft Graph: Calendars.ReadWrite).
      </p>
    </Panel>
  );
}

function TeamAccounts() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", title: "", role: "team" as Role });
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const toggleUser = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  useEffect(() => {
    const sync = () => setUsers(getAllUsers());
    sync();
    window.addEventListener("fae:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("fae:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) { setError("Enter a valid email."); return; }
    if (emailExists(form.email)) { setError("That email already has an account."); return; }
    addUser({
      name: form.name.trim(),
      email: form.email.trim(),
      title: form.title.trim() || (form.role === "admin" ? "Admin" : "Team member"),
      role: form.role,
    });
    setForm({ name: "", email: "", title: "", role: "team" });
    setAdding(false);
  }

  const inputCls = "w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly";

  return (
    <Panel className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-forest-deep">Team Accounts</h2>
          <p className="text-xs text-ink-faint">Admins manage everything; team members manage leads & bookings.</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-primary !px-4 !py-2 text-sm">
            + Add user
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={submit} className="mt-4 rounded-xl border border-firefly/25 bg-parchment-warm/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Name<span className="text-firefly-deep">*</span></label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Email<span className="text-firefly-deep">*</span></label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="name@faelight.ph" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Title / role label</label>
              <input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Bookkeeper" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">Access level</label>
              <select className={inputCls} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}>
                <option value="team">Team — leads & bookings</option>
                <option value="admin">Admin — full access</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
          <p className="mt-3 text-xs text-ink-faint">
            New accounts sign in with the shared demo password <code className="font-mono font-semibold text-forest">{DEMO_PASSWORD}</code>.
            In production you'd email an invite instead.
          </p>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="btn-primary !px-4 !py-2 text-sm">Create account</button>
            <button type="button" onClick={() => { setAdding(false); setError(""); }} className="btn-ghost !px-4 !py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {(() => { const arN = users.filter((u) => u.archived).length; return (
        <div className="mt-3 flex justify-end">
          <button onClick={() => setShowArchived((s) => !s)} className="text-xs font-semibold text-forest hover:underline">
            {showArchived ? `← Active accounts` : `🗄 Archived (${arN})`}
          </button>
        </div>
      ); })()}

      <div className="mt-2 space-y-3">
        {users.filter((u) => (showArchived ? u.archived : !u.archived)).map((u) => {
          const isOpen = expanded.has(u.id);
          return (
            <div key={u.id} className={`rounded-xl border border-firefly/15 p-3 ${u.archived ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => toggleUser(u.id)} className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink-faint transition hover:bg-firefly/10" aria-label={isOpen ? "Collapse" : "Expand"}>
                  <span className={`text-[10px] transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                </button>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest/8 text-xs font-semibold text-forest">
                  {initials(u.name)}
                </div>
                <button onClick={() => toggleUser(u.id)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-forest-deep">{u.name}{u.archived && <span className="ml-2 rounded-full bg-stone-200 px-1.5 text-[9px] font-semibold text-stone-600">archived</span>}</p>
                  <p className="truncate text-xs text-ink-faint">{u.email || u.title}</p>
                </button>
                <div className="flex shrink-0 items-center gap-1.5">
                  <select
                    value={u.role}
                    onChange={(e) => updateUser(u.id, { role: e.target.value as Role })}
                    className="rounded-md border border-firefly/25 bg-white/70 px-1.5 py-1 text-[10px] font-semibold capitalize outline-none focus:border-firefly"
                    aria-label={`Role for ${u.name}`}
                  >
                    <option value="team">team</option>
                    <option value="admin">admin</option>
                  </select>
                  {isSupabaseAuth() && u.email && !u.archived && <InviteButton email={u.email} name={u.name} />}
                  <button onClick={() => setEditUser(u)} className="rounded-md border border-firefly/25 px-1.5 py-1 text-[10px] font-semibold text-forest hover:bg-firefly/10">Edit</button>
                  <button onClick={() => archiveUser(u.id, !u.archived)} className="rounded-md border border-firefly/25 px-1.5 py-1 text-[10px] font-semibold text-ink-soft hover:bg-firefly/10">{u.archived ? "Restore" : "Archive"}</button>
                  <button onClick={() => { if (confirm(`Delete ${u.name}'s account? This cannot be undone.`)) removeUser(u.id); }} className="rounded-md border border-rose-200 px-1.5 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                </div>
              </div>

              {isOpen && (
                u.role === "admin" ? (
                  <p className="mt-2 pl-12 text-xs text-firefly-deep">✦ Full access to every section. <span className="text-ink-faint">Admins aren&rsquo;t restricted — set per-section View / User / Admin access on <span className="font-semibold">Team</span> members instead.</span></p>
                ) : (
                  <AccessEditor user={u} />
                )
              )}
            </div>
          );
        })}
      </div>

      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} />}
      <p className="mt-3 text-xs text-ink-faint">
        The 7 founding accounts are protected. Team members only see the sections you assign here.
      </p>
    </Panel>
  );
}

// Level options shown in the dropdown (internal "edit" is labelled "User").
const ACCESS_OPTIONS: { key: AccessLevel; label: string; desc: string }[] = [
  { key: "none", label: "No access", desc: "Section is hidden" },
  { key: "view", label: "View", desc: "Read-only — can open and see, but not change anything" },
  { key: "edit", label: "User", desc: "Can add, edit and manage records in this section" },
  { key: "admin", label: "Admin", desc: "Full control — manage everything, including section settings" },
];
// Section icons (matched to the sidebar).
const MODULE_ICONS: Record<string, string> = {
  dashboard: "◈", tasks: "✎", projects: "❑", clients: "☎", leads: "✦", bookings: "◷",
  payments: "₱", invoices: "🧾", calendar: "▦", marketing: "✉", blog: "✍", reviews: "★",
  feedback: "❤", services: "❖", sessions: "◫", registrations: "☑", pool: "⚑", team: "❂",
  meetings: "▣", templates: "▤", brochures: "▥", content: "◨", guide: "?",
};

// Send a login invite email to a teammate (admin-only, one click).
function InviteButton({ email, name }: { email: string; name: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function send() {
    setState("sending"); setMsg("");
    const r = await inviteUser(email, name);
    if (r.ok) { setState("sent"); setTimeout(() => setState("idle"), 4000); }
    else { setState("error"); setMsg(r.error || "Failed"); setTimeout(() => setState("idle"), 6000); }
  }
  if (state === "sent") return <span className="rounded-md bg-emerald-100 px-1.5 py-1 text-[10px] font-semibold text-emerald-700">✓ Invite sent</span>;
  if (state === "error") return <button onClick={send} title={msg} className="rounded-md border border-rose-200 px-1.5 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-50">⟳ Retry invite</button>;
  return (
    <button onClick={send} disabled={state === "sending"} title={`Email ${email} a link to set their password and log in`} className="rounded-md border border-firefly/40 bg-firefly/10 px-1.5 py-1 text-[10px] font-semibold text-firefly-deep hover:bg-firefly/20 disabled:opacity-50">
      {state === "sending" ? "Sending…" : "✉ Invite"}
    </button>
  );
}

// Edit a user's details (works for seed + added accounts via overrides).
function EditUserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [title, setTitle] = useState(user.title);
  const [role, setRole] = useState<Role>(user.role);
  const input = "w-full rounded-lg border border-firefly/25 bg-white px-3 py-2 text-sm outline-none focus:border-firefly";
  const lbl = "block text-[10px] font-semibold uppercase tracking-wide text-ink-faint";
  function save() {
    updateUser(user.id, { name: name.trim(), email: email.trim(), title: title.trim(), role });
    onClose();
  }
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-forest-deep/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-firefly/25 bg-parchment-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-forest-deep">Edit account</h2>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1"><span className={lbl}>Name</span><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="block space-y-1"><span className={lbl}>Login email</span><input type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block space-y-1"><span className={lbl}>Title / role label</span><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="block space-y-1"><span className={lbl}>Access role</span>
            <select className={input} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="team">Team</option><option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost !py-2 text-xs">Cancel</button>
          <button onClick={save} disabled={!name.trim()} className="btn-primary !py-2 text-xs disabled:opacity-50">Save changes</button>
        </div>
      </div>
    </div>
  );
}

function AccessEditor({ user }: { user: AdminUser }) {
  const [mods, setMods] = useState<string[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  useEffect(() => { setMods(getUserModules(user)); }, [user.id]);

  const BASELINE_VIEW = ["guide"]; // everyone always has at least View here
  const levelOf = (key: string): AccessLevel =>
    mods.includes(key + "#admin") ? "admin"
    : mods.includes(key) ? "edit"
    : mods.includes(key + "#view") ? "view"
    : BASELINE_VIEW.includes(key) ? "view"
    : "none";

  function setLevel(key: string, level: AccessLevel) {
    setUserModuleLevel(user.id, key, level);
    setMods(getUserModules(user));
    setOpenKey(null);
  }
  function setAll(level: AccessLevel) {
    ADMIN_MODULES.forEach((m) => setUserModuleLevel(user.id, m.key, level));
    setMods(getUserModules(user));
  }
  const chip = (lvl: AccessLevel) =>
    lvl === "none" ? "border-firefly/20 bg-white/70 text-ink-faint"
    : lvl === "view" ? "border-blue-300 bg-blue-50 text-blue-700"
    : lvl === "admin" ? "border-firefly bg-firefly/15 text-firefly-deep"
    : "border-forest/30 bg-forest/8 text-forest";
  const labelOf = (lvl: AccessLevel) => ACCESS_OPTIONS.find((o) => o.key === lvl)?.label ?? "No access";

  return (
    <div className="mt-3 border-t border-firefly/12 pt-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          Section access — {user.name.split(" ")[0]}
        </p>
        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-ink-faint">Set all:</span>
          {ACCESS_OPTIONS.map((l) => (
            <button key={l.key} onClick={() => setAll(l.key)} className="rounded border border-firefly/25 px-1.5 py-0.5 font-semibold text-forest hover:bg-firefly/10">{l.label}</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-3 grid gap-1 rounded-lg border border-firefly/15 bg-parchment-warm/40 p-2.5 text-[10px] text-ink-soft sm:grid-cols-2">
        {ACCESS_OPTIONS.filter((l) => l.key !== "none").map((l) => (
          <p key={l.key}><span className="font-semibold text-forest-deep">{l.label}:</span> {l.desc}.</p>
        ))}
      </div>

      {/* Section list with a custom per-section dropdown (shows descriptions) */}
      <div className="divide-y divide-firefly/8 rounded-xl border border-firefly/15">
        {ADMIN_MODULES.map((m) => {
          const lvl = levelOf(m.key);
          const isOpen = openKey === m.key;
          return (
            <div key={m.key} className="relative flex items-center gap-3 px-3 py-1.5 hover:bg-firefly/5">
              <span className="w-4 shrink-0 text-center text-sm text-firefly-deep">{MODULE_ICONS[m.key] ?? "•"}</span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-forest-deep">{m.label}</span>
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : m.key)}
                className={`shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-semibold ${chip(lvl)}`}
              >
                {labelOf(lvl)} <span className="text-[8px]">▾</span>
              </button>
              {isOpen && (
                <div className="absolute right-3 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-firefly/25 bg-white shadow-card">
                  {ACCESS_OPTIONS.filter((o) => !(BASELINE_VIEW.includes(m.key) && o.key === "none")).map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setLevel(m.key, o.key)}
                      className={`block w-full px-3 py-2 text-left transition hover:bg-firefly/8 ${lvl === o.key ? "bg-firefly/10" : ""}`}
                    >
                      <span className="flex items-center justify-between text-xs font-semibold text-forest-deep">{o.label}{lvl === o.key && <span className="text-firefly-deep">✓</span>}</span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-ink-faint">{o.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {openKey && <div className="fixed inset-0 z-40" onClick={() => setOpenKey(null)} />}
    </div>
  );
}

function NumberField({
  label, value, onChange, min, max, step = 1, suffix,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; suffix?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-firefly/25 bg-white/70 px-3 py-2 text-sm outline-none focus:border-firefly"
        />
        {suffix && <span className="text-xs text-ink-faint">{suffix}</span>}
      </div>
    </div>
  );
}
