"use client";

import { useEffect, useState } from "react";
import { getEffectiveList, onStoreChange } from "@/lib/store";

// A StarList whose items are admin-editable (Admin → Settings → Page content
// lists), identified by a stable `id`. Renders the seed on first paint (so SSR
// matches) then swaps in any saved override. Markup mirrors <StarList>.
export function EditableStarList({
  id,
  title,
  seed,
  light = false,
}: {
  id: string;
  title: string;
  seed: string[];
  light?: boolean;
}) {
  const [items, setItems] = useState<string[]>(seed);
  useEffect(() => {
    const sync = () => setItems(getEffectiveList(id, seed));
    sync();
    return onStoreChange(sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div>
      <h3 className={`font-serif text-xl ${light ? "text-parchment" : "text-forest-deep"}`}>
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3">
            <span className={`mt-1 text-sm ${light ? "text-firefly-bright" : "text-firefly"}`}>✦</span>
            <span className={`text-sm ${light ? "text-parchment/80" : "text-ink-soft"}`}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
