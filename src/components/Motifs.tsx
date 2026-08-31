// Fantasy visual motifs — stars, glows, dividers. Purely decorative,
// so all are aria-hidden. Motion respects prefers-reduced-motion via CSS.

export function Star({ className = "" }: { className?: string }) {
  return <span aria-hidden className={className}>✦</span>;
}

export function StarLight({ className = "" }: { className?: string }) {
  return <span aria-hidden className={className}>✧</span>;
}

// A soft firefly glow blob to place behind content.
export function Glow({
  className = "",
  color = "rgba(230,183,82,0.35)",
  size = 420,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(closest-side, ${color}, transparent)`,
      }}
    />
  );
}

// A few gently twinkling fireflies scattered in a container.
export function Fireflies({ count = 8 }: { count?: number }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const top = (i * 37) % 90 + 3;
    const left = (i * 53) % 92 + 3;
    const delay = (i % 5) * 0.7;
    const size = 3 + (i % 3);
    return (
      <span
        key={i}
        className="absolute rounded-full bg-firefly-bright animate-twinkle"
        style={{
          top: `${top}%`,
          left: `${left}%`,
          width: size,
          height: size,
          animationDelay: `${delay}s`,
          boxShadow: "0 0 8px 2px rgba(244,212,136,0.6)",
        }}
      />
    );
  });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots}
    </div>
  );
}

// Swirling "fairy pass" — sparkles that fly along curved motion-paths,
// leaving a trail, with soft drifting wisps of gold dust behind them.
// Purely decorative; hidden when the viewer prefers reduced motion.
const FAIRY_PATHS = [
  "M -80,140 C 220,-40 520,300 780,120 S 1200,260 1500,60",
  "M -60,320 C 260,140 440,460 720,280 S 1120,120 1520,340",
  "M -40,60 C 200,280 540,10 760,240 S 1180,380 1520,150",
  "M -90,440 C 240,320 500,560 780,380 S 1140,220 1540,460",
];

export function FairySwirl({
  count = 3,
  variant = "dark",
}: {
  count?: number;
  variant?: "dark" | "light";
}) {
  const light = variant === "light";
  const blend = light ? ("normal" as const) : ("screen" as const);
  const palette = light ? ["#e6b752", "#c9922f", "#f0c96a"] : ["#f4d488", "#e6b752", "#fff3d0"];

  const sparkles = FAIRY_PATHS.flatMap((p, pi) =>
    Array.from({ length: count }, (_, k) => {
      const idx = pi * count + k;
      const dur = 9 + (idx % 5) * 1.6; // 9–15.4s
      const delay = (idx * 1.7) % 10; // desync starting points along the path
      const size = (light ? 3 : 3) + (idx % 3);
      const hue = palette[idx % 3];
      return (
        <span
          key={idx}
          className="animate-fairy absolute left-0 top-0 rounded-full will-change-transform"
          style={{
            offsetPath: `path('${p}')`,
            offsetRotate: "auto",
            width: size,
            height: size,
            background: hue,
            boxShadow: light
              ? `0 0 6px 1.5px ${hue}, 0 0 14px 3px ${hue}66`
              : `0 0 10px 3px ${hue}, 0 0 22px 6px ${hue}55`,
            animationDuration: `${dur}s`,
            animationDelay: `-${delay}s`,
            mixBlendMode: blend,
          }}
        />
      );
    })
  );

  const wisps = [0, 1, 2].map((i) => (
    <span
      key={`w${i}`}
      className="animate-wisp absolute rounded-full blur-2xl"
      style={{
        top: `${18 + i * 26}%`,
        width: 170,
        height: 170,
        background: light
          ? "radial-gradient(closest-side, rgba(201,146,47,0.18), transparent)"
          : "radial-gradient(closest-side, rgba(230,183,82,0.28), transparent)",
        animationDuration: `${15 + i * 4}s`,
        animationDelay: `-${i * 5}s`,
        mixBlendMode: blend,
      }}
    />
  ));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
      {wisps}
      {sparkles}
    </div>
  );
}

// Decorative gold laurel / leaf sprays down the left & right edges, to keep
// wide sections from feeling empty. Purely ornamental and aria-hidden.
function LeafBranch({ id, tone }: { id: string; tone: string }) {
  const N = 12;
  const H = 660;
  const leaves = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const y = 40 + t * (H - 80);
    const x = 78 + Math.sin(t * Math.PI * 1.5) * 30;
    const side = i % 2 === 0 ? 1 : -1;
    const rot = side * 52;
    const scale = 0.7 + (1 - Math.abs(t - 0.5)) * 0.85;
    return { x, y, rot, scale, key: i };
  });
  const stem = "M78,30 " + leaves.map((l) => `L${l.x.toFixed(1)},${l.y.toFixed(1)}`).join(" ");
  // A single teardrop leaf pointing "up" from the origin.
  const leafPath = "M0,0 C7,-11 7,-25 0,-34 C-7,-25 -7,-11 0,0 Z";
  return (
    <svg viewBox={`0 0 160 ${H}`} preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.9" />
          <stop offset="100%" stopColor={tone} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path d={stem} fill="none" stroke={`url(#${id})`} strokeWidth="1.6" strokeLinecap="round" />
      {leaves.map((l) => (
        <path
          key={l.key}
          d={leafPath}
          fill={`url(#${id})`}
          transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.rot}) scale(${l.scale.toFixed(2)})`}
        />
      ))}
    </svg>
  );
}

export function SideLeaves({ variant = "light" }: { variant?: "dark" | "light" }) {
  const tone = variant === "light" ? "#c9922f" : "#e6b752";
  const opacity = variant === "light" ? 0.22 : 0.32;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity }}>
      {/* Left edge */}
      <div className="absolute -left-6 top-0 hidden h-full w-28 sm:block md:w-36">
        <LeafBranch id="leaf-l" tone={tone} />
      </div>
      {/* Right edge (mirrored) */}
      <div className="absolute -right-6 top-0 hidden h-full w-28 -scale-x-100 sm:block md:w-36">
        <LeafBranch id="leaf-r" tone={tone} />
      </div>
    </div>
  );
}

// Elegant star divider between sections.
export function StarDivider({ light = false }: { light?: boolean }) {
  const line = light ? "bg-parchment/25" : "bg-firefly/30";
  const star = light ? "text-firefly-bright" : "text-firefly";
  return (
    <div aria-hidden className="flex items-center justify-center gap-4 py-2">
      <span className={`h-px w-16 ${line}`} />
      <span className={`text-sm ${star}`}>✦</span>
      <span className={`h-px w-16 ${line}`} />
    </div>
  );
}

// Section eyebrow: letter-spaced small-caps with a leading star.
export function Eyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p className={light ? "eyebrow-light" : "eyebrow"}>
      <span aria-hidden>✦</span>
      {children}
    </p>
  );
}
