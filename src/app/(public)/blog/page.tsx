"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getPublishedPosts, onStoreChange, BlogPost, BLOG_TAGS } from "@/lib/store";
import { formatDateShort } from "@/lib/format";
import { Eyebrow, Fireflies, Glow } from "@/components/Motifs";

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="section container-fae text-ink-faint">Loading…</div>}>
      <BlogInner />
    </Suspense>
  );
}

function BlogInner() {
  const params = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tag, setTag] = useState<string>("All");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setPosts(getPublishedPosts());
    sync();
    return onStoreChange(sync);
  }, []);

  // deep-link ?post=slug
  useEffect(() => {
    const p = params.get("post");
    if (p) setOpenSlug(p);
  }, [params]);

  const tags = useMemo(() => ["All", ...BLOG_TAGS.filter((t) => posts.some((p) => p.tag === t))], [posts]);
  const shown = tag === "All" ? posts : posts.filter((p) => p.tag === tag);
  const open = openSlug ? posts.find((p) => p.slug === openSlug) : null;
  const featured = shown[0];
  const rest = shown.slice(1);

  return (
    <>
      {/* Hero */}
      <section className="starfield relative overflow-hidden bg-enchanted text-parchment">
        <Fireflies count={12} />
        <Glow className="-left-20 -top-10" size={480} />
        <div className="container-fae relative z-10 py-16 text-center sm:py-20">
          <Eyebrow light>Blog &amp; Insights</Eyebrow>
          <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Ideas on people, systems &amp; the work in between.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-parchment/80">
            Field notes from building calm operations and confident people — written by the Faelight team.
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-parchment/95" />
      </section>

      <section className="section">
        <div className="container-fae">
          {posts.length === 0 ? (
            <p className="py-16 text-center text-ink-faint">No posts yet — check back soon ✦</p>
          ) : (
            <>
              {/* Tag filter */}
              <div className="mb-8 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                      tag === t ? "border-forest bg-forest text-parchment" : "border-firefly/25 bg-parchment-card text-ink-soft hover:border-firefly"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Featured */}
              {featured && (
                <button onClick={() => setOpenSlug(featured.slug)} className="group mb-10 block w-full text-left">
                  <div className="card-hover grid gap-0 overflow-hidden p-0 lg:grid-cols-2">
                    <div className="relative aspect-[16/10] bg-forest-deep lg:aspect-auto">
                      {featured.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={featured.coverImage} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <CoverFallback tag={featured.tag} />
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-8">
                      <PostMeta post={featured} />
                      <h2 className="mt-3 font-serif text-2xl text-forest-deep group-hover:text-forest sm:text-3xl">{featured.title}</h2>
                      <p className="mt-3 text-ink-soft">{featured.excerpt}</p>
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-forest transition group-hover:gap-2">Read article →</span>
                    </div>
                  </div>
                </button>
              )}

              {/* Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <button key={p.id} onClick={() => setOpenSlug(p.slug)} className="group text-left">
                    <article className="card-hover flex h-full flex-col overflow-hidden p-0">
                      <div className="relative aspect-[16/10] bg-forest-deep">
                        {p.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.coverImage} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <CoverFallback tag={p.tag} />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <PostMeta post={p} />
                        <h3 className="mt-2 font-serif text-xl text-forest-deep group-hover:text-forest">{p.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{p.excerpt}</p>
                        <span className="mt-auto pt-4 text-sm font-semibold text-forest">Read →</span>
                      </div>
                    </article>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {open && <Reader post={open} onClose={() => setOpenSlug(null)} />}
    </>
  );
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full bg-firefly/15 px-2.5 py-0.5 font-semibold text-firefly-deep">{post.tag}</span>
      <span className="text-ink-faint">{formatDateShort(post.publishedAt)}</span>
      <span className="text-ink-faint">· {post.readMins} min read</span>
    </div>
  );
}

function CoverFallback({ tag }: { tag: string }) {
  return (
    <div className="starfield absolute inset-0 grid place-items-center bg-enchanted">
      <div className="text-center text-parchment/90">
        <div className="text-3xl">✦</div>
        <p className="mt-1 text-xs font-semibold uppercase tracking-eyebrow text-firefly-bright/80">{tag}</p>
      </div>
    </div>
  );
}

function Reader({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const paras = post.body.split(/\n\s*\n/).filter(Boolean);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-forest-deep/50 p-4 sm:p-8" onClick={onClose}>
      <article
        className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-parchment-card shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] bg-forest-deep">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <CoverFallback tag={post.tag} />
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-forest-deep/70 text-parchment hover:bg-forest-deep"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6 sm:p-10">
          <PostMeta post={post} />
          <h1 className="mt-3 font-serif text-2xl text-forest-deep sm:text-3xl">{post.title}</h1>
          <p className="mt-2 text-sm text-ink-faint">By {post.author}</p>
          <div className="mt-6 space-y-4 text-ink-soft">
            {paras.map((p, i) => (
              <p key={i} className="leading-relaxed">{p}</p>
            ))}
          </div>
          <div className="mt-8 border-t border-firefly/20 pt-6">
            <Link href="/book" className="btn-primary">Book a discovery call ✦</Link>
            <button onClick={onClose} className="btn-ghost ml-2">Back to blog</button>
          </div>
        </div>
      </article>
    </div>
  );
}
