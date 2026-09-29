import Link from "next/link"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { ClearCartClient } from "./ClearCartClient"
import { PaymentStatusWatcherClient } from "./PaymentStatusWatcherClient"
import { PurchaseTracker } from "./PurchaseTracker"
import { RetryPaystackPaymentButton } from "./RetryPaystackPaymentButton"
import { ManualPaymentDetails } from "@/components/checkout/ManualPaymentDetails"
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { MANUAL_PAYMENT, STK_PAYMENT_ENABLED } from "@/lib/manual-payment"
import { parsePaystackMeta, paystackReviewReason, reconcilePaystackOrder } from "@/lib/paystack"
import { CUSTOMER_ARRANGED_DELIVERY, PICKUP_LOCATION } from "@/lib/delivery"

type StatusKind =
  | "success"
  | "pending"
  | "review"
  | "failed"
  | "notCompleted"
  | "expired"
  | "cancelled"
  | "refunded"

type Tone = "success" | "pending" | "error"

const statusCopy: Record<StatusKind, { title: string; body: string; tone: Tone }> = {
  success: {
    title: "Payment received",
    body: "Thank you for completing your purchase. Your order is confirmed and our team is preparing it for delivery.",
    tone: "success",
  },
  pending: {
    title: "Order placed — complete payment",
    body: "Your order is reserved. Pay with M-Pesa using the details below, then we will confirm your order.",
    tone: "pending",
  },
  review: {
    title: "We've received your payment",
    body: "We're verifying a detail on this payment and will contact you shortly. Please don't pay again — reach us on WhatsApp if you have questions.",
    tone: "pending",
  },
  failed: {
    title: "Your payment didn't go through",
    body: "No money was taken. You can try again — your order and cart are saved.",
    tone: "error",
  },
  notCompleted: {
    title: "Payment not completed",
    body: "It looks like the payment was closed before it finished. Your order is saved — you can resume payment whenever you're ready.",
    tone: "error",
  },
  expired: {
    title: "This order has expired",
    body: "We didn't receive payment in time, so this order was closed. Your items are still in your cart if you'd like to check out again.",
    tone: "error",
  },
  cancelled: {
    title: "Order cancelled",
    body: "This order was cancelled. Contact us if you think this is a mistake.",
    tone: "error",
  },
  refunded: {
    title: "Order refunded",
    body: "This order has been refunded. Refunds usually reach your M-Pesa or card within a few working days.",
    tone: "error",
  },
}

const PAYSTACK_PENDING_COPY = {
  title: "Confirming your payment",
  body: "We are waiting for Paystack to confirm your payment. This page updates automatically, and you will receive an email once it clears.",
  tone: "pending" as const,
}

type ThankYouSearchParams = {
  status?: string
  orderId?: string
  orderNumber?: string
  trackingId?: string
  message?: string
}

