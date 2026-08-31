import { LeadStatus, BookingStatus, PaymentStatus } from "@/lib/store";

export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl text-forest-deep sm:text-3xl">
          <span className="text-firefly">✦</span> {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-firefly/20 bg-parchment-card p-5 shadow-card ${className}`}>
      {children}
    </div>
  );
}

const LEAD_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  "discovery booked": "bg-violet-100 text-violet-800",
  "proposal sent": "bg-indigo-100 text-indigo-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-stone-200 text-stone-600",
};

export function LeadBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${LEAD_STYLES[status]}`}>
      {status}
    </span>
  );
}

const BOOKING_STYLES: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-forest/10 text-forest",
  cancelled: "bg-rose-100 text-rose-700",
  "no-show": "bg-stone-200 text-stone-600",
};

export function BookingBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${BOOKING_STYLES[status]}`}>
      {status}
    </span>
  );
}

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-amber-100 text-amber-800",
  submitted: "bg-blue-100 text-blue-800",
  paid: "bg-emerald-100 text-emerald-700",
  waived: "bg-stone-200 text-stone-600",
};
const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  unpaid: "● Unpaid",
  submitted: "◔ Proof submitted",
  paid: "✓ Paid",
  waived: "Waived",
};
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_STYLES[status]}`}>
      {PAYMENT_LABELS[status]}
    </span>
  );
}

export function CategoryTag({ slug }: { slug?: string | null }) {
  if (!slug) return <span className="text-xs text-ink-faint">—</span>;
  const map: Record<string, string> = {
    mentoring: "bg-twilight/10 text-twilight-light",
    systems: "bg-forest/10 text-forest",
    experiences: "bg-firefly/20 text-firefly-deep",
  };
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[slug] ?? "bg-stone-100 text-stone-600"}`}>
      {slug}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  accent = "forest",
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "forest" | "twilight" | "firefly";
  onClick?: () => void;
}) {
  const accents: Record<string, string> = {
    forest: "text-forest",
    twilight: "text-twilight-light",
    firefly: "text-firefly-deep",
  };
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
        {onClick && <span className="text-xs text-firefly-deep opacity-0 transition group-hover:opacity-100">View →</span>}
      </div>
      <p className={`mt-2 font-serif text-3xl ${accents[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </>
  );
  if (onClick) {
    return (
      <button onClick={onClick} className="group w-full text-left">
        <Panel className="transition hover:border-firefly hover:shadow-glow-sm">{body}</Panel>
      </button>
    );
  }
  return <Panel>{body}</Panel>;
}
