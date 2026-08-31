"use client";

import { useState } from "react";
import Link from "next/link";

// =====================================================================
// Faelight — generic multi-screen "app" demo engine.
// A single interactive product mock driven entirely by a Dataset.
// Each dataset renders THREE professionally-designed screens in one window:
//   • Website  — the client business's public front / landing page
//   • Admin    — the back-office app (sidebar, top bar, dashboard, charts…)
//   • Portal   — the student / client / customer portal
// Each industry carries its own accent THEME so it feels purpose-built.
// Swap the dataset (see src/lib/demoData.ts) to show a different industry
// — or, in a real client build, point it at live data. No backend:
// all interactions are local state, sample data only.
// =====================================================================

export type Tone = "forest" | "firefly" | "twilight" | "muted";

export interface AppTheme {
  accent: string; // primary hex, e.g. "#6366f1"
  accentSoft: string; // light tint hex, e.g. "#eef2ff"
}

export interface Kpi {
  label: string;
  value: string;
  note: string;
}
export interface HealthBar {
  label: string;
  pct: number;
}
export interface TaskItem {
  label: string;
  done: boolean;
  tag: string;
}
export interface ListDoc {
  title: string;
  cat: string;
  updated: string;
  steps: string[];
}
export interface BoardCol {
  col: string;
  accent: string;
  cards: { title: string; owner: string }[];
}
export type Cell = string | { text: string; tone: Tone };
export interface TableDef {
  columns: string[];
  rows: Cell[][];
}
export interface AutoRule {
  when: string;
  then: string;
  on: boolean;
}

export type TabDef =
  | {
      key: string;
      label: string;
      glyph: string;
      type: "dashboard";
      kpis: Kpi[];
      tasks: TaskItem[];
      health: HealthBar[];
      chart?: { title: string; bars: number[]; caption?: string };
      tasksTitle?: string;
      healthTitle?: string;
    }
  | { key: string; label: string; glyph: string; type: "list"; listTitle?: string; docs: ListDoc[] }
  | { key: string; label: string; glyph: string; type: "board"; columns: BoardCol[] }
  | { key: string; label: string; glyph: string; type: "table"; table: TableDef }
  | { key: string; label: string; glyph: string; type: "automations"; rules: AutoRule[] };

export interface LandingView {
  domain: string;
  brand: string;
  accent: Tone;
  nav: string[];
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  features: { glyph: string; title: string; text: string }[];
  stats: { value: string; label: string }[];
}

export interface PortalCard {
  title: string;
  sub?: string;
  meta?: string;
  pill?: { text: string; tone: Tone };
}
export type PortalPanel =
  | { type: "progress"; title: string; bars: { label: string; pct: number }[] }
  | { type: "list"; title: string; cards: PortalCard[] }
  | { type: "callout"; title: string; text: string; cta?: string };

export interface PortalView {
  label: string;
  domain: string;
  user: string;
  role: string;
  stats: { value: string; label: string }[];
  panels: PortalPanel[];
}

export interface Dataset {
  workspace: string;
  client: string;
  theme: AppTheme;
  landing: LandingView;
  portal: PortalView;
  tabs: TabDef[];
}

type AppView = "site" | "admin" | "portal";

// --- helpers ----------------------------------------------------------
const BOARD_DOT = ["bg-slate-400", "bg-amber-400", "bg-violet-400", "bg-emerald-500"];

