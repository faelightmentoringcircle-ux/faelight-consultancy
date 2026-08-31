"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  getAllUsers,
  DEMO_PASSWORD,
  login,
  useAuth,
  canAccessModule,
  moduleLevel,
  isSupabaseAuth,
  signInWithEmail,
  AdminUser,
} from "@/lib/auth";
import { AdminTopbar } from "./AdminTopbar";
import { initials } from "@/lib/format";

type NavEntry = { href: string; label: string; icon: string; module: string; exact?: boolean };

// Wraps content and makes it non-interactive (read-only) via the `inert`
// attribute — all buttons, inputs and links inside are disabled, while the
// sidebar (outside this wrapper) stays usable so the user can navigate away.
function ReadOnlyGate({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current as (HTMLElement & { inert?: boolean }) | null;
    if (el) el.inert = true;
  });
  return <div ref={ref} className="opacity-95">{children}</div>;
}

// Grouped, professionally sorted admin navigation.
const NAV_GROUPS: { title?: string; items: NavEntry[] }[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: "◈", module: "dashboard", exact: true },
      { href: "/admin/tasks", label: "Tasks", icon: "✎", module: "tasks" },
      { href: "/admin/projects", label: "Projects", icon: "❑", module: "projects" },
    ],
  },
  {
    title: "Clients",
    items: [
      { href: "/admin/clients", label: "Client List & Contacts", icon: "☎", module: "clients" },
      { href: "/admin/leads", label: "Leads", icon: "✦", module: "leads" },
      { href: "/admin/bookings", label: "Bookings", icon: "◷", module: "bookings" },
      { href: "/admin/meetings", label: "Meetings", icon: "▣", module: "meetings" },
      { href: "/admin/payments", label: "Payments", icon: "₱", module: "payments" },
      { href: "/admin/invoices", label: "Invoices", icon: "🧾", module: "invoices" },
      { href: "/admin/calendar", label: "Calendar", icon: "▦", module: "calendar" },
    ],
  },
  {
    title: "Programs",
    items: [
      { href: "/admin/sessions", label: "Classes & Sessions", icon: "◫", module: "sessions" },
      { href: "/admin/registrations", label: "Registrations & Enrollees", icon: "☑", module: "registrations" },
      { href: "/admin/services", label: "Services & Pricing", icon: "❖", module: "services" },
    ],
  },
  {
    title: "Members",
    items: [
      { href: "/admin/pool", label: "Faelight Pool", icon: "⚑", module: "pool" },
      { href: "/admin/team", label: "Faelight Team", icon: "❂", module: "team" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/admin/marketing", label: "Marketing", icon: "✉", module: "marketing" },
      { href: "/admin/blog", label: "Blog & Insights", icon: "✍", module: "blog" },
      { href: "/admin/reviews", label: "Reviews", icon: "★", module: "reviews" },
      { href: "/admin/feedback", label: "Session Feedback", icon: "❤", module: "feedback" },
    ],
  },
  {
    title: "Site & System",
    items: [
      { href: "/admin/templates", label: "Templates & Docs", icon: "▤", module: "templates" },
      { href: "/admin/brochures", label: "Brochures", icon: "▥", module: "brochures" },
      { href: "/admin/content", label: "Landing / Content", icon: "◨", module: "content" },
      { href: "/admin/guide", label: "Guide / How-to", icon: "?", module: "guide" },
      { href: "/admin/settings", label: "Settings", icon: "⚙", module: "settings" },
    ],
  },
];

const NAV: NavEntry[] = NAV_GROUPS.flatMap((g) => g.items);

