"use client";

import { useEffect, useState } from "react";
import { getSettings, onStoreChange } from "@/lib/store";
import { CONTACT, BRAND } from "@/lib/content";

// Small building blocks that render the admin-editable public contact
// (Admin → Settings → Public contact info), so every public spot stays in sync.
function usePublicContact() {
  const [c, setC] = useState({ name: CONTACT.name, email: CONTACT.email, phone: CONTACT.phone });
  useEffect(() => {
    const sync = () => {
      const s = getSettings();
      setC({
        name: s.contactName || CONTACT.name,
        email: s.contactEmail || CONTACT.email,
        phone: s.contactPhone || CONTACT.phone,
      });
    };
    sync();
    return onStoreChange(sync);
  }, []);
  return c;
}

export function ContactName() {
  return <>{usePublicContact().name}</>;
}

export function ContactEmail() {
  return <>{usePublicContact().email}</>;
}

/** "Name · email" inline text (e.g. the About contact strip). */
export function ContactNameEmail({ sep = " · " }: { sep?: string }) {
  const c = usePublicContact();
  return <>{c.name}{sep}{c.email}</>;
}

/** A mailto link to the public email; pass an icon via `icon`. */
export function ContactEmailLink({ className, icon }: { className?: string; icon?: React.ReactNode }) {
  const c = usePublicContact();
  return (
    <a href={`mailto:${c.email}`} className={className}>
      {icon}
      <span className="break-all">{c.email}</span>
    </a>
  );
}

// --- Editable brand voice / taglines (Admin → Settings → Brand & taglines) ---
function useBrand() {
  const [b, setB] = useState({
    ethos: BRAND.ethos,
    cheeky: BRAND.cheeky,
    footerStrip: BRAND.footerStrip,
    pricingDisclaimer: BRAND.pricingDisclaimer,
  });
  useEffect(() => {
    const sync = () => {
      const s = getSettings();
      setB({
        ethos: s.brandEthos || BRAND.ethos,
        cheeky: s.brandCheeky || BRAND.cheeky,
        footerStrip: s.brandFooterStrip || BRAND.footerStrip,
        pricingDisclaimer: s.pricingDisclaimer || BRAND.pricingDisclaimer,
      });
    };
    sync();
    return onStoreChange(sync);
  }, []);
  return b;
}

export function BrandEthos() { return <>{useBrand().ethos}</>; }
export function BrandCheeky() { return <>{useBrand().cheeky}</>; }
export function BrandFooterStrip() { return <>{useBrand().footerStrip}</>; }
export function PricingDisclaimer() { return <>{useBrand().pricingDisclaimer}</>; }
