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
