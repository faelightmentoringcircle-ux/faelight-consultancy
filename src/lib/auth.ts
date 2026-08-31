// =====================================================================
// Demo auth. Stands in for Supabase Auth + profiles (spec §3/§8).
// Roles: admin (Maia + owner) can see everything; team (Sassa, Kenny,
// Kits, Dor, Josh) can manage leads & bookings but not settings/accounts.
// A single shared demo password unlocks any account.
// =====================================================================
"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "./supabase";
import { pushKey, hydrateFromSupabase } from "./sync";

export type Role = "admin" | "team";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
}

export const DEMO_PASSWORD = "faelight-demo";

// Seed accounts (the founding team). These can't be removed. Additional
// accounts created from Settings → Team accounts persist in localStorage.
// In production this is the Supabase `profiles` table.
export const SEED_USERS: AdminUser[] = [
  { id: "u-maia", name: "Maia Castañeda", email: "maia@faelight.ph", role: "admin", title: "Founder" },
  { id: "u-berly", name: "Berly", email: "berly@faelight.ph", role: "admin", title: "Systems & Process Lead" },
  { id: "u-owner", name: "Owner", email: "owner@faelight.ph", role: "admin", title: "Owner / Admin" },
  { id: "u-sassa", name: "Sassa", email: "sassa@faelight.ph", role: "admin", title: "Executive VA" },
  { id: "u-kenny", name: "Kenny", email: "kenny@faelight.ph", role: "team", title: "Operations" },
  { id: "u-kits", name: "Kits", email: "kits@faelight.ph", role: "team", title: "Marketing" },
  { id: "u-dor", name: "Dor", email: "dor@faelight.ph", role: "team", title: "Admin & Experiences" },
  { id: "u-josh", name: "Josh", email: "josh@faelight.ph", role: "team", title: "SEO & Web" },
];

const KEY = "fae.session.v1";
const USERS_KEY = "fae.users.v1";

export function isSeedUser(id: string): boolean {
  return SEED_USERS.some((u) => u.id === id);
}

function readCustomUsers(): AdminUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as AdminUser[];
  } catch {
    return [];
  }
}
function writeCustomUsers(users: AdminUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  pushKey(USERS_KEY, users); // sync team accounts to Supabase
  window.dispatchEvent(new CustomEvent("fae:auth"));
}

// The full account list = seed team + any added accounts.
export function getAllUsers(): AdminUser[] {
  return [...SEED_USERS, ...readCustomUsers()];
}

export function addUser(input: Omit<AdminUser, "id">): AdminUser {
  const user: AdminUser = {
    ...input,
    id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  };
  writeCustomUsers([...readCustomUsers(), user]);
  return user;
}

export function updateUser(id: string, patch: Partial<Omit<AdminUser, "id">>) {
  if (isSeedUser(id)) return; // seed accounts are read-only in the demo
  writeCustomUsers(
    readCustomUsers().map((u) => (u.id === id ? { ...u, ...patch } : u))
  );
}

export function removeUser(id: string) {
  if (isSeedUser(id)) return;
  writeCustomUsers(readCustomUsers().filter((u) => u.id !== id));
}

export function emailExists(email: string): boolean {
  const e = email.trim().toLowerCase();
  return getAllUsers().some((u) => u.email.toLowerCase() === e);
}

// --- Per-section (module) access assignment --------------------------
// Admins see everything. Team members see the modules assigned to them
// (default: dashboard, leads, bookings) — admins assign more in Settings.
export const ADMIN_MODULES: { key: string; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "tasks", label: "Tasks" },
  { key: "projects", label: "Projects" },
  { key: "clients", label: "Client List & Contacts" },
  { key: "leads", label: "Leads" },
  { key: "bookings", label: "Bookings" },
  { key: "payments", label: "Payments" },
  { key: "invoices", label: "Invoices" },
  { key: "calendar", label: "Calendar" },
  { key: "marketing", label: "Marketing" },
  { key: "blog", label: "Blog & Insights" },
  { key: "reviews", label: "Reviews" },
  { key: "feedback", label: "Session Feedback" },
  { key: "services", label: "Services" },
  { key: "sessions", label: "Classes & Sessions" },
  { key: "registrations", label: "Registrations & Enrollees" },
  { key: "pool", label: "Faelight Pool" },
  { key: "team", label: "Faelight Team" },
  { key: "meetings", label: "Meetings" },
  { key: "templates", label: "Templates & Documents" },
  { key: "brochures", label: "Brochures" },
  { key: "content", label: "Landing / Content" },
  { key: "guide", label: "Guide / How-to" },
];
const DEFAULT_TEAM_MODULES = ["dashboard", "leads", "bookings"];
// Sensible role-based defaults for the founding team (admin can change these).
const SEED_TEAM_MODULES: Record<string, string[]> = {
  "u-sassa": ["dashboard", "leads", "bookings", "calendar"],
  "u-kenny": ["dashboard", "leads", "bookings", "payments", "calendar"],
  "u-kits": ["dashboard", "marketing", "reviews"],
  "u-dor": ["dashboard", "leads", "bookings", "calendar"],
  "u-josh": ["dashboard", "marketing", "services", "reviews"],
};
const ACCESS_KEY = "fae.moduleaccess.v1";

function readAccess(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ACCESS_KEY) || "{}") as Record<string, string[]>;
  } catch {
    return {};
  }
}

