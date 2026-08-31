"use client";

import { useEffect, useState } from "react";
import { DEFAULT_HOME, getHomeContent, onStoreChange } from "@/lib/store";
import { Eyebrow, Glow } from "@/components/Motifs";

// Converts a YouTube / Vimeo / direct-video URL into something embeddable.
function toEmbed(url: string): { kind: "iframe" | "video" | "none"; src: string } {
  const u = url.trim();
  if (!u) return { kind: "none", src: "" };
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vim = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vim) return { kind: "iframe", src: `https://player.vimeo.com/video/${vim[1]}` };
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(u)) return { kind: "video", src: u };
  // Assume it's already an embeddable URL.
  return { kind: "iframe", src: u };
}

export function AboutVideo() {
  const [url, setUrl] = useState(DEFAULT_HOME.aboutVideoUrl);
  const [caption, setCaption] = useState(DEFAULT_HOME.aboutVideoCaption);

  useEffect(() => {
    const sync = () => {
      const c = getHomeContent();
      setUrl(c.aboutVideoUrl);
      setCaption(c.aboutVideoCaption);
    };
    sync();
    return onStoreChange(sync);
  }, []);

  const embed = toEmbed(url);

  return (
    <section className="section">
      <div className="container-fae">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Faelight in motion</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">{caption}</h2>
        </div>

        <div className="relative mx-auto mt-8 max-w-4xl">
          <Glow className="-left-6 -top-6" color="rgba(230,183,82,0.25)" size={320} />
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-firefly/25 bg-enchanted shadow-glow">
            {embed.kind === "iframe" && (
              <iframe
                src={embed.src}
                title={caption}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
            {embed.kind === "video" && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={embed.src} controls className="h-full w-full object-cover" />
            )}
            {embed.kind === "none" && (
              <div className="starfield grid h-full w-full place-items-center text-center text-parchment">
                <div className="relative z-10 px-6">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-firefly/20 text-2xl text-firefly-bright ring-2 ring-firefly/40">
                    ▶
                  </div>
                  <p className="mt-4 font-serif text-xl">Trailer coming soon</p>
                  <p className="mt-1 text-sm text-parchment/70">
                    Add a video link from the admin (Landing / Content) to feature it here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
