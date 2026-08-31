"use client";

import { useEffect, useState } from "react";
import { getSocialAccounts, onStoreChange, SocialAccount } from "@/lib/store";

const ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
  ),
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </g>
  ),
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9z" />
  ),
  tiktok: (
    <path d="M16 3c.3 2 1.5 3.6 3.5 4v2.8c-1.3 0-2.5-.4-3.5-1.1V15a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v2.9a2.6 2.6 0 1 0 1.8 2.5V3H16z" />
  ),
  youtube: (
    <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12zM9.8 15.3V8.7l6.2 3.3-6.2 3.3z" />
  ),
};

export function FooterSocial() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  useEffect(() => {
    const sync = () => setAccounts(getSocialAccounts());
    sync();
    return onStoreChange(sync);
  }, []);

  const live = accounts.filter((a) => a.connected && a.url.trim());
  if (live.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-eyebrow text-firefly-bright">
        Follow us
      </h3>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {live.map((a) => (
          <a
            key={a.platform}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            aria-label={a.label}
            title={`${a.label} · ${a.handle}`}
            className="grid h-9 w-9 place-items-center rounded-full border border-parchment/20 text-parchment/80 transition hover:border-firefly hover:text-firefly-bright hover:shadow-glow-sm"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
              {ICONS[a.platform] ?? <circle cx="12" cy="12" r="9" />}
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
