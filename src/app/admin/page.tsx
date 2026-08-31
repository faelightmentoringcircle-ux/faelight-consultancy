"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import {
  getLeads, getBookings, getSettings, onStoreChange, calendarReady,
  CALENDAR_LABELS,
  Lead, Booking, LEAD_STATUSES,
} from "@/lib/store";
import { CATEGORIES } from "@/lib/content";
import { formatDateTime, relativeDay } from "@/lib/format";
import { AdminHeader, Panel, StatTile } from "@/components/admin/ui";

type Range = "week" | "month" | "quarter";

const RANGE_DAYS: Record<Range, number> = { week: 7, month: 30, quarter: 90 };
const CAT_COLORS = ["#5a4480", "#2f5646", "#e6b752"];

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [range, setRange] = useState<Range>("month");
  const [reconnect, setReconnect] = useState(false);
  const [providerLabel, setProviderLabel] = useState("");
  const [detail, setDetail] = useState<null | "newLeads" | "bookings" | "booked" | "won">(null);

  useEffect(() => {
    const sync = () => {
      setLeads(getLeads());
      setBookings(getBookings());
      const s = getSettings();
      setReconnect(!calendarReady(s));
      setProviderLabel(CALENDAR_LABELS[s.calendarProvider]);
    };
    sync();
    return onStoreChange(sync);
  }, []);

  const since = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - RANGE_DAYS[range]);
    return d;
  }, [range]);

  const inRange = (iso: string) => new Date(iso) >= since;
  const rangeLeads = leads.filter((l) => inRange(l.createdAt));

  const newLeadsList = leads.filter((l) => {
    const d = new Date(); d.setDate(d.getDate() - 7); return new Date(l.createdAt) >= d;
  });
  const newThisWeek = newLeadsList.length;

  const now = new Date();
  const upcoming = bookings
    .filter((b) => new Date(b.startsAt) >= now && b.status === "confirmed")
    .slice(0, 6);
  const next7 = bookings.filter((b) => {
    const d = new Date(b.startsAt);
    const in7 = new Date(); in7.setDate(in7.getDate() + 7);
    return d >= now && d <= in7 && b.status !== "cancelled";
  }).length;

  // Funnel counts
  const funnel = LEAD_STATUSES.map((s) => ({
    status: s,
    count: rangeLeads.filter((l) => l.status === s).length,
  }));

  // By sub-brand
  const bySubBrand = CATEGORIES.map((c) => ({
    name: c.name,
    value: rangeLeads.filter((l) => l.categorySlug === c.slug).length,
  }));
  const unsorted = rangeLeads.filter((l) => !l.categorySlug).length;
  if (unsorted) bySubBrand.push({ name: "Unsorted", value: unsorted });

  // Conversion
  const totalLeads = rangeLeads.length;
  const bookedList = rangeLeads.filter((l) =>
    ["discovery booked", "proposal sent", "won"].includes(l.status)
  );
  const booked = bookedList.length;
  const wonList = rangeLeads.filter((l) => l.status === "won");
  const won = wonList.length;
  const rangeBookings = bookings.filter((b) => inRange(b.createdAt));

  // Sources
  const sourceCounts: Record<string, number> = {};
  rangeLeads.forEach((l) => {
    const key = l.utmSource ? `${l.source} · utm:${l.utmSource}` : l.source;
    sourceCounts[key] = (sourceCounts[key] ?? 0) + 1;
  });
  const sources = Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="People first. Systems second. Magic throughout."
        action={
          <div className="flex gap-1 rounded-full border border-firefly/25 bg-parchment-card p-1">
            {(["week", "month", "quarter"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  range === r ? "bg-forest text-parchment" : "text-ink-soft hover:text-forest"
                }`}
              >
                This {r}
              </button>
            ))}
          </div>
        }
      />

      {reconnect && (
        <Link href="/admin/settings" className="mb-6 flex items-center gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 hover:bg-rose-100">
          <span className="text-lg">⚠</span>
          <span>
            <strong>{providerLabel} disconnected.</strong> Public booking has degraded to the
            inquiry form. Click to reconnect (or switch calendar) in Settings.
          </span>
        </Link>
      )}

      {/* KPI tiles */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="New leads · this week" value={newThisWeek} hint={`${totalLeads} in this ${range}`} accent="twilight" onClick={() => setDetail("newLeads")} />
        <StatTile label={`Bookings · this ${range}`} value={rangeBookings.length} hint={`${next7} in next 7 days`} accent="forest" onClick={() => setDetail("bookings")} />
        <StatTile label="Discovery booked+" value={booked} hint={`of ${totalLeads} leads`} accent="firefly" onClick={() => setDetail("booked")} />
        <StatTile label="Won" value={won} hint={totalLeads ? `${Math.round((won / totalLeads) * 100)}% conversion` : "—"} accent="forest" onClick={() => setDetail("won")} />
      </div>

      {/* Charts row */}
      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">Pipeline &amp; sub-brands</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="font-serif text-lg text-forest-deep">Lead Pipeline</h2>
          <p className="text-xs text-ink-faint">Counts per status · this {range}</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} margin={{ top: 8, right: 8, bottom: 8, left: -18 }}>
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#7a7263" }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7a7263" }} />
                <Tooltip cursor={{ fill: "rgba(230,183,82,0.08)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e6b75240", fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnel.map((_, i) => (
                    <Cell key={i} fill={i === funnel.length - 1 ? "#c9922f" : "#2f5646"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h2 className="font-serif text-lg text-forest-deep">Leads by Sub-Brand</h2>
          <p className="text-xs text-ink-faint">this {range}</p>
          <div className="mt-2 h-64">
            {bySubBrand.some((b) => b.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bySubBrand} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {bySubBrand.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length] ?? "#b8b0a0"} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6b75240", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-full place-items-center text-sm text-ink-faint">No leads in range.</p>
            )}
          </div>
        </Panel>
      </div>

      {/* Bottom row */}
      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-eyebrow text-firefly-deep">Operations</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-forest-deep">Upcoming Bookings</h2>
            <Link href="/admin/bookings" className="text-xs font-semibold text-firefly-deep hover:underline">View all →</Link>
          </div>
          <div className="mt-4 space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-ink-faint">No upcoming bookings.</p>}
            {upcoming.map((b) => (
              <Link key={b.id} href="/admin/bookings" className="flex items-center justify-between rounded-xl border border-firefly/12 px-3 py-2.5 hover:border-firefly/40">
                <div>
                  <p className="text-sm font-medium text-forest-deep">{b.clientName}</p>
                  <p className="text-xs text-ink-faint">{b.bookingTypeName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-forest">{relativeDay(b.startsAt)}</p>
                  <p className="text-[11px] text-ink-faint">{formatDateTime(b.startsAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-serif text-lg text-forest-deep">Top Inquiry Sources</h2>
          <p className="text-xs text-ink-faint">Where converting traffic comes from · this {range}</p>
          <div className="mt-4 space-y-2.5">
            {sources.length === 0 && <p className="text-sm text-ink-faint">No data in range.</p>}
            {sources.map((s) => {
              const max = sources[0].value || 1;
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">{s.name}</span>
                    <span className="font-semibold text-forest">{s.value}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-firefly/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-forest to-firefly" style={{ width: `${(s.value / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Conversion strip */}
      <Panel className="mt-6">
        <h2 className="font-serif text-lg text-forest-deep">Conversion Journey · this {range}</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <FunnelStep label="Leads" value={totalLeads} pct={100} />
          <Arrow />
          <FunnelStep label="Discovery booked +" value={booked} pct={totalLeads ? (booked / totalLeads) * 100 : 0} />
          <Arrow />
          <FunnelStep label="Won" value={won} pct={totalLeads ? (won / totalLeads) * 100 : 0} />
        </div>
      </Panel>

      {detail && (
        <DetailDrawer
          onClose={() => setDetail(null)}
          title={
            detail === "newLeads" ? "New leads · this week" :
            detail === "bookings" ? `Bookings · this ${range}` :
            detail === "booked" ? "Discovery booked and beyond" : "Won leads"
          }
          leads={detail === "newLeads" ? newLeadsList : detail === "booked" ? bookedList : detail === "won" ? wonList : undefined}
          bookings={detail === "bookings" ? rangeBookings : undefined}
          href={detail === "bookings" ? "/admin/bookings" : "/admin/leads"}
        />
      )}
    </>
  );
}

function DetailDrawer({
  title, leads, bookings, href, onClose,
}: {
  title: string;
  leads?: Lead[];
  bookings?: Booking[];
  href: string;
  onClose: () => void;
}) {
  const count = leads ? leads.length : bookings?.length ?? 0;
  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-forest-deep/40 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col bg-parchment-card shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-firefly/15 p-5">
          <div>
            <h2 className="font-serif text-lg text-forest-deep">{title}</h2>
            <p className="text-xs text-ink-faint">{count} {count === 1 ? "record" : "records"}</p>
          </div>
          <button onClick={onClose} className="text-xl text-ink-faint hover:text-forest">✕</button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-5">
          {count === 0 && <p className="py-10 text-center text-sm text-ink-faint">Nothing here yet.</p>}

          {leads?.map((l) => (
            <Link key={l.id} href={`/admin/leads`} className="block rounded-xl border border-firefly/15 bg-white/70 p-3 hover:border-firefly/40">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-forest-deep">{l.name}</p>
                <span className="shrink-0 rounded-full bg-firefly/12 px-2 py-0.5 text-[10px] font-semibold capitalize text-firefly-deep">{l.status}</span>
              </div>
              <p className="truncate text-xs text-ink-faint">{l.email}{l.phone ? ` · ${l.phone}` : ""}</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">{l.source} · {relativeDay(l.createdAt)}</p>
            </Link>
          ))}

          {bookings?.map((b) => (
            <Link key={b.id} href={`/admin/bookings`} className="block rounded-xl border border-firefly/15 bg-white/70 p-3 hover:border-firefly/40">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-forest-deep">{b.clientName}</p>
                <span className="shrink-0 rounded-full bg-firefly/12 px-2 py-0.5 text-[10px] font-semibold capitalize text-firefly-deep">{b.status}</span>
              </div>
              <p className="truncate text-xs text-ink-faint">{b.bookingTypeName}</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">{formatDateTime(b.startsAt)}</p>
            </Link>
          ))}
        </div>

        <div className="border-t border-firefly/15 p-4">
          <Link href={href} className="btn-primary w-full justify-center !py-2 text-center text-sm">Open full view →</Link>
        </div>
      </div>
    </div>
  );
}

function FunnelStep({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="flex-1 rounded-xl bg-parchment-warm/60 p-4 text-center">
      <p className="font-serif text-3xl text-forest">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-[11px] text-firefly-deep">{Math.round(pct)}%</p>
    </div>
  );
}
function Arrow() {
  return <span className="hidden text-firefly sm:block">→</span>;
}
