"use client";

import { useEffect, useState } from "react";
import { getSettings, onStoreChange } from "@/lib/store";
import { CONTACT } from "@/lib/content";

// The "Reach us directly" Email + Founder rows on the Contact page, reading the
// admin-editable public contact (Admin → Settings → Public contact).
function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <div className="card-hover flex items-center gap-4">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-forest/8 text-firefly">✦</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="font-medium text-forest-deep">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

export function ContactDirectRows() {
  const [c, setC] = useState({ name: CONTACT.name, email: CONTACT.email });

  useEffect(() => {
    const sync = () => {
      const s = getSettings();
      setC({ name: s.contactName || CONTACT.name, email: s.contactEmail || CONTACT.email });
    };
    sync();
    return onStoreChange(sync);
  }, []);

  return (
    <>
      <Row label="Email" value={c.email} href={`mailto:${c.email}`} />
      <Row label="Founder" value={c.name} />
    </>
  );
}
