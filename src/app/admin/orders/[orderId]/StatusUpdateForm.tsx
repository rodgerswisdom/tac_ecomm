'use client'

import { useFormState, useFormStatus } from "react-dom"
import { useState } from "react"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { updateOrderStatusAction, type UpdateOrderStatusFormState } from "@/server/admin/orders/orders.actions"

const initialState: UpdateOrderStatusFormState = { status: "idle" }

interface StatusUpdateFormProps {
  orderId: string
  defaultStatus: OrderStatus
  defaultPaymentStatus: PaymentStatus
  defaultNote?: string | null
  defaultTrackingNumber?: string | null
  statusOptions: OrderStatus[]
  paymentStatusOptions: PaymentStatus[]
}

export function StatusUpdateForm({
  orderId,
  defaultStatus,
  defaultPaymentStatus,
  defaultNote,
  defaultTrackingNumber,
  statusOptions,
  paymentStatusOptions,
}: StatusUpdateFormProps) {
  const [state, formAction] = useFormState(updateOrderStatusAction, initialState)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(defaultStatus)

  const showShippingFields =
    selectedStatus === OrderStatus.SHIPPED || selectedStatus === OrderStatus.DELIVERED

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      {/* ── Fulfillment status ── */}
      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          htmlFor="order-status"
        >
          Fulfillment status
        </label>
        <select
          id="order-status"
          name="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option.replace(/_/g, " ").toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* ── Shipping fields — visible when SHIPPED or DELIVERED ── */}
      {showShippingFields && (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/60 p-4 space-y-3">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Shipping details
          </p>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="tracking-number"
            >
              Tracking number
            </label>
            <Input
              id="tracking-number"
              name="trackingNumber"
              placeholder="e.g. KE123456789"
              defaultValue={defaultTrackingNumber ?? ""}
              className="h-9 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="estimated-delivery"
            >
              Estimated delivery
            </label>
            <Input
              id="estimated-delivery"
              name="estimatedDelivery"
              placeholder="e.g. 3 – 5 March 2026"
              className="h-9 text-sm"
            />
          </div>

          <p className="text-xs text-amber-600 leading-relaxed">
            {selectedStatus === OrderStatus.SHIPPED
              ? "A shipment notification email will be sent to the customer with these details."
              : "A delivery confirmation email will be sent to the customer."}
          </p>
        </div>
      )}

      {/* ── Payment status ── */}
      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          htmlFor="payment-status"
        >
          Payment status
        </label>
        <select
          id="payment-status"
          name="paymentStatus"
          defaultValue={defaultPaymentStatus}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {paymentStatusOptions.map((option) => (
            <option key={option} value={option}>
              {option.replace(/_/g, " ").toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* ── Internal note ── */}
      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          htmlFor="order-note"
        >
          Internal note
        </label>
        <Textarea
          id="order-note"
          name="note"
          placeholder="Add context for your team…"
          defaultValue={defaultNote ?? ""}
          className="resize-none text-sm"
          rows={3}
        />
      </div>

      {/* ── Feedback ── */}
      {state.status === "error" && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 border border-rose-200">
          {state.message ?? "Unable to update order"}
        </p>
      )}
      {state.status === "success" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 border border-emerald-200">
          {state.message ?? "Order updated"}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Save update"}
    </Button>
  )
}
