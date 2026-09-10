"use client";

import { useEffect, useState } from "react";
import { getEffectiveCategory, onStoreChange } from "@/lib/store";
import { CATEGORIES, CategorySlug, ServiceCategory } from "@/lib/content";

// Sub-brand category text (name / tagline / who-it's-for / description) with
// admin overrides applied (Admin → Settings → Sub-brand pages). Initial render
// uses the seed so SSR and first client render match; the effect then applies
// any saved overrides.
function useCat(slug: CategorySlug): ServiceCategory {
  const base = CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
  const [c, setC] = useState<ServiceCategory>(base);
  useEffect(() => {
    const sync = () => setC(getEffectiveCategory(slug));
    sync();
    return onStoreChange(sync);
  }, [slug]);
  return c;
}

export function CatName({ slug }: { slug: CategorySlug }) { return <>{useCat(slug).name}</>; }
export function CatTagline({ slug }: { slug: CategorySlug }) { return <>{useCat(slug).tagline}</>; }
export function CatAudience({ slug }: { slug: CategorySlug }) { return <>{useCat(slug).audience}</>; }
export function CatDescription({ slug }: { slug: CategorySlug }) { return <>{useCat(slug).description}</>; }
