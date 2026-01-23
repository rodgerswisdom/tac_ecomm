'use client'

import { useFormState, useFormStatus } from "react-dom"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateOrderStatusAction, type UpdateOrderStatusFormState } from "@/server/admin/orders"

const initialState: UpdateOrderStatusFormState = { status: "idle" }

interface StatusUpdateFormProps {
  orderId: string
  defaultStatus: OrderStatus
  defaultPaymentStatus: PaymentStatus
  defaultNote?: string | null
  statusOptions: OrderStatus[]
  paymentStatusOptions: PaymentStatus[]
}

export function StatusUpdateForm({
  orderId,
  defaultStatus,
  defaultPaymentStatus,
  defaultNote,
  statusOptions,
  paymentStatusOptions,
}: StatusUpdateFormProps) {
  const [state, formAction] = useFormState(updateOrderStatusAction, initialState)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="text-xs font-medium text-muted-foreground" htmlFor="order-status">
        Fulfillment status
      </label>
      <select
        id="order-status"
        name="status"
        defaultValue={defaultStatus}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, " ").toLowerCase()}
          </option>
        ))}
      </select>
      <label className="text-xs font-medium text-muted-foreground" htmlFor="payment-status">
        Payment status
      </label>
      <select
        id="payment-status"
        name="paymentStatus"
        defaultValue={defaultPaymentStatus}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {paymentStatusOptions.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, " ").toLowerCase()}
          </option>
        ))}
      </select>
      <label className="text-xs font-medium text-muted-foreground" htmlFor="order-note">
        Internal note
      </label>
      <Textarea id="order-note" name="note" placeholder="Add context for your team" defaultValue={defaultNote ?? ""} />
      {state.status === "error" ? (
        <p className="text-sm font-medium text-rose-600">{state.message ?? "Unable to update order"}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm font-medium text-emerald-600">{state.message ?? "Order updated"}</p>
      ) : null}
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : "Save update"}
    </Button>
  )
}
