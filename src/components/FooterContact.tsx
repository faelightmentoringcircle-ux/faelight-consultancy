"use client";

import { useEffect, useState } from "react";
import { getSettings, onStoreChange } from "@/lib/store";
import { CONTACT } from "@/lib/content";

// Footer "Get in touch" name + email — reads the admin-editable public contact
// (Admin → Settings → Public contact), falling back to the built-in defaults.
export function FooterContact() {
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
      <li>{c.name}</li>
      <li>
        <a href={`mailto:${c.email}`} className="hover:text-firefly-bright break-all">
          {c.email}
        </a>
      </li>
    </>
  );
}
