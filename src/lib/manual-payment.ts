/**
 * Manual M-Pesa payment (STK suspended). Flip `STK_PAYMENT_ENABLED` to true
 * when Tuma STK push should return as the automatic checkout path.
 */
export const STK_PAYMENT_ENABLED = false

/**
 * Lipa na M-Pesa → Pay Bill.
 * Business number = Paybill; account number = short code.
 */
export const MANUAL_PAYMENT = {
  methodLabel: "M-Pesa Paybill",
  /** Business number (Paybill) */
  paybillNumber: "516600",
  /** Account number (short code) */
  accountNumber: "857500",
  paybillName: "TAC Accessories",
  supportEmail: "info@tacaccessories.co.ke",
  whatsappDisplay: "+254 704 800866",
  whatsappRaw: "254704800866",
} as const

export type ManualPaymentInstructionContext = {
  /** Order total in KES (store base). */
  amountKes?: number
  /** Shown only as a reference for the customer / support — not the M-Pesa account field. */
  orderNumber?: string | null
}

export function getManualPaymentSteps(ctx: ManualPaymentInstructionContext = {}) {
  const amountLine =
    typeof ctx.amountKes === "number" && Number.isFinite(ctx.amountKes)
      ? `KES ${Math.round(ctx.amountKes).toLocaleString("en-KE")}`
      : "order total"

  return [
    "Go to M-Pesa → Paybill",
    `Business number: ${MANUAL_PAYMENT.paybillNumber}`,
    `Account (short code): ${MANUAL_PAYMENT.accountNumber}`,
    `Amount: ${amountLine} → Submit`,
  ]
}

/**
 * Paybill orders are stored with PaymentMethod.BANK_TRANSFER (money lands in TAC's bank
 * account). Nothing confirms them automatically: the customer submits their M-Pesa
 * confirmation code, which reserves the stock, and staff confirm it against the bank
 * statement in admin.
 */

/** How long a Paybill order waits for a code before the cron expires it (and after a rejection). */
export const MANUAL_PAYMENT_WINDOW_MS = 48 * 60 * 60 * 1000

/** M-Pesa confirmation codes are 10 letters/digits, e.g. "SGH4K2ABCD". */
const MPESA_CODE_PATTERN = /^[A-Z0-9]{10}$/

/** Uppercase and strip spaces; returns null when it can't be an M-Pesa code. */
export function normalizeMpesaCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  const code = raw.replace(/\s+/g, "").toUpperCase()
  return MPESA_CODE_PATTERN.test(code) ? code : null
}

/** What we keep in Payment.gatewayResponse for a Paybill payment. */
export type ManualPaymentMeta = {
  submittedAt?: string
  /** Whether submitting the code managed to reserve the order's stock. */
  stockReserved?: boolean
  verifiedBy?: string
  verifiedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
}

export function parseManualPaymentMeta(gatewayResponse: string | null | undefined): ManualPaymentMeta {
  if (!gatewayResponse) return {}
  try {
    const parsed = JSON.parse(gatewayResponse)
    return parsed && typeof parsed === "object" ? (parsed as ManualPaymentMeta) : {}
  } catch {
    return {}
  }
}
