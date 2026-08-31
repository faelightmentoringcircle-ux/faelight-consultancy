import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Reads the public project config from env. Both values are safe to expose in
// the browser — the anon key is protected by Row-Level Security in Supabase.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supports both the new publishable key and the classic anon key.
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// When the keys aren't configured yet the app runs in local-only mode
// (localStorage), so nothing breaks before Supabase is wired up.
export const supabase: SupabaseClient | null =
  url && anon
    ? createClient(url, anon, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      })
    : null;

export const isSupabaseEnabled = () => !!supabase;
