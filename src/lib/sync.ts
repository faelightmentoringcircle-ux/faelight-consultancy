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