function toneBadge(tone: Tone) {
  switch (tone) {
    case "firefly":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "twilight":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "muted":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
}
function initialsOf(name: string) {
  return name
    .split(/[\s—–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
const noteUp = (n: string) => /^\+|\bup\b|▲/.test(n);

function Badge({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${toneBadge(tone)}`}>
      {children}
    </span>
  );
}
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
      <path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}
function BarChart({ bars }: { bars: number[] }) {
  const max = Math.max(...bars, 1);
  return (
    <div className="mt-4 flex h-28 items-end gap-1.5">
      {bars.map((v, i) => {
        const h = Math.round((v / max) * 100);
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="w-full rounded-t-md transition-all"
              style={{ height: `${h}%`, minHeight: 6, backgroundColor: "var(--ac)", opacity: 0.4 + 0.6 * (v / max) }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function WorkspaceDemo({ dataset }: { dataset: Dataset }) {
  const [view, setView] = useState<AppView>("site");
  const [tab, setTab] = useState(dataset.tabs[0]?.key ?? "");

  const [taskMap, setTaskMap] = useState<Record<string, boolean[]>>(() => {
    const m: Record<string, boolean[]> = {};
    for (const t of dataset.tabs) if (t.type === "dashboard") m[t.key] = t.tasks.map((x) => x.done);
    return m;
  });
  const [listMap, setListMap] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    for (const t of dataset.tabs) if (t.type === "list") m[t.key] = 0;
    return m;
  });
  const [autoMap, setAutoMap] = useState<Record<string, boolean[]>>(() => {
    const m: Record<string, boolean[]> = {};
    for (const t of dataset.tabs) if (t.type === "automations") m[t.key] = t.rules.map((r) => r.on);
    return m;
  });

  const current = dataset.tabs.find((t) => t.key === tab) ?? dataset.tabs[0];
  const url =
    view === "site" ? dataset.landing.domain : view === "admin" ? `${dataset.landing.domain}/admin` : dataset.portal.domain;

  const VIEWS: { key: AppView; label: string }[] = [
    { key: "site", label: "Website" },
    { key: "admin", label: "Admin" },
    { key: "portal", label: dataset.portal.label },
  ];

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5"
      style={{ ["--ac" as string]: dataset.theme.accent, ["--ac-soft" as string]: dataset.theme.accentSoft } as React.CSSProperties}
    >
      {/* Browser chrome ---------------------------------------------- */}
      <div className="border-b border-slate-200 bg-slate-100">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs text-slate-500 ring-1 ring-slate-200">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="text-slate-400">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span className="truncate">{url}</span>
          </div>
          <span
            className="hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white sm:inline-flex"
            style={{ backgroundColor: "var(--ac)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-twinkle" />
            LIVE DEMO
          </span>
        </div>
        {/* App-view switcher */}
        <div className="flex flex-wrap gap-1 px-3 pb-2">
          {VIEWS.map((v) => {
            const on = view === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  on ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================ WEBSITE ======================== */}
      {view === "site" && <SiteScreen data={dataset.landing} />}

      {/* ============================ PORTAL ========================= */}
      {view === "portal" && <PortalScreen data={dataset.portal} />}

      {/* ============================ ADMIN ========================== */}
      {view === "admin" && (
        <div className="grid bg-white md:grid-cols-[224px_1fr]">
          {/* Sidebar (desktop) */}
          <aside className="hidden flex-col border-r border-slate-200 bg-slate-50/80 md:flex">
            <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-4">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: "var(--ac)" }}>
                {dataset.client[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{dataset.workspace}</p>
                <p className="truncate text-[11px] text-slate-400">{dataset.client}</p>
              </div>
            </div>
            <nav className="flex-1 space-y-0.5 p-3">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
              {dataset.tabs.map((t) => {
                const on = current.key === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      on ? "font-semibold" : "text-slate-600 hover:bg-slate-100"
                    }`}
                    style={on ? { backgroundColor: "var(--ac-soft)", color: "var(--ac)" } : undefined}
                  >
                    <span className="text-base" style={{ color: on ? "var(--ac)" : undefined }}>
                      {t.glyph}
                    </span>
                    {t.label}
                  </button>
                );
              })}
            </nav>
            <div className="flex items-center gap-2.5 border-t border-slate-200 p-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">MC</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">Maia C.</p>
                <p className="truncate text-[10px] text-slate-400">Admin</p>
              </div>
              <span className="text-slate-300">⋯</span>
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 bg-white">
            {/* Top bar */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">{current.label}</h3>
                <p className="truncate text-[11px] text-slate-400">
                  {dataset.workspace} <span className="text-slate-300">/</span> {current.label}
                </p>
              </div>
              {/* Mobile tab strip */}
              <div className="ml-auto flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-400 lg:flex">
                  <IconSearch /> Search…
                </div>
                <button className="hidden h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 sm:grid" aria-label="Notifications">
                  <IconBell />
                </button>
                <div className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "var(--ac)" }}>
                  MC
                </div>
              </div>
            </div>

            {/* Mobile nav pills */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 py-2 md:hidden">
              {dataset.tabs.map((t) => {
                const on = current.key === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
                    style={on ? { backgroundColor: "var(--ac)" } : undefined}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="min-h-[440px] bg-slate-50/40 p-4 sm:p-5">
              {/* DASHBOARD */}
              {current.type === "dashboard" && (
                <div className="animate-fadeUp space-y-4">
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {current.kpis.map((k) => (
                      <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{k.label}</p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{k.value}</p>
                        <p className={`mt-1 text-[11px] font-medium ${noteUp(k.note) ? "text-emerald-600" : "text-slate-400"}`}>
                          {noteUp(k.note) ? "▲ " : ""}
                          {k.note}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    {/* Chart */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-800">{current.chart?.title ?? "Overview"}</h4>
                        {current.chart?.caption && <span className="text-[11px] text-slate-400">{current.chart.caption}</span>}
                      </div>
                      {current.chart ? (
                        <BarChart bars={current.chart.bars} />
                      ) : (
                        <p className="mt-6 text-sm text-slate-400">—</p>
                      )}
                    </div>

                    {/* Tasks */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-800">{current.tasksTitle ?? "This week"}</h4>
                        <span className="text-[11px] font-medium text-slate-400">
                          {(taskMap[current.key] ?? []).filter(Boolean).length}/{current.tasks.length}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1">
                        {current.tasks.map((t, i) => {
                          const done = taskMap[current.key]?.[i] ?? t.done;
                          return (
                            <li key={t.label}>
                              <button
                                onClick={() =>
                                  setTaskMap((prev) => ({
                                    ...prev,
                                    [current.key]: (prev[current.key] ?? current.tasks.map((x) => x.done)).map((v, j) => (j === i ? !v : v)),
                                  }))
                                }
                                className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-slate-50"
                              >
                                <span
                                  className="grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border text-[9px] text-white"
                                  style={done ? { backgroundColor: "var(--ac)", borderColor: "var(--ac)" } : { borderColor: "#cbd5e1" }}
                                >
                                  {done ? "✓" : ""}
                                </span>
                                <span className={`flex-1 text-xs ${done ? "text-slate-400 line-through" : "text-slate-600"}`}>{t.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  {/* Health */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-800">{current.healthTitle ?? "Operations health"}</h4>
                    <div className="mt-4 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                      {current.health.map((h) => (
                        <div key={h.label}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">{h.label}</span>
                            <span className="font-semibold text-slate-700">{h.pct}%</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full" style={{ width: `${h.pct}%`, backgroundColor: "var(--ac)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* LIST + DETAIL */}
              {current.type === "list" && (
                <div className="grid animate-fadeUp gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-2">
                    {current.docs.map((s, i) => {
                      const sel = (listMap[current.key] ?? 0) === i;
                      return (
                        <button
                          key={s.title}
                          onClick={() => setListMap((prev) => ({ ...prev, [current.key]: i }))}
                          className="w-full rounded-xl border bg-white p-3 text-left shadow-sm transition-all"
                          style={sel ? { borderColor: "var(--ac)", backgroundColor: "var(--ac-soft)" } : { borderColor: "#e2e8f0" }}
                        >
                          <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                          <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{s.cat}</span>
                            {s.updated}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    {(() => {
                      const d = current.docs[listMap[current.key] ?? 0];
                      return (
                        <>
                          <h4 className="text-base font-semibold text-slate-900">{d.title}</h4>
                          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">{d.cat}</p>
                          <ol className="mt-4 space-y-3">
                            {d.steps.map((step, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: "var(--ac)" }}>
                                  {i + 1}
                                </span>
                                <span className="text-sm text-slate-600">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* BOARD */}
              {current.type === "board" && (
                <div className="animate-fadeUp grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {current.columns.map((col, ci) => (
                    <div key={col.col} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <div className="flex items-center gap-2 px-1">
                        <span className={`h-2 w-2 rounded-full ${BOARD_DOT[ci % BOARD_DOT.length]}`} />
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{col.col}</p>
                        <span className="ml-auto rounded-full bg-white px-1.5 text-[10px] font-medium text-slate-400 ring-1 ring-slate-200">
                          {col.cards.length}
                        </span>
                      </div>
                      <div className="mt-2.5 space-y-2">
                        {col.cards.map((c) => (
                          <div key={c.title} className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                            <p className="text-xs font-medium text-slate-800">{c.title}</p>
                            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span className="grid h-4 w-4 place-items-center rounded-full text-[8px] font-bold text-white" style={{ backgroundColor: "var(--ac)" }}>
                                {c.owner[0]}
                              </span>
                              {c.owner}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TABLE */}
              {current.type === "table" && (
                <div className="animate-fadeUp overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[460px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                          {current.table.columns.map((c) => (
                            <th key={c} className="px-4 py-2.5 font-semibold">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {current.table.rows.map((row, ri) => (
                          <tr key={ri} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-4 py-2.5">
                                {typeof cell === "string" ? (
                                  ci === 0 ? (
                                    <span className="flex items-center gap-2 font-medium text-slate-800">
                                      <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                                        {initialsOf(cell)}
                                      </span>
                                      {cell}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">{cell}</span>
                                  )
                                ) : (
                                  <Badge tone={cell.tone}>{cell.text}</Badge>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AUTOMATIONS */}
              {current.type === "automations" && (
                <div className="animate-fadeUp space-y-2.5">
                  {current.rules.map((a, i) => {
                    const on = autoMap[current.key]?.[i] ?? a.on;
                    return (
                      <div key={a.when} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base" style={{ backgroundColor: "var(--ac-soft)", color: "var(--ac)" }}>
                          ⚡
                        </div>
                        <div className="min-w-0 flex-1 text-sm">
                          <p className="text-slate-600">
                            <span className="font-semibold text-slate-800">When</span> {a.when}
                          </p>
                          <p className="mt-0.5 text-slate-500">
                            <span className="font-semibold" style={{ color: "var(--ac)" }}>
                              Then
                            </span>{" "}
                            {a.then}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setAutoMap((prev) => ({
                              ...prev,
                              [current.key]: (prev[current.key] ?? current.rules.map((r) => r.on)).map((v, j) => (j === i ? !v : v)),
                            }))
                          }
                          className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                          style={{ backgroundColor: on ? "var(--ac)" : "#cbd5e1" }}
                          aria-pressed={on}
                          aria-label={`Toggle automation: ${a.when}`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                        </button>
                      </div>
                    );
                  })}
                  <p className="px-1 pt-1 text-[11px] text-slate-400">Toggle a rule to switch the automation on or off.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Public website screen -------------------------------------------
function siteAccentText(t: Tone) {
  return t === "firefly" ? "text-amber-600" : t === "twilight" ? "text-violet-600" : t === "muted" ? "text-slate-600" : "text-emerald-700";
}

function SiteScreen({ data }: { data: LandingView }) {
  return (
    <div className="animate-fadeUp bg-white">
      {/* Site nav */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <span className="text-base font-bold tracking-tight text-slate-900">{data.brand}</span>
        <nav className="hidden items-center gap-6 text-xs font-medium text-slate-500 md:flex">
          {data.nav.map((n) => (
            <span key={n} className="cursor-default hover:text-slate-800">
              {n}
            </span>
          ))}
        </nav>
        <Link href="/contact" className="rounded-lg px-3.5 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--ac)" }}>
          Sign in
        </Link>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-14 text-center sm:px-10 sm:py-16" style={{ background: "linear-gradient(180deg, var(--ac-soft) 0%, #ffffff 70%)" }}>
        <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${siteAccentText(data.accent)}`}>{data.eyebrow}</p>
        <h3 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">{data.title}</h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500">{data.subtitle}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/book" className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5" style={{ backgroundColor: "var(--ac)" }}>
            {data.ctaPrimary}
          </Link>
          <Link href="/contact" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400">
            {data.ctaSecondary}
          </Link>
        </div>
        <div className="mx-auto mt-10 flex max-w-lg flex-wrap justify-center gap-x-10 gap-y-3">
          {data.stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid gap-4 px-6 py-12 sm:grid-cols-3 sm:px-10">
        {data.features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-xl text-lg" style={{ backgroundColor: "var(--ac-soft)", color: "var(--ac)" }}>
              {f.glyph}
            </div>
            <h4 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-[11px] text-slate-400">
        © {data.brand} · a demo site built &amp; run on Faelight
      </div>
    </div>
  );
}

// --- Portal screen ----------------------------------------------------
function PortalScreen({ data }: { data: PortalView }) {
  const initials = initialsOf(data.user);
  const firstName = data.user.split(/[—–-]/)[0].trim().split(" ")[0];

  return (
    <div className="animate-fadeUp bg-slate-50/40 p-4 sm:p-6">
      {/* Header band */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-sm" style={{ background: "linear-gradient(120deg, var(--ac) 0%, color-mix(in srgb, var(--ac) 70%, #0f172a) 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-bold ring-2 ring-white/40">{initials}</div>
          <div className="min-w-0">
            <p className="text-lg font-semibold">Welcome back, {firstName}</p>
            <p className="text-xs text-white/70">
              {data.label} · {data.role}
            </p>
          </div>
          <span className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Signed in
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {data.stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[11px] text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panels */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {data.panels.map((p, i) => {
          if (p.type === "callout") {
            return (
              <div key={i} className="flex flex-col justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center lg:col-span-2" style={{ borderColor: "var(--ac)" }}>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{p.text}</p>
                </div>
                {p.cta && (
                  <Link href="/book" className="shrink-0 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5" style={{ backgroundColor: "var(--ac)" }}>
                    {p.cta}
                  </Link>
                )}
              </div>
            );
          }
          if (p.type === "progress") {
            return (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-800">{p.title}</h4>
                <div className="mt-4 space-y-3.5">
                  {p.bars.map((b) => (
                    <div key={b.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{b.label}</span>
                        <span className="font-semibold text-slate-700">{b.pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${b.pct}%`, backgroundColor: "var(--ac)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-800">{p.title}</h4>
              <div className="mt-3 space-y-2">
                {p.cards.map((c) => (
                  <div key={c.title} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{c.title}</p>
                      {c.sub && <p className="truncate text-[11px] text-slate-400">{c.sub}</p>}
                    </div>
                    {c.meta && <span className="shrink-0 text-[11px] text-slate-400">{c.meta}</span>}
                    {c.pill && <Badge tone={c.pill.tone}>{c.pill.text}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
