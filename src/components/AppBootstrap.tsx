"use client";

import { useEffect } from "react";
import { bootstrapAuth } from "@/lib/auth";

/** Runs once on app start: hydrates shared data from Supabase and resolves the
 *  signed-in session. No-op when Supabase isn't configured. */
export function AppBootstrap() {
  useEffect(() => { bootstrapAuth(); }, []);
  return null;
}
