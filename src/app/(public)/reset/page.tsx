"use client";

import { useState } from "react";
import Link from "next/link";
import { updatePassword, isSupabaseAuth } from "@/lib/auth";

export default function ResetPasswordPage() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (pw !== pw2) { setError("The two passwords don't match."); return; }
    setBusy(true); setError("");
    const res = await updatePassword(pw);
    setBusy(false);
    if (!res.ok) { setError(res.error || "Couldn't update the password. Open the reset link again."); return; }
    setDone(true);
  }

  const input = "w-full rounded-xl border border-parchment/20 bg-white/10 px-4 py-2.5 text-sm text-parchment placeholder:text-parchment/40 outline-none focus:border-firefly";

  return (
    <div className="relative grid min-h-[70vh] place-items-center overflow-hidden bg-enchanted p-6 text-parchment">
      <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-firefly/15 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.png" alt="Faelight" className="mx-auto h-16 w-auto" />
          <h1 className="mt-3 font-serif text-3xl">Set a new password</h1>
        </div>

        {!isSupabaseAuth() ? (
          <div className="rounded-2xl border border-firefly/20 bg-white/5 p-6 text-center backdrop-blur">
            <p className="text-sm text-parchment/70">Password reset isn&rsquo;t available in this environment.</p>
            <Link href="/admin" className="btn-ghost-light mt-4">Go to sign in</Link>
          </div>
        ) : done ? (
          <div className="rounded-2xl border border-firefly/20 bg-white/5 p-6 text-center backdrop-blur">
            <p className="text-2xl">✓</p>
            <h2 className="mt-2 font-serif text-xl">Password updated</h2>
            <p className="mt-2 text-sm text-parchment/70">You can now sign in with your new password.</p>
            <Link href="/admin" className="btn-gold mt-5">Go to the admin</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-firefly/20 bg-white/5 p-6 backdrop-blur">
            <p className="mb-4 text-xs text-parchment/60">Opened from your reset email? Choose a new password below.</p>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-firefly-bright/80">New password</label>
            <input type="password" name="new-password" autoComplete="new-password" autoFocus value={pw}
              onChange={(e) => { setPw(e.target.value); setError(""); }} placeholder="At least 6 characters" className={input} />
            <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-firefly-bright/80">Confirm password</label>
            <input type="password" name="confirm-password" autoComplete="new-password" value={pw2}
              onChange={(e) => { setPw2(e.target.value); setError(""); }} placeholder="Re-enter it" className={input} />
            {error && <p className="mt-2 text-xs text-firefly-bright">{error}</p>}
            <button type="submit" disabled={busy || !pw || !pw2} className="btn-gold mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40">
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
