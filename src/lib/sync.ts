import { supabase } from "./supabase";

// Keys that stay LOCAL to each device (never synced to Supabase).
const LOCAL_ONLY = new Set(["fae.session.v1", "fae.nav.collapsed"]);
const shouldSync = (key: string) => key.startsWith("fae.") && !LOCAL_ONLY.has(key);

let hydrated = false;
export const isHydrated = () => hydrated;

/**
 * Load the shared app data from Supabase into localStorage (the app's fast
 * synchronous cache). On a brand-new project (no rows yet) it instead uploads
 * whatever is already in this browser as the initial shared state.
 */
export async function hydrateFromSupabase(): Promise<void> {
  if (!supabase) { hydrated = true; return; }
  try {
    const { data, error } = await supabase.from("app_state").select("key,value");
    if (error) throw error;
    if (data && data.length) {
      for (const row of data) {
        try { localStorage.setItem(row.key, JSON.stringify(row.value)); } catch { /* ignore */ }
      }
    } else {
      await pushAllLocal(); // first run: seed Supabase from this browser
    }
  } catch (e) {
    console.warn("[supabase] hydrate failed — running local-only:", e);
  }
  hydrated = true;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("fae:store"));
}

/** Upload every syncable key currently in localStorage (batched). */
export async function pushAllLocal(): Promise<void> {
  if (!supabase || typeof window === "undefined") return;
  const rows: { key: string; value: unknown }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && shouldSync(k)) {
      try { rows.push({ key: k, value: JSON.parse(localStorage.getItem(k) as string) }); } catch { /* ignore */ }
    }
  }
  if (rows.length) {
    const { error } = await supabase.from("app_state").upsert(rows);
    if (error) console.warn("[supabase] initial upload failed:", error.message);
  }
}

// Debounced per-key push so rapid edits collapse into one write.
const timers: Record<string, ReturnType<typeof setTimeout>> = {};
export function pushKey(key: string, value: unknown): void {
  if (!supabase || !hydrated || !shouldSync(key)) return;
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => {
    supabase!.from("app_state").upsert({ key, value }).then(({ error }) => {
      if (error) console.warn(`[supabase] push ${key} failed:`, error.message);
    });
  }, 400);
}

// --- Public submissions inbox ----------------------------------------
// The public site is anonymous, so it can't write app_state. Each public
// form drops one append-only row into `public_submissions` instead; the
// admin drains them into the normal lists on load. See supabase/schema.sql.
export type PublicSubmissionKind = "registration" | "lead" | "booking" | "feedback" | "welcomed";
export interface PublicSubmissionRow {
  id: string;
  kind: PublicSubmissionKind;
  payload: unknown;
}

/** Drop one public submission into the shared inbox (anon-insert allowed). */
export async function submitPublic(row: PublicSubmissionRow): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("public_submissions").insert(row);
  if (error) { console.warn("[supabase] public submit failed:", error.message); return false; }
  return true;
}

/** Read every pending public submission (team-only read). */
export async function fetchPublicSubmissions(): Promise<PublicSubmissionRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("public_submissions")
    .select("id,kind,payload")
    .order("created_at", { ascending: true });
  if (error) { console.warn("[supabase] fetch submissions failed:", error.message); return []; }
  return (data ?? []) as PublicSubmissionRow[];
}

/** Clear submissions once they've been drained into the lists (team-only). */
export async function deletePublicSubmissions(ids: string[]): Promise<void> {
  if (!supabase || !ids.length) return;
  const { error } = await supabase.from("public_submissions").delete().in("id", ids);
  if (error) console.warn("[supabase] clear submissions failed:", error.message);
}