export type AccessLevel = "none" | "view" | "edit" | "admin";
const VIEW_SUFFIX = "#view";
const ADMIN_SUFFIX = "#admin";
// Sections every user can always at least view (baseline access).
const ALWAYS_VIEW_MODULES = ["guide"];

// The raw stored access entries a user has. A plain key ("leads") = full/manage
// access; a "leads#view" entry = view-only. Admins implicitly have everything.
export function getUserModules(user: AdminUser | null): string[] {
  if (!user) return [];
  if (user.role === "admin") return [...ADMIN_MODULES.map((m) => m.key), "settings"];
  return readAccess()[user.id] ?? SEED_TEAM_MODULES[user.id] ?? DEFAULT_TEAM_MODULES;
}
export function setUserModules(userId: string, modules: string[]) {
  const all = readAccess();
  all[userId] = modules;
  localStorage.setItem(ACCESS_KEY, JSON.stringify(all));
  pushKey(ACCESS_KEY, all); // sync per-section access to Supabase
  window.dispatchEvent(new CustomEvent("fae:auth"));
}
/** A user's access level for a section: none / view / edit / admin. */
export function moduleLevel(user: AdminUser | null, key: string): AccessLevel {
  if (!user) return "none";
  if (user.role === "admin") return "admin";
  const entries = getUserModules(user);
  if (entries.includes(key + ADMIN_SUFFIX)) return "admin";
  if (entries.includes(key)) return "edit";
  if (entries.includes(key + VIEW_SUFFIX)) return "view";
  if (ALWAYS_VIEW_MODULES.includes(key)) return "view"; // baseline: everyone can view the Guide
  return "none";
}
/** Set a user's access level for one section. */
export function setUserModuleLevel(userId: string, key: string, level: AccessLevel) {
  const cur = (readAccess()[userId] ?? SEED_TEAM_MODULES[userId] ?? DEFAULT_TEAM_MODULES)
    .filter((k) => k !== key && k !== key + VIEW_SUFFIX && k !== key + ADMIN_SUFFIX);
  if (level === "admin") cur.push(key + ADMIN_SUFFIX);
  else if (level === "edit") cur.push(key);
  else if (level === "view") cur.push(key + VIEW_SUFFIX);
  setUserModules(userId, cur);
}
export function canAccessModule(user: AdminUser | null, key: string): boolean {
  return moduleLevel(user, key) !== "none";
}
/** Edit rights = Edit or Admin (both allow changes; View is read-only). */
export function canEditModule(user: AdminUser | null, key: string): boolean {
  const l = moduleLevel(user, key);
  return l === "edit" || l === "admin";
}
export function canAdminModule(user: AdminUser | null, key: string): boolean {
  return moduleLevel(user, key) === "admin";
}

export function currentUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const id = JSON.parse(raw) as string;
    return getAllUsers().find((u) => u.id === id) ?? null;
  } catch {
    return null;
  }
}

export function login(userId: string) {
  localStorage.setItem(KEY, JSON.stringify(userId));
  window.dispatchEvent(new CustomEvent("fae:auth"));
}

export function logout() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("fae:auth"));
  if (supabase) supabase.auth.signOut().catch(() => {});
}

// --- Supabase Auth (real email + password login) ---------------------
export const isSupabaseAuth = () => isSupabaseEnabled();

/** Sign in with a real email + password (Supabase Auth). */
export async function signInWithEmail(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Login isn't configured." };
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { ok: false, error: error.message };
  return { ok: true }; // onAuthStateChange resolves the account
}

/** Map a Supabase session (by email) to a team account; auto-provision the
 *  first unknown user as an admin so nobody gets locked out. */
function applySupabaseSession(email: string | null | undefined) {
  if (email) {
    const lower = email.toLowerCase();
    const users = getAllUsers();
    let u = users.find((x) => x.email.toLowerCase() === lower);
    if (!u) {
      // New person: default to a limited "team" account (an admin can promote
      // them in Settings). If somehow no admin exists yet, make them admin so
      // nobody is ever locked out.
      const hasAdmin = users.some((x) => x.role === "admin");
      const role: Role = hasAdmin ? "team" : "admin";
      u = addUser({
        name: email.split("@")[0].replace(/[._]/g, " "),
        email: lower,
        title: role === "admin" ? "Admin" : "Team Member",
        role,
      });
    }
    localStorage.setItem(KEY, JSON.stringify(u.id));
  } else {
    localStorage.removeItem(KEY);
  }
  window.dispatchEvent(new CustomEvent("fae:auth"));
}

let bootReady = false;
export const isAuthBootReady = () => bootReady || !isSupabaseEnabled();

/** Run once on app start: load shared data + resolve the Supabase session. */
export async function bootstrapAuth() {
  if (!supabase) { bootReady = true; window.dispatchEvent(new CustomEvent("fae:auth")); return; }
  try {
    await hydrateFromSupabase();
    const { data } = await supabase.auth.getSession();
    applySupabaseSession(data.session?.user?.email ?? null);
    supabase.auth.onAuthStateChange((_event, session) => {
      applySupabaseSession(session?.user?.email ?? null);
    });
  } catch (e) {
    console.warn("[auth] bootstrap failed:", e);
  }
  bootReady = true;
  window.dispatchEvent(new CustomEvent("fae:auth"));
}

// React hook — re-renders on login/logout and once the app has booted.
export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(!isSupabaseEnabled());

  useEffect(() => {
    const sync = () => { setUser(currentUser()); setReady(isAuthBootReady()); };
    sync();
    window.addEventListener("fae:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("fae:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready, isAdmin: user?.role === "admin" };
}
