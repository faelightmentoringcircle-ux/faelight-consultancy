import Link from "next/link";

// Faelight brand lockup: the winged-lantern emblem + wordmark.
// The emblem PNG is transparent gold, so it sits cleanly on light
// (parchment) and dark (enchanted) surfaces alike.
export function Wordmark({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  const text = light ? "text-parchment" : "text-forest-deep";
  const sub = light ? "text-firefly-bright/80" : "text-ink-faint";
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-mark.png"
        alt="Faelight"
        className="h-10 w-auto transition-transform duration-500 group-hover:scale-105"
      />
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-xl font-semibold tracking-tight ${text}`}>
          Faelight
        </span>
        {!compact && (
          <span className={`mt-0.5 text-[10px] font-semibold uppercase tracking-eyebrow ${sub}`}>
            Business Consultancy
          </span>
        )}
      </span>
    </Link>
  );
}
