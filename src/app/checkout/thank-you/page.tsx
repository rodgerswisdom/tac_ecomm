import Link from "next/link"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { ClearCartClient } from "./ClearCartClient"
import { PaymentStatusWatcherClient } from "./PaymentStatusWatcherClient"
import { PaymentMethod, PaymentStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

type StatusKind = "success" | "pending" | "cancelled" | "failed"

const statusCopy: Record<StatusKind, { title: string; body: string; tone: "success" | "pending" | "error" }> = {
  success: {
    title: "Payment received",
    body: "Thank you for completing your purchase. Your order is confirmed and our team is preparing it for delivery.",
    tone: "success"
  },
  pending: {
    title: "Payment pending",
    body: "Check your phone to approve the M-Pesa STK push. You will receive an email as soon as payment clears.",
    tone: "pending"
  },
  cancelled: {
    title: "Payment cancelled",
    body: "It looks like the payment was cancelled. You can try again or choose a different payment method.",
    tone: "error"
  },
  failed: {
    title: "Payment failed",
    body: "We could not verify the payment. Please retry or contact support if the issue persists.",
    tone: "error"
  }
}

function resolveStatusFromOrder(
  urlStatus: StatusKind,
  paymentStatus: PaymentStatus | null | undefined,
  paymentMethod: PaymentMethod | null | undefined
): StatusKind {
  if (paymentStatus === PaymentStatus.COMPLETED) {
    return "success"
  }
  if (paymentStatus === PaymentStatus.FAILED) {
    return "failed"
  }
  if (paymentStatus === PaymentStatus.CANCELLED) {
    return "cancelled"
  }
  if (paymentStatus === PaymentStatus.PENDING && paymentMethod === PaymentMethod.TUMA) {
    return "pending"
  }
  return urlStatus
}

type ThankYouPageProps = {
  searchParams: {
    status?: string
    orderId?: string
    orderNumber?: string
    trackingId?: string
    message?: string
  }
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const urlStatus = (searchParams.status as StatusKind | undefined) ?? "pending"
  const orderId = searchParams.orderId
  const trackingId = searchParams.trackingId
  const message = searchParams.message
  const orderNumberParam = searchParams.orderNumber

  let order = null as {
    paymentStatus: PaymentStatus
    paymentMethod: PaymentMethod | null
    orderNumber: string
  } | null

  if (orderId) {
    try {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          paymentStatus: true,
          paymentMethod: true,
          orderNumber: true
        }
      }) as typeof order
    } catch (error) {
      console.error("Failed to read order status on thank-you page:", error)
    }
  }

  if (
    order &&
    order.paymentStatus === PaymentStatus.PENDING &&
    order.paymentMethod === PaymentMethod.TUMA
  ) {
    redirect(`/checkout/payment?orderId=${encodeURIComponent(orderId!)}`)
  }

  const status = order
    ? resolveStatusFromOrder(urlStatus, order.paymentStatus, order.paymentMethod)
    : urlStatus
  const copy = statusCopy[status] ?? statusCopy.pending
  const isPaymentCompleted = status === "success"
  const displayOrderNumber = order?.orderNumber ?? orderNumberParam

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-beige bg-texture-linen">
      <ClearCartClient active={isPaymentCompleted} />
      <PaymentStatusWatcherClient
        enabled={!isPaymentCompleted && status === "pending" && !!orderId}
        orderId={orderId}
        orderNumber={displayOrderNumber}
        trackingId={trackingId}
      />
      <Navbar />
      <section className="nav-clearance section-spacing pb-0">
        <div className="gallery-container flex flex-col items-center gap-10 text-center">
          <p className="caps-spacing text-xs text-brand-teal">Order status</p>
          <h1 className="font-heading text-5xl text-brand-umber md:text-6xl">{copy.title}</h1>
          <p className="max-w-2xl text-base text-brand-umber/70">{message ?? copy.body}</p>
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
          <div className="flex flex-wrap justify-center gap-4">
            {copy.tone === "error" && (
              <Button asChild variant="outline" className="border-brand-teal/40 text-brand-umber">
                <Link href="/checkout">Try again</Link>
              </Button>
            )}
            {copy.tone === "pending" && (
              <Button asChild variant="outline" className="border-brand-teal/40 text-brand-umber">
                <Link href={orderId ? `/checkout/payment?orderId=${encodeURIComponent(orderId)}` : "/checkout"}>
                  Complete payment
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/collections">Continue shopping</Link>
            </Button>
            {orderId && (
              <Button asChild variant="ghost" className="text-brand-umber">
                <Link href={`/orders/${orderId}`}>View order</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
