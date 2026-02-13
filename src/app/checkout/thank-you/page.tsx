import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { ClearCartClient } from "./ClearCartClient"

const statusCopy: Record<string, { title: string; body: string; tone: "success" | "pending" | "error" }> = {
  success: {
    title: "Payment received",
    body: "Thank you for completing your purchase. Your order is confirmed and our team is preparing it for delivery.",
    tone: "success"
  },
  pending: {
    title: "Payment pending",
    body: "We are waiting for Pesapal to confirm your payment. You will receive an email as soon as it clears.",
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

type ThankYouPageProps = {
  searchParams: {
    status?: string
    orderId?: string
    trackingId?: string
    message?: string
  }
}

export default function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const status = searchParams.status ?? "success"
  const copy = statusCopy[status] ?? statusCopy.success

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-beige bg-texture-linen">
      <ClearCartClient active={copy.tone === "success"} />
      <Navbar />
      <section className="section-spacing pb-0">
        <div className="gallery-container flex flex-col items-center gap-10 text-center">
          <p className="caps-spacing text-xs text-brand-teal">Order status</p>
          <h1 className="font-heading text-5xl text-brand-umber md:text-6xl">{copy.title}</h1>
          <p className="max-w-2xl text-base text-brand-umber/70">{searchParams.message ?? copy.body}</p>
          {searchParams.orderId && (
            <div className="rounded-full border border-brand-teal/30 bg-white/90 px-6 py-2 text-sm text-brand-umber/70 shadow">
              Order reference <span className="font-semibold text-brand-umber">{searchParams.orderId}</span>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {copy.tone === "error" && (
              <Button asChild variant="outline" className="border-brand-teal/40 text-brand-umber">
                <Link href="/checkout">Try again</Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/collections">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
