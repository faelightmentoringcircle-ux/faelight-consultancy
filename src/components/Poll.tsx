"use client";

import { useEffect, useState } from "react";
import { PollDef } from "@/lib/content";

// Faelight Poll — a lightweight client/feedback poll. The vote is saved
// per-poll in the browser (demo only); results are simulated from the
// seeded base counts plus this viewer's vote.
export function Poll({ poll }: { poll: PollDef }) {
  const key = `fae.poll.${poll.id}`;
  const [choice, setChoice] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setChoice(Number(raw));
    } catch {
      /* ignore */
    }
  }, [key]);

  function vote(i: number) {
    setChoice(i);
    try {
      localStorage.setItem(key, String(i));
    } catch {
      /* ignore */
    }
  }

  const counts = poll.options.map((_, i) => poll.base[i] + (choice === i ? 1 : 0));
  const total = counts.reduce((a, b) => a + b, 0);
  const voted = choice !== null;

  return (
    <div className="card">
      <h3 className="font-serif text-lg text-forest-deep">{poll.question}</h3>
      <div className="mt-4 space-y-2.5">
        {poll.options.map((opt, i) => {
          const pct = total ? Math.round((counts[i] / total) * 100) : 0;
          const mine = choice === i;
          if (!voted) {
            return (
              <button
                key={opt}
                onClick={() => vote(i)}
                className="flex w-full items-center justify-between rounded-xl border border-firefly/25 bg-parchment px-4 py-2.5 text-left text-sm text-ink-soft transition hover:border-firefly hover:bg-firefly/5"
              >
                <span>{opt}</span>
                <span className="text-firefly">✦</span>
              </button>
            );
          }
          return (
            <div key={opt} className="relative overflow-hidden rounded-xl border border-firefly/20 bg-parchment px-4 py-2.5">
              <div
                className={`absolute inset-y-0 left-0 ${mine ? "bg-firefly/25" : "bg-forest/8"}`}
                style={{ width: `${pct}%` }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between text-sm">
                <span className={`font-medium ${mine ? "text-forest-deep" : "text-ink-soft"}`}>
                  {opt} {mine && <span className="text-firefly-deep">· your vote</span>}
                </span>
                <span className="font-semibold text-forest">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-faint">
        {voted ? (
          <>Thanks for voting! {total.toLocaleString("en-PH")} responses so far.</>
        ) : (
          <>Tap an option to cast your vote — results appear instantly.</>
        )}
      </p>
    </div>
  );
}
