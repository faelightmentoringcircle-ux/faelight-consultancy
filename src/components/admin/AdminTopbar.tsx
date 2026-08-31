"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { logout, AdminUser } from "@/lib/auth";
import {
  resetDemo,
  getNotifications,
  unreadNotifications,
  markNotificationsRead,
  onStoreChange,
  Notification,
} from "@/lib/store";
import { initials } from "@/lib/format";

const ICON: Record<Notification["kind"], string> = {
  payment: "₱",
  booking: "◷",
  event: "◫",
  review: "★",
  pool: "⚑",
  activity: "✦",
  task: "✎",
};

function ago(ts?: string) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - +new Date(ts)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

function Bell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
      <path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

export function AdminTopbar({ user, title, onMenu }: { user: AdminUser; title: string; onMenu: () => void }) {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const FILTERS: { key: string; label: string }[] = [
    { key: "all", label: "All" },
    { key: "booking", label: "Bookings" },
    { key: "review", label: "Reviews" },
    { key: "payment", label: "Payments" },
    { key: "class", label: "Classes" },
    { key: "webinar", label: "Webinars" },
  ];
  const shown = filter === "all" ? notifs : notifs.filter((n) => n.group === filter);

  useEffect(() => {
    const sync = () => {
      setNotifs(getNotifications());
      setUnread(unreadNotifications());
    };
    sync();
    return onStoreChange(sync);
  }, []);

  function toggleNotif() {
    setOpenUser(false);
    setOpenNotif((o) => {
      const next = !o;
      if (next) {
        markNotificationsRead();
        setUnread(0);
      }
      return next;
    });
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-firefly/15 bg-parchment/85 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <button onClick={onMenu} className="mr-1 text-xl text-forest lg:hidden" aria-label="Open menu">☰</button>
        <span className="hidden text-ink-faint sm:inline">Faelight Admin</span>
        <span className="hidden text-firefly/40 sm:inline">/</span>
        <span className="truncate font-semibold text-forest-deep">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* View public site */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 rounded-full border border-firefly/30 bg-parchment-card px-3 py-1.5 text-xs font-semibold text-forest transition hover:bg-firefly/10"
        >
          <span aria-hidden>🌐</span>
          <span className="hidden sm:inline">View site</span>
          <span aria-hidden>↗</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotif}
            className="relative grid h-9 w-9 place-items-center rounded-full border border-firefly/25 text-forest transition hover:bg-firefly/10"
            aria-label="Notifications"
          >
            <Bell />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {openNotif && (
            <>
              <button className="fixed inset-0 z-30 cursor-default" onClick={() => setOpenNotif(false)} aria-hidden />
              <div className="absolute right-0 z-40 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-firefly/20 bg-parchment-card shadow-card">
                <div className="flex items-center justify-between border-b border-firefly/15 px-4 py-3">
                  <p className="font-serif text-forest-deep">Notifications</p>
                  <span className="text-[11px] text-ink-faint">{shown.length} shown</span>
                </div>
                <div className="flex gap-1 overflow-x-auto border-b border-firefly/10 px-2 py-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                        filter === f.key ? "bg-forest text-parchment" : "bg-firefly/8 text-ink-soft hover:bg-firefly/15"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {shown.length === 0 && <p className="p-4 text-center text-sm text-ink-faint">Nothing here ✦</p>}
                  {shown.map((n) => (
                    <Link key={n.id} href={n.href} onClick={() => setOpenNotif(false)} className="flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-firefly/8">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest/8 text-sm font-semibold text-firefly-deep">
                        {ICON[n.kind]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-forest-deep">{n.title}</span>
                        <span className="block truncate text-xs text-ink-soft">{n.detail}</span>
                        {n.ts && <span className="block text-[10px] text-ink-faint">{ago(n.ts)}</span>}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu (logout) */}
        <div className="relative">
          <button
            onClick={() => { setOpenNotif(false); setOpenUser((o) => !o); }}
            className="flex items-center gap-2 rounded-full border border-firefly/25 py-1 pl-1 pr-2.5 transition hover:bg-firefly/10"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-xs font-bold text-firefly-bright">
              {initials(user.name)}
            </span>
            <span className="hidden text-sm font-medium text-forest-deep sm:block">{user.name.split(" ")[0]}</span>
            <span className="text-[9px] text-ink-faint">▼</span>
          </button>
          {openUser && (
            <>
              <button className="fixed inset-0 z-30 cursor-default" onClick={() => setOpenUser(false)} aria-hidden />
              <div className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-firefly/20 bg-parchment-card p-2 shadow-card">
                <div className="border-b border-firefly/15 px-3 py-2">
                  <p className="text-sm font-semibold text-forest-deep">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-wide text-firefly-deep">{user.role === "admin" ? "Admin" : "Team"}</p>
                </div>
                <Link href="/" className="mt-1 block rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-firefly/8">View site ↗</Link>
                <button
                  onClick={() => { if (confirm("Reset all demo data (leads, bookings, notes, settings)?")) resetDemo(); }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-firefly/8"
                >
                  ↺ Reset demo data
                </button>
                <button onClick={() => logout()} className="mt-1 block w-full rounded-lg bg-forest px-3 py-2 text-left text-sm font-semibold text-parchment transition hover:bg-forest-deep">
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
