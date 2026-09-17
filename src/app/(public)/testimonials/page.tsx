"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApprovedReviews, onStoreChange, Review } from "@/lib/store";
import { videoEmbed } from "@/lib/format";
import { TestimonialsGrid } from "@/components/Testimonials";
import { Eyebrow, Fireflies, FairySwirl, Glow } from "@/components/Motifs";

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const sync = () => setReviews(getApprovedReviews());
    sync();
    return onStoreChange(sync);
  }, []);

  const videoReviews = reviews.filter((r) => videoEmbed(r.videoUrl));
  const textReviews = reviews.filter((r) => !videoEmbed(r.videoUrl));

  return (
    <>
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={20} />
        <FairySwirl count={3} />
        <Glow className="-left-16 top-4" size={440} />
        <div className="container-fae relative z-10 py-14 text-center sm:py-16">
          <Eyebrow light>Kind words</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-5xl">
            What our <span className="text-firefly-bright">clients &amp; students</span> say
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-parchment/75">
            Real words from the people and teams we&apos;ve worked with — and the graduates who started here.
          </p>
          <Link href="/feedback" className="btn-gold mt-6 inline-block">✦ Share your experience</Link>
        </div>
      </section>

      <section className="section">
        <div className="container-fae">
          {reviews.length === 0 ? (
            <p className="py-10 text-center text-ink-faint">
              No testimonials yet — be the first to{" "}
              <Link href="/feedback" className="font-semibold text-firefly-deep hover:underline">share your experience ✦</Link>.
            </p>
          ) : (
            <TestimonialsGrid reviews={[...videoReviews, ...textReviews]} />
          )}
        </div>
      </section>
    </>
  );
}
