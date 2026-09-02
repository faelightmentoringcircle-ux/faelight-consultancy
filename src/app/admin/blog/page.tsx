"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getBlogPosts, addBlogPost, updateBlogPost, removeBlogPost, onStoreChange,
  BlogPost, BlogStatus, getBlogTagOptions, BlogTag, slugify,
} from "@/lib/store";
import { formatDateShort } from "@/lib/format";
import { AdminHeader, Panel, StatTile } from "@/components/admin/ui";

const MAX_IMG_MB = 4;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

type Draft = {
  title: string; excerpt: string; body: string; coverImage: string;
  author: string; tag: BlogTag; readMins: number; status: BlogStatus;
};

const BLANK: Draft = {
  title: "", excerpt: "", body: "", coverImage: "",
  author: "Maria “Maia” Castañeda", tag: "Insights", readMins: 3, status: "draft",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tab, setTab] = useState<BlogStatus | "all">("all");
  const [editing, setEditing] = useState<BlogPost | "new" | null>(null);

  useEffect(() => {
    const sync = () => setPosts(getBlogPosts());
    sync();
    return onStoreChange(sync);
  }, []);

  const counts = {
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
  };
  const shown = useMemo(
    () => (tab === "all" ? posts : posts.filter((p) => p.status === tab)),
    [posts, tab]
  );

  return (
    <>
      <AdminHeader
        title="Blog & Insights"
        subtitle="Write and publish articles for the public Blog section."
        action={
          <div className="flex items-center gap-2">
            <Link href="/blog" target="_blank" className="btn-ghost text-sm">View blog ↗</Link>
            <button onClick={() => setEditing("new")} className="btn-primary text-sm">✦ New post</button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Published" value={counts.published} hint="live on the site" accent="forest" />
        <StatTile label="Drafts" value={counts.draft} accent="firefly" />
        <StatTile label="Total posts" value={posts.length} accent="twilight" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "published", "draft"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition ${
              tab === t ? "border-forest bg-forest text-parchment" : "border-firefly/25 bg-parchment-card text-ink-soft hover:border-firefly"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.length === 0 && (
          <Panel><p className="py-6 text-center text-ink-faint">No {tab === "all" ? "" : tab} posts yet.</p></Panel>
        )}
        {shown.map((p) => (
          <Panel key={p.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-forest-deep">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-firefly-bright/70">✦</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{p.status}</span>
                  <span className="rounded-full bg-firefly/15 px-2.5 py-0.5 text-xs font-semibold text-firefly-deep">{p.tag}</span>
                  <span className="text-xs text-ink-faint">{formatDateShort(p.publishedAt)} · {p.readMins} min</span>
                </div>
                <p className="mt-1 truncate font-medium text-forest-deep">{p.title}</p>
                <p className="truncate text-xs text-ink-faint">/blog · {p.slug}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {p.status === "draft" ? (
                  <button onClick={() => updateBlogPost(p.id, { status: "published", publishedAt: new Date().toISOString() })} className="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Publish</button>
                ) : (
                  <button onClick={() => updateBlogPost(p.id, { status: "draft" })} className="rounded-lg border border-firefly/30 px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-firefly">Unpublish</button>
                )}
                <button onClick={() => setEditing(p)} className="rounded-lg border border-firefly/30 px-3 py-1.5 text-xs font-semibold text-forest hover:border-firefly">Edit</button>
                <button onClick={() => { if (confirm("Delete this post permanently?")) removeBlogPost(p.id); }} className="text-xs font-semibold text-ink-faint hover:text-rose-600">Delete</button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {editing && (
        <PostEditor
          post={editing === "new" ? null : editing}
          onDone={() => setEditing(null)}
        />
      )}
    </>
  );
}

function PostEditor({ post, onDone }: { post: BlogPost | null; onDone: () => void }) {
  const [f, setF] = useState<Draft>(post ? {
    title: post.title, excerpt: post.excerpt, body: post.body, coverImage: post.coverImage ?? "",
    author: post.author, tag: post.tag, readMins: post.readMins, status: post.status,
  } : BLANK);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const input = "w-full rounded-xl border border-firefly/25 bg-white px-4 py-2.5 text-sm outline-none focus:border-firefly";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMG_MB * 1024 * 1024) { setErr(`Image too large (max ${MAX_IMG_MB} MB).`); return; }
    setBusy(true); setErr("");
    try { const url = await fileToDataUrl(file); setF((x) => ({ ...x, coverImage: url })); }
    catch { setErr("Could not read that image."); }
    finally { setBusy(false); }
  }

  function estimateMins(body: string) {
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }

  function save(status: BlogStatus) {
    if (!f.title.trim()) { setErr("Please add a title."); return; }
    const readMins = f.readMins || estimateMins(f.body);
    if (post) {
      updateBlogPost(post.id, {
        title: f.title.trim(), excerpt: f.excerpt.trim(), body: f.body,
        coverImage: f.coverImage || undefined, author: f.author.trim() || "Faelight",
        tag: f.tag, readMins, status,
        publishedAt: status === "published" && post.status !== "published" ? new Date().toISOString() : post.publishedAt,
      });
    } else {
      addBlogPost({
        title: f.title.trim(), excerpt: f.excerpt.trim(), body: f.body,
        coverImage: f.coverImage || undefined, author: f.author.trim() || "Faelight",
        tag: f.tag, readMins, status,
        publishedAt: new Date().toISOString(),
      });
    }
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-forest-deep/40 p-4 sm:p-8" onClick={onDone}>
      <div className="mx-auto max-w-2xl rounded-2xl bg-parchment-card p-6 shadow-glow sm:p-8" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-xl text-forest-deep">{post ? "Edit Post" : "New Post"}</h3>

        <div className="mt-4 space-y-3">
          <input className={input} placeholder="Post title *" value={f.title}
            onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} />
          {f.title && <p className="-mt-1 text-xs text-ink-faint">URL: /blog · {slugify(f.title)}</p>}

          <div className="grid gap-3 sm:grid-cols-2">
            <select className={input} value={f.tag} onChange={(e) => setF((x) => ({ ...x, tag: e.target.value as BlogTag }))}>
              {getBlogTagOptions().map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className={input} placeholder="Author" value={f.author}
              onChange={(e) => setF((x) => ({ ...x, author: e.target.value }))} />
          </div>

          <textarea rows={2} className={input} placeholder="Short excerpt (shown on cards)" value={f.excerpt}
            onChange={(e) => setF((x) => ({ ...x, excerpt: e.target.value }))} />

          <textarea rows={8} className={input} placeholder="Write the article… (leave a blank line between paragraphs)" value={f.body}
            onChange={(e) => setF((x) => ({ ...x, body: e.target.value }))} />

          {/* Cover image */}
          <div className="rounded-xl border border-firefly/25 bg-white/60 p-3">
            <p className="text-xs font-semibold text-forest-deep">Cover image (optional)</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {f.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.coverImage} alt="" className="h-16 w-28 rounded-lg object-cover" />
              ) : (
                <div className="grid h-16 w-28 place-items-center rounded-lg bg-forest-deep text-firefly-bright/70">✦</div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="btn-ghost text-xs">
                {busy ? "Uploading…" : "⬆ Upload image"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
              {f.coverImage && (
                <button type="button" onClick={() => setF((x) => ({ ...x, coverImage: "" }))} className="text-xs font-semibold text-rose-600 hover:underline">Remove</button>
              )}
            </div>
            <input className={`${input} mt-2`} placeholder="…or paste an image URL" value={f.coverImage.startsWith("data:") ? "" : f.coverImage}
              onChange={(e) => setF((x) => ({ ...x, coverImage: e.target.value }))} />
          </div>

          {err && <p className="text-xs text-rose-600">{err}</p>}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => save("published")} className="btn-primary flex-1">{post?.status === "published" ? "Save & keep live" : "Publish"}</button>
          <button onClick={() => save("draft")} className="btn-ghost">Save draft</button>
          <button onClick={onDone} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}
