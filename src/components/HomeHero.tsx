"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEFAULT_HOME, getHomeContent, onStoreChange, HomeContent } from "@/lib/store";
import { Eyebrow, Fireflies, Glow, Star } from "@/components/Motifs";

// Homepage hero — content editable from /admin/content (stored locally,
// falls back to DEFAULT_HOME). The decorative panel stays fixed.
export function HomeHero() {
  const [c, setC] = useState<HomeContent>(DEFAULT_HOME);

  useEffect(() => {
    const sync = () => setC(getHomeContent());
    sync();
    return onStoreChange(sync);
  }, []);

  return (
    <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
      <Fireflies count={18} />
      <Glow className="-left-20 -top-10" size={600} />
      <Glow className="right-0 top-20" color="rgba(90,68,128,0.6)" size={520} />
      <Glow className="bottom-0 left-1/3" color="rgba(230,183,82,0.25)" size={420} />

      <div className="container-fae relative z-10 py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Copy */}
          <div className="animate-fadeUp">
            {/* Front-page brand logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-full-light.png"
              alt="Faelight Business Consultancy"
              className="mb-6 h-24 w-auto drop-shadow-[0_6px_24px_rgba(230,183,82,0.35)] sm:h-28 lg:h-32"
            />
            <Eyebrow light>{c.eyebrow}</Eyebrow>
            <h1 className="mt-4 font-serif text-3xl leading-[1.12] sm:text-4xl lg:text-5xl">
              {c.titleLine1}
              <br />
              <span className="text-firefly-bright">{c.titleAccent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-parchment/80 sm:text-lg">{c.subline}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={c.ctaPrimaryHref || "/book"} className="btn-gold">
                <Star className="text-forest-deep" /> {c.ctaPrimaryLabel}
              </Link>
              <Link href={c.ctaSecondaryHref || "/classes"} className="btn-ghost-light">
                {c.ctaSecondaryLabel}
              </Link>
            </div>
            {c.tagline && (
              <p className="mt-6 max-w-md text-sm italic text-parchment/55">{c.tagline}</p>
            )}
          </div>

          {/* Floating brand mark */}
          <div className="relative flex items-center justify-center animate-fadeUp">
            <Glow className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" color="rgba(230,183,82,0.35)" size={520} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-mark.png"
              alt="Faelight"
              className="relative animate-floatSlow h-64 w-auto drop-shadow-[0_18px_60px_rgba(230,183,82,0.45)] sm:h-80 lg:h-[26rem]"
            />
          </div>
        </div>
      </div>

      {/* soft transition into the light body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-parchment/95" />
    </section>
  );
}
