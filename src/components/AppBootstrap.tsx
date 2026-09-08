"use client";

import { useEffect } from "react";
import { bootstrapAuth } from "@/lib/auth";
import { pullPublicSubmissions, recoverStrandedPublicRecords } from "@/lib/store";

/** Runs once on app start: hydrates shared data from Supabase and resolves the
 *  signed-in session. No-op when Supabase isn't configured. Once a team member
 *  is signed in, it also drains the public-submissions inbox (website sign-ups
 *  & inquiries left by anonymous visitors) into the normal admin lists. */
export function AppBootstrap() {
  useEffect(() => {
    let cancelled = false;
    const drain = () => {
      if (cancelled) return;
      recoverStrandedPublicRecords();     // public visitor: re-queue pre-fix sign-ups
      pullPublicSubmissions().catch(() => {}); // team member: pull the inbox into the lists
    };

    bootstrapAuth().then(drain);
    // Re-drain whenever the signed-in state changes (e.g. a team member logs in).
    window.addEventListener("fae:auth", drain);
    return () => { cancelled = true; window.removeEventListener("fae:auth", drain); };
  }, []);
  return null;
}
