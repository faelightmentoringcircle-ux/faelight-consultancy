import { makeQR } from "@/lib/qr";

// Renders a scannable QR as crisp SVG. Falls back gracefully if encoding
// ever fails (the URL is always shown next to it by the caller).
export function QRCode({
  text,
  size = 132,
  className = "",
}: {
  text: string;
  size?: number;
  className?: string;
}) {
  let matrix;
  try {
    matrix = makeQR(text);
  } catch {
    return null;
  }
  const n = matrix.size;
  const quiet = 4;
  const dim = n + quiet * 2;
  const rects: string[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (matrix.modules[y][x]) {
        rects.push(`<rect x="${x + quiet}" y="${y + quiet}" width="1" height="1"/>`);
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${dim} ${dim}`}
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR code linking to ${text}`}
    >
      <rect width={dim} height={dim} fill="#ffffff" />
      <g fill="#122720" dangerouslySetInnerHTML={{ __html: rects.join("") }} />
    </svg>
  );
}
