import { Settings } from "@/lib/store";

// Client-facing "how to pay" block — QR + GCash + bank, read from settings.
export function PaymentDetails({
  settings,
  amountLabel,
}: {
  settings: Settings;
  amountLabel?: string;
}) {
  const hasQr = !!settings.payGcashQr;
  const hasGcash = !!settings.payGcashNumber;
  const hasBank = !!settings.payBankAccountNumber;

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

      <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        {hasQr && (
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.payGcashQr}
              alt="Payment QR"
              className="mx-auto h-36 w-36 rounded-xl border border-firefly/20 bg-white object-contain p-2"
            />
            <p className="mt-1 text-xs text-ink-faint">Scan to pay</p>
          </div>
        )}
        <div className="space-y-3 text-sm">
          {hasGcash && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">GCash</p>
              <p className="font-medium text-forest-deep">{settings.payGcashName}</p>
              <p className="text-forest-deep">{settings.payGcashNumber}</p>
            </div>
          )}
          {hasBank && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Bank transfer</p>
              <p className="font-medium text-forest-deep">{settings.payBankName} — {settings.payBankAccountName}</p>
              <p className="text-forest-deep">{settings.payBankAccountNumber}</p>
            </div>
          )}
          {!hasGcash && !hasBank && !hasQr && (
            <p className="text-sm text-ink-soft">We'll send payment details by email shortly.</p>
          )}
        </div>
      </div>

      {settings.paymentInstructions && (
        <p className="mt-4 border-t border-firefly/15 pt-3 text-xs text-ink-soft">
          {settings.paymentInstructions}
        </p>
      )}
    </div>
  );
}
