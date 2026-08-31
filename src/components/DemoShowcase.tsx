"use client";

import { useEffect, useRef, useState } from "react";
import { WorkspaceDemo } from "./WorkspaceDemo";
import { DEMOS } from "@/lib/demoData";

// Industry switcher + the live workspace demo underneath, with a
// fullscreen "Full view" mode so clients can explore it at full size
// without leaving the landing page. Sample data only.
export function DemoShowcase() {
  const [industry, setIndustry] = useState(DEMOS[0].key);
  const [full, setFull] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const active = DEMOS.find((d) => d.key === industry) ?? DEMOS[0];

  function enter() {
    setFull(true);
    // Try true browser fullscreen too (enhancement); the CSS overlay
    // covers the viewport regardless if this isn't available.
    shellRef.current?.requestFullscreen?.().catch(() => {});
  }
  function exit() {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setFull(false);
  }

  // Escape to exit + lock page scroll while the overlay is open.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    const onFsChange = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  function Selector({ dark = false }: { dark?: boolean }) {
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {DEMOS.map((d) => {
          const on = d.key === industry;
          const base = "rounded-full px-4 py-2 text-sm font-semibold transition-all";
          const cls = on
            ? "bg-forest text-parchment shadow-card"
            : dark
              ? "border border-parchment/30 bg-white/5 text-parchment hover:border-firefly hover:text-firefly-bright"
              : "border border-firefly/30 bg-parchment-card text-forest hover:border-firefly hover:text-forest-deep";
          return (
            <button key={d.key} onClick={() => setIndustry(d.key)} className={`${base} ${cls}`}>
              {d.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={full ? "fixed inset-0 z-[100] flex flex-col overflow-hidden bg-enchanted" : ""}
    >
      {full ? (
        // ------------------------- FULL VIEW -------------------------
        <>
          <div className="flex items-center gap-3 border-b border-firefly/20 px-4 py-3">
            <span className="font-serif text-sm text-firefly-bright">
              ✦ Faelight · Live demo
            </span>
            <span className="hidden text-xs text-parchment/60 sm:inline">
              — {active.blurb}
            </span>
            <button onClick={exit} className="btn-gold ml-auto shrink-0 !px-4 !py-2 text-xs">
              ✕ Exit full view
            </button>
          </div>
          <div className="flex-1 overflow-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <Selector dark />
              <div className="mt-6">
                <WorkspaceDemo key={active.key} dataset={active.dataset} />
              </div>
              <p className="mt-6 text-center text-xs text-parchment/60">
                Sample data only — nothing here is saved. Press Esc or “Exit full view” to return.
              </p>
            </div>
          </div>
        </>
      ) : (
        // ------------------------- INLINE VIEW -----------------------
        <>
          <Selector />
          <div className="mt-3 flex flex-col items-center gap-3">
            <p className="text-center text-sm text-ink-faint">{active.blurb}</p>
            <button onClick={enter} className="btn-ghost !py-2 text-xs">
              ⤢ Open full view
            </button>
          </div>

          <div className="mt-6">
            <WorkspaceDemo key={active.key} dataset={active.dataset} />
          </div>
        </>
      )}
    </div>
  );
}
