'use client'

import { useActionState, useState, type ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { reviewManualPaymentAction, type ManualPaymentReviewState } from "@/server/admin/orders"
import { useAdminActionFeedback } from "@/hooks/use-admin-action-feedback"
import { MANUAL_PAYMENT } from "@/lib/manual-payment"

const initialState: ManualPaymentReviewState = { status: "idle" }

type ManualPaymentReviewProps = {
  orderId: string
  paymentId: string
  code: string
  amountLabel: string
  submittedAtLabel: string | null
  stockReserved: boolean | undefined
}

/** Confirm / reject panel for an M-Pesa Paybill payment the customer says they made. */
export function ManualPaymentReview({
  orderId,
  paymentId,
  code,
  amountLabel,
  submittedAtLabel,
  stockReserved,
}: ManualPaymentReviewProps) {
  const [state, formAction] = useActionState(reviewManualPaymentAction, initialState)
  const [rejecting, setRejecting] = useState(false)
  useAdminActionFeedback(state)

  return (
    <div className="space-y-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">M-Pesa payment to verify</p>
        <p className="mt-1 text-foreground">
          Find <span className="font-mono text-base font-semibold">{code}</span> for{" "}
          <span className="font-semibold">{amountLabel}</span> on the bank statement (Paybill {MANUAL_PAYMENT.paybillNumber}, account {MANUAL_PAYMENT.accountNumber}).
        </p>
        {submittedAtLabel ? <p className="text-xs text-amber-800">Submitted {submittedAtLabel}</p> : null}
        <p className="mt-1 text-xs text-amber-800">
          {stockReserved
            ? "Items are reserved for this order."
            : "Items could not be reserved (out of stock). Restock or refund before confirming."}
        </p>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="paymentId" value={paymentId} />
        {rejecting ? (
          <div className="space-y-1.5">
            <label htmlFor="reject-reason" className="text-xs font-medium text-muted-foreground">
              Note to the customer (optional)
            </label>
            <Textarea
              id="reject-reason"
              name="reason"
              maxLength={300}
              rows={2}
              placeholder="e.g. We received KES 1,000 but the order total is KES 1,500."
              className="bg-white"
            />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {rejecting ? (
            <>
              <SubmitButton decision="reject" variant="destructive">Reject and email customer</SubmitButton>
              <Button type="button" variant="ghost" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <SubmitButton decision="confirm">Payment received — confirm order</SubmitButton>
              <Button type="button" variant="outline" className="bg-white" onClick={() => setRejecting(true)}>
                Can&apos;t find it
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}

function SubmitButton({
  decision,
  variant,
  children,
}: {
  decision: "confirm" | "reject"
  variant?: "destructive"
  children: ReactNode
}) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" name="decision" value={decision} variant={variant} disabled={pending}>
      {pending ? "Saving…" : children}
    </Button>
  )
}
