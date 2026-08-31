export function peso(n: number): string {
  return "₱" + n.toLocaleString("en-PH");
}

export const MANILA_TZ = "Asia/Manila";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDateShort(iso)} · ${formatTime(iso)}`;
}

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(d) - startOfDay(now)) / 86_400_000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return formatDateShort(iso);
}

/**
 * Classify a testimonial video URL for rendering.
 * - `iframe`  → an embeddable YouTube/Vimeo URL (use in an <iframe>)
 * - `file`    → a direct video file or uploaded data URL (use in a <video>)
 */
export function videoEmbed(url?: string): { kind: "iframe" | "file"; src: string } | null {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;

  // YouTube (watch, youtu.be, shorts, or already-embed)
  const yt =
    u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };

  // Vimeo
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  // Uploaded data URL or direct video file
  if (u.startsWith("data:video") || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(u)) {
    return { kind: "file", src: u };
  }

  // Fallback: assume it can be embedded in an iframe (e.g. Loom, Drive preview)
  return { kind: "iframe", src: u };
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
