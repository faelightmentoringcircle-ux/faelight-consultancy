import { Settings } from "@/lib/store";

// One payment method (GCash / Maya / BPI) — QR on top, name + number below.
function PayMethod({ label, qr, name, account }: { label: string; qr?: string; name?: string; account?: string }) {
  if (!qr && !account) return null;
  return (
    <div className="rounded-xl border border-firefly/20 bg-white/70 p-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-firefly-deep">{label}</p>
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr}
          alt={`${label} QR`}
          className="mx-auto mt-2 h-32 w-32 rounded-lg border border-firefly/20 bg-white object-contain p-1.5"
        />
      )}
      {(name || account) && (
        <div className="mt-2 text-sm leading-snug">
          {name && <p className="font-medium text-forest-deep">{name}</p>}
          {account && <p className="text-forest-deep">{account}</p>}
        </div>
      )}
    </div>
  );
}

// Client-facing "how to pay" block — Pay-now link + GCash / Maya / BPI codes,
// all read from settings.
export function PaymentDetails({
  settings,
  amountLabel,
}: {
  settings: Settings;
  amountLabel?: string;
}) {
  const payLink = settings.paymentLink?.trim();
  const methods = [
    { label: "GCash", qr: settings.payGcashQr, name: settings.payGcashName, account: settings.payGcashNumber },
    { label: "Maya", qr: settings.payMayaQr, name: settings.payMayaName, account: settings.payMayaNumber },
    {
      label: settings.payBankName || "Bank transfer",
      qr: settings.payBpiQr,
      name: settings.payBankAccountName,
      account: settings.payBankAccountNumber,
    },
  ].filter((m) => m.qr || m.account);

  return (
    <div className="rounded-2xl border border-firefly/25 bg-parchment-warm/50 p-5 text-left">
      <p className="flex items-center gap-2 font-serif text-lg text-forest-deep">
        <span className="text-firefly">✦</span> Settle before your session
      </p>
      {amountLabel && (
        <p className="mt-1 text-sm text-ink-soft">
          Amount due: <span className="font-semibold text-forest">{amountLabel}</span>
        </p>
      )}

      {payLink && (
        <a
          href={payLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold mt-4 flex w-full items-center justify-center gap-2 !py-3 text-sm"
        >
          💳 Pay now{amountLabel ? ` — ${amountLabel}` : ""}
        </a>
      )}

      {methods.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => (
            <PayMethod key={m.label} label={m.label} qr={m.qr} name={m.name} account={m.account} />
          ))}
        </div>
      ) : (
        !payLink && <p className="mt-3 text-sm text-ink-soft">We&apos;ll send payment details by email shortly.</p>
      )}

      {settings.paymentInstructions && (
        <p className="mt-4 border-t border-firefly/15 pt-3 text-xs text-ink-soft">
          {settings.paymentInstructions}
        </p>
      )}
    </div>
  );
}
