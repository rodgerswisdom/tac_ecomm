"use client"

import { MANUAL_PAYMENT, getManualPaymentSteps } from "@/lib/manual-payment"
import { cn } from "@/lib/utils"

type ManualPaymentDetailsProps = {
  amountKes?: number
  orderNumber?: string | null
  className?: string
  /** Compact layout for the review step; fuller on thank-you. */
  variant?: "checkout" | "thankyou"
}

function formatAmount(amountKes?: number) {
  if (typeof amountKes !== "number" || !Number.isFinite(amountKes)) return null
  return `KES ${Math.round(amountKes).toLocaleString("en-KE")}`
}

export function ManualPaymentDetails({
  amountKes,
  orderNumber,
  className,
  variant = "checkout",
}: ManualPaymentDetailsProps) {
  const amountLabel = formatAmount(amountKes)

  if (variant === "checkout") {
    return (
      <div
        className={cn(
          "rounded-xl border border-brand-teal/25 bg-brand-beige/50 px-3 py-2.5 text-sm text-brand-umber",
          className,
        )}
      >
        <p className="font-medium text-brand-umber">
          M-Pesa → Paybill → <span className="tabular-nums">{MANUAL_PAYMENT.paybillNumber}</span> →{" "}
          <span className="tabular-nums">{MANUAL_PAYMENT.accountNumber}</span>
          {amountLabel ? (
            <>
              {" "}
              → <span className="tabular-nums text-brand-coral">{amountLabel}</span>
            </>
          ) : null}{" "}
          → Submit
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-umber/70">
          <span>
            Paybill <strong className="tabular-nums text-brand-umber">{MANUAL_PAYMENT.paybillNumber}</strong>
          </span>
          <span>
            Account <strong className="tabular-nums text-brand-umber">{MANUAL_PAYMENT.accountNumber}</strong>
          </span>
          {amountLabel ? (
            <span>
              Amount <strong className="tabular-nums text-brand-coral">{amountLabel}</strong>
            </span>
          ) : null}
        </div>
      </div>
    )
  }

  const steps = getManualPaymentSteps({ amountKes, orderNumber })

  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-teal/25 bg-white/90 p-5 text-left shadow-sm sm:p-6",
        className,
      )}
    >
      <h3 className="font-heading text-xl text-brand-umber">M-Pesa Paybill</h3>
      <p className="mt-1 text-sm text-brand-umber/75">
        M-Pesa → Paybill → {MANUAL_PAYMENT.paybillNumber} → {MANUAL_PAYMENT.accountNumber} → Amount → Submit
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-brand-umber/10 bg-brand-beige/60 p-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-brand-umber/55">Paybill</dt>
          <dd className="font-semibold tabular-nums text-brand-umber">{MANUAL_PAYMENT.paybillNumber}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-brand-umber/55">Account</dt>
          <dd className="font-semibold tabular-nums text-brand-umber">{MANUAL_PAYMENT.accountNumber}</dd>
        </div>
        {amountLabel ? (
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-brand-umber/55">Amount</dt>
            <dd className="font-semibold tabular-nums text-brand-coral">{amountLabel}</dd>
          </div>
        ) : null}
        {orderNumber?.trim() ? (
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-[10px] uppercase tracking-wide text-brand-umber/55">Order</dt>
            <dd className="font-semibold text-brand-umber">{orderNumber.trim()}</dd>
          </div>
        ) : null}
      </dl>

      <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-brand-umber/80">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <p className="mt-3 text-xs text-brand-umber/60">
        Help:{" "}
        <a className="text-brand-teal hover:underline" href={`mailto:${MANUAL_PAYMENT.supportEmail}`}>
          {MANUAL_PAYMENT.supportEmail}
        </a>
        {" · "}
        <a
          className="text-brand-teal hover:underline"
          href={`https://wa.me/${MANUAL_PAYMENT.whatsappRaw}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp {MANUAL_PAYMENT.whatsappDisplay}
        </a>
      </p>
    </div>
  )
}