// Which module does a pathname belong to?
function moduleForPath(pathname: string): string {
  const hit = [...NAV].sort((a, b) => b.href.length - a.href.length)
    .find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)));
  return hit?.module ?? "dashboard";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);

  // Collapsible nav groups (remembered per browser).
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem("fae.nav.collapsed");
      if (raw) setCollapsed(new Set(JSON.parse(raw) as string[]));
    } catch { /* ignore */ }
  }, []);
  const toggleGroup = (title: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      try { localStorage.setItem("fae.nav.collapsed", JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });

  // Re-render when access assignments change.
  useEffect(() => {
    const h = () => force((x) => x + 1);
    window.addEventListener("fae:auth", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("fae:auth", h); window.removeEventListener("storage", h); };
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-forest-deep">
        <div className="text-firefly-bright animate-twinkle text-3xl">✦</div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const currentModule = moduleForPath(pathname);
  const hasAccess = canAccessModule(user, currentModule);
  const readOnly = hasAccess && moduleLevel(user, currentModule) === "view";
  const pageTitle = NAV.find((n) => n.module === currentModule)?.label ?? "Faelight Admin";

  return (
    <div className="flex min-h-dvh bg-parchment-warm/40">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-enchanted text-parchment transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.png" alt="Faelight" className="h-9 w-auto" />
            <div>
              <p className="font-serif text-lg leading-none">Faelight</p>
              <p className="text-[10px] uppercase tracking-eyebrow text-firefly-bright/70">Admin</p>
            </div>
          </Link>

          <nav className="mt-8 flex-1 space-y-4 overflow-y-auto">
            {NAV_GROUPS.map((group, gi) => {
              const items = group.items.filter((n) => canAccessModule(user, n.module));
              if (items.length === 0) return null;
              // A titled group can be collapsed; keep it open if it holds the active page.
              const hasActive = items.some((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)));
              const isCollapsed = !!group.title && collapsed.has(group.title) && !hasActive;
              return (
                <div key={group.title ?? `g${gi}`} className="space-y-1">
                  {group.title && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.title!)}
                      className="flex w-full items-center justify-between px-3 pb-0.5 text-[10px] font-semibold uppercase tracking-eyebrow text-firefly-bright/50 transition hover:text-firefly-bright/80"
                    >
                      {group.title}
                      <span className={`text-[8px] transition-transform ${isCollapsed ? "" : "rotate-90"}`}>▶</span>
                    </button>
                  )}
                  {!isCollapsed && items.map((n) => {
                    const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                          active
                            ? "bg-firefly/15 text-firefly-bright"
                            : "text-parchment/70 hover:bg-white/5 hover:text-parchment"
                        }`}
                      >
                        <span className="text-base">{n.icon}</span>
                        {n.label}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-parchment/15 pt-4 text-[10px] text-parchment/40">
            People first. Systems second. Magic throughout.
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar user={user} title={pageTitle} onMenu={() => setOpen(true)} />
        <main className="flex-1 p-5 sm:p-8">
          {hasAccess ? (
            readOnly ? (
              <>
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">
                  👁 <span><span className="font-semibold">View-only access.</span> You can browse this section, but changes are disabled. Ask an admin for Manage access.</span>
                </div>
                <ReadOnlyGate>{children}</ReadOnlyGate>
              </>
            ) : (
              children
            )
          ) : (
            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-firefly/20 bg-parchment-card p-8 text-center shadow-card">
              <p className="text-2xl">🔒</p>
              <h2 className="mt-2 font-serif text-xl text-forest-deep">No Access to This Section</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Your account isn't assigned to this area. Ask an admin to grant access in
                Settings → Team accounts.
              </p>
              <Link href="/admin" className="btn-primary mt-4">← Back to dashboard</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function LoginScreen() {
  if (isSupabaseAuth()) return <SupabaseLoginScreen />;
  return <DemoLoginScreen />;
}

// Real email + password login (Supabase Auth).
function SupabaseLoginScreen() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !pw) return;
    setBusy(true); setError("");
    const res = await signInWithEmail(email, pw);
    setBusy(false);
    if (!res.ok) setError(res.error || "Sign in failed.");
    // success: onAuthStateChange resolves the account and the app re-renders.
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-enchanted p-6 text-parchment">
      <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-firefly/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-twilight-light/30 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.png" alt="Faelight" className="mx-auto h-16 w-auto" />
          <h1 className="mt-3 font-serif text-3xl">Faelight Admin</h1>
          <p className="mt-1 text-sm text-parchment/60">People first. Systems second. Magic throughout.</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-firefly/20 bg-white/5 p-6 backdrop-blur">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-firefly-bright/80">Email</label>
          <input
            type="email" value={email} autoFocus
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="you@faelight.ph"
            className="w-full rounded-xl border border-parchment/20 bg-white/10 px-4 py-2.5 text-sm text-parchment placeholder:text-parchment/40 outline-none focus:border-firefly"
          />
          <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-firefly-bright/80">Password</label>
          <input
            type="password" value={pw}
            onChange={(e) => { setPw(e.target.value); setError(""); }}
            placeholder="Your password"
            className="w-full rounded-xl border border-parchment/20 bg-white/10 px-4 py-2.5 text-sm text-parchment placeholder:text-parchment/40 outline-none focus:border-firefly"
          />
          {error && <p className="mt-2 text-xs text-firefly-bright">{error}</p>}
          <button type="submit" disabled={busy || !email.trim() || !pw} className="btn-gold mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-4 text-center text-[11px] text-parchment/50">
            Accounts are created in Supabase → Authentication. Ask an admin if you need access.
          </p>
        </form>
        <p className="mt-4 text-center text-xs text-parchment/50">
          <Link href="/" className="hover:text-firefly-bright">← Back to the public site</Link>
        </p>
      </div>
    </div>
  );
}

function DemoLoginScreen() {
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);

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
    if (!selected) return;
    if (pw !== DEMO_PASSWORD) {
      setError("Incorrect password.");
      return;
    }
    login(selected.id);
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-enchanted p-6 text-parchment">
      <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-firefly/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-twilight-light/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.png" alt="Faelight" className="mx-auto h-16 w-auto" />
          <h1 className="mt-3 font-serif text-3xl">Faelight Admin</h1>
          <p className="mt-1 text-sm text-parchment/60">People first. Systems second. Magic throughout.</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-firefly/20 bg-white/5 p-6 backdrop-blur">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-firefly-bright/80">
            Choose an account
          </label>
          <div className="grid max-h-52 gap-2 overflow-auto pr-1">
            {users.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => { setSelected(u); setError(""); }}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                  selected?.id === u.id
                    ? "border-firefly bg-firefly/15"
                    : "border-parchment/15 hover:border-firefly/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-firefly/20 text-xs font-semibold text-firefly-bright">
                    {initials(u.name)}
                  </span>
                  <span className="text-sm">{u.name}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wide text-parchment/50">
                  {u.role}
                </span>
              </button>
            ))}
          </div>

          <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-firefly-bright/80">
            Password
          </label>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(""); }}
            placeholder="Demo password"
            className="w-full rounded-xl border border-parchment/20 bg-white/10 px-4 py-2.5 text-sm text-parchment placeholder:text-parchment/40 outline-none focus:border-firefly"
          />
          {error && <p className="mt-2 text-xs text-firefly-bright">{error}</p>}

          <button
            type="submit"
            disabled={!selected}
            className="btn-gold mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sign in
          </button>

          <p className="mt-4 rounded-lg bg-firefly/10 p-3 text-center text-xs text-firefly-bright/90">
            Demo password: <code className="font-mono font-semibold">{DEMO_PASSWORD}</code>
            <br />
            Pick <strong>Maia</strong> for admin, or a teammate for the team view.
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-parchment/50">
          <Link href="/" className="hover:text-firefly-bright">← Back to the public site</Link>
        </p>
      </div>
    </div>
  );
}