type ThankYouPageProps = {
  searchParams: Promise<ThankYouSearchParams>
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams
  const trackingId = params.trackingId
  const message = params.message
  const orderNumberParam = params.orderNumber

  // Look the order up by id, or by order number when only that is known.
  const orderWhere = params.orderId
    ? { id: params.orderId }
    : orderNumberParam
      ? { orderNumber: orderNumberParam }
      : null

  let order: {
    id: string
    status: OrderStatus
    paymentStatus: PaymentStatus
    // Order.paymentMethod is a plain string column (compared against PaymentMethod values).
    paymentMethod: string | null
    orderNumber: string
    total: number
    shippingMethod: string | null
    payments: { method: PaymentMethod; gatewayResponse: string | null }[]
  } | null = null

  if (orderWhere) {
    try {
      // Settle a pending Paystack payment right away, so reopening this page fixes a stuck order.
      await reconcilePaystackOrder(orderWhere)
      order = await prisma.order.findUnique({
        where: orderWhere,
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          orderNumber: true,
          total: true,
          shippingMethod: true,
          payments: {
            orderBy: { createdAt: "desc" },
            select: { method: true, gatewayResponse: true },
          },
        },
      })
    } catch (error) {
      console.error("Failed to read order status on thank-you page:", error)
    }
  }
  const orderId = order?.id ?? params.orderId
  const isPaystack = order?.paymentMethod === PaymentMethod.PAYSTACK

  const isManualPending =
    order?.paymentStatus === PaymentStatus.PENDING &&
    order.paymentMethod === PaymentMethod.BANK_TRANSFER

  // Only redirect into the STK waiting UI when automatic STK is enabled.
  if (
    STK_PAYMENT_ENABLED &&
    order &&
    order.paymentStatus === PaymentStatus.PENDING &&
    order.paymentMethod === PaymentMethod.TUMA
  ) {
    redirect(`/checkout/payment?orderId=${encodeURIComponent(orderId!)}`)
  }

  const reviewReason = order ? paystackReviewReason(order.payments) : null
  const status: StatusKind = resolveStatus(order, reviewReason, params.status)

  const copy =
    isManualPending
      ? statusCopy.pending
      : status === "pending" && order?.paymentMethod === PaymentMethod.TUMA
        ? {
            title: "Payment pending",
            body: "Check your phone to approve the M-Pesa STK push. You will receive an email as soon as payment clears.",
            tone: "pending" as const,
          }
        : status === "pending" && (!order || isPaystack)
          ? PAYSTACK_PENDING_COPY
          : statusCopy[status]

  // Paystack's own reason for the latest failed attempt (e.g. "Insufficient funds").
  const failureReason =
    status === "failed" && order
      ? parsePaystackMeta(order.payments.find((p) => p.method === PaymentMethod.PAYSTACK)?.gatewayResponse)
          .gateway_response ?? null
      : null

  const isPaymentCompleted = status === "success"
  const displayOrderNumber = order?.orderNumber ?? orderNumberParam
  const canRetryPaystack =
    isPaystack && order?.status === OrderStatus.PENDING && !reviewReason && !isPaymentCompleted
  const session = await auth()

  const orderData =
    isPaymentCompleted && orderId
      ? await prisma.order
          .findUnique({
            where: { id: orderId },
            select: {
              id: true,
              total: true,
              tax: true,
              shipping: true,
              currency: true,
              items: {
                select: {
                  productId: true,
                  quantity: true,
                  price: true,
                  product: { select: { name: true, category: { select: { name: true } } } },
                },
              },
            },
          })
          .catch((error) => {
            console.error("Failed to fetch order details for analytics:", error)
            return null
          })
      : null

  return (
    <main className="relative min-h-screen overflow-hidden page-surface">
      <ClearCartClient active={isPaymentCompleted || isManualPending} />
      <PaymentStatusWatcherClient
        enabled={
          !isPaymentCompleted &&
          !isManualPending &&
          (status === "pending" || status === "notCompleted") &&
          !!orderId
        }
        orderId={orderId}
        orderNumber={displayOrderNumber}
        trackingId={trackingId}
      />
      {isPaymentCompleted && orderData && (
        <PurchaseTracker
          orderId={orderData.id}
          orderTotal={orderData.total}
          orderTax={orderData.tax}
          orderShipping={orderData.shipping}
          orderCurrency={orderData.currency}
          orderItems={orderData.items.map((item) => ({
            id: item.productId ?? "",
            name: item.product?.name || "Unknown Product",
            price: item.price,
            quantity: item.quantity,
            category: item.product?.category?.name,
          }))}
        />
      )}
      <Navbar />
      <section className="nav-clearance section-spacing pb-0">
        <div className="gallery-container flex flex-col items-center gap-10 text-center">
          <p className="caps-spacing text-xs text-brand-teal">Order status</p>
          <h1 className="font-heading text-5xl text-brand-umber md:text-6xl">{copy.title}</h1>
          <div className="max-w-2xl space-y-2">
            <p className="text-base text-brand-umber/70">{message ?? copy.body}</p>
            {isPaymentCompleted && order?.shippingMethod === "customer_arranged" ? (
              <p className="text-sm font-medium text-brand-umber">{CUSTOMER_ARRANGED_DELIVERY.handover}</p>
            ) : null}
            {isPaymentCompleted && order?.shippingMethod === "pickup" ? (
              <p className="text-sm font-medium text-brand-umber">
                Collect from {PICKUP_LOCATION.address}. {PICKUP_LOCATION.instructions}
              </p>
            ) : null}
            {failureReason ? (
              <p className="text-sm text-brand-umber/60">
                Paystack said: <span className="font-medium text-brand-umber">{failureReason}</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {displayOrderNumber ? (
              <div className="rounded-full border border-brand-teal/30 bg-white/90 px-5 py-2 text-sm text-brand-umber/70 shadow">
                Order <span className="font-semibold text-brand-umber">{displayOrderNumber}</span>
              </div>
            ) : orderId ? (
              <div className="rounded-full border border-brand-teal/30 bg-white/90 px-5 py-2 text-sm text-brand-umber/70 shadow">
                Order reference <span className="font-semibold text-brand-umber">{orderId}</span>
              </div>
            ) : null}
            {trackingId ? (
              <div className="rounded-full border border-brand-teal/30 bg-white/90 px-5 py-2 text-sm text-brand-umber/70 shadow">
                Payment tracking <span className="font-semibold text-brand-umber">{trackingId}</span>
              </div>
            ) : null}
          </div>

          {isManualPending && order ? (
            <div className="w-full max-w-xl">
              <ManualPaymentDetails
                amountKes={order.total}
                orderNumber={order.orderNumber}
                variant="thankyou"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-start justify-center gap-4">
            {canRetryPaystack && orderId && (status === "failed" || status === "notCompleted") ? (
              <RetryPaystackPaymentButton
                orderId={orderId}
                label={status === "failed" ? "Try again" : "Resume payment"}
              />
            ) : null}
            {!isPaystack && copy.tone === "error" && status !== "expired" && status !== "cancelled" && status !== "refunded" && (
              <Button asChild variant="outline" className="border-brand-teal/40 text-brand-umber">
                <Link href="/checkout">Try again</Link>
              </Button>
            )}
            {copy.tone === "pending" && STK_PAYMENT_ENABLED && !isManualPending && !isPaystack && (
              <Button asChild variant="outline" className="border-brand-teal/40 text-brand-umber">
                <Link href={orderId ? `/checkout/payment?orderId=${encodeURIComponent(orderId)}` : "/checkout"}>
                  Complete payment
                </Link>
              </Button>
            )}
            {status === "review" ? (
              <Button asChild variant="outline" className="border-brand-teal/40 text-brand-umber">
                <a href={`https://wa.me/${MANUAL_PAYMENT.whatsappRaw}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp us
                </a>
              </Button>
            ) : null}
            {status === "expired" || status === "failed" || status === "notCompleted" ? (
              <Button asChild variant="ghost" className="text-brand-umber">
                <Link href="/cart">Back to cart</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/collections">Continue shopping</Link>
              </Button>
            )}
            {session?.user && displayOrderNumber && (
              <Button asChild variant="ghost" className="text-brand-umber">
                <Link href={`/profile/orders/${encodeURIComponent(displayOrderNumber)}`}>View order</Link>
              </Button>
            )}
          </div>

          {canRetryPaystack && orderId && status === "pending" ? (
            <div className="flex flex-col items-center gap-2 text-sm text-brand-umber/60">
              <span>Closed the payment page before finishing?</span>
              <RetryPaystackPaymentButton orderId={orderId} label="Resume payment" variant="outline" />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}

function resolveStatus(
  order: { status: OrderStatus; paymentStatus: PaymentStatus } | null,
  reviewReason: string | null,
  urlStatus: string | undefined
): StatusKind {
  if (!order) {
    const allowed: StatusKind[] = ["success", "pending", "failed", "cancelled"]
    return allowed.includes(urlStatus as StatusKind) ? (urlStatus as StatusKind) : "pending"
  }
  if (order.paymentStatus === PaymentStatus.REFUNDED || order.status === OrderStatus.REFUNDED) return "refunded"
  if (order.paymentStatus === PaymentStatus.COMPLETED) return "success"
  if (reviewReason) return "review"
  if (order.status === OrderStatus.EXPIRED) return "expired"
  if (order.status === OrderStatus.CANCELLED) return "cancelled"
  if (order.paymentStatus === PaymentStatus.FAILED) return "failed"
  if (order.paymentStatus === PaymentStatus.CANCELLED) return "cancelled"
  // Customer closed Paystack's page (cancel_action) and nothing was paid.
  if (urlStatus === "cancelled") return "notCompleted"
  return "pending"
}
