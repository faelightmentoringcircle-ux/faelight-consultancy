"use client";

import { useEffect, useState } from "react";
import { CategorySlug, servicesByCategory } from "@/lib/content";
import { effectiveServicesByCategory, onStoreChange } from "@/lib/store";

/** Live count of visible services in a category (reflects admin edits). */
export function ServiceCount({ slug }: { slug: CategorySlug }) {
  const [n, setN] = useState(() => servicesByCategory(slug).length);
  useEffect(() => {
    const sync = () => setN(effectiveServicesByCategory(slug).length);
    sync();
    return onStoreChange(sync);
  }, [slug]);
  return <>{n}</>;
}
