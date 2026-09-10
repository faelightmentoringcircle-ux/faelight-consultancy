"use client";

import { useState } from "react";

// A Panel whose body can be collapsed by clicking its header. Same card styling
// as <Panel>; used to tidy long admin pages (e.g. Settings).
export function CollapsiblePanel({
  title,
  subtitle,
  action,
  defaultOpen = true,
  className = "",
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border border-firefly/20 bg-parchment-card shadow-card ${className}`}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); } }}
        className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-5 transition hover:bg-firefly/5"
      >
        <div>
          <h2 className="font-serif text-lg font-bold text-forest-deep">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
          <span className={`text-ink-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden>▾</span>
        </div>
      </div>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
