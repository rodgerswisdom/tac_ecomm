import Link from "next/link"
import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { XCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Your payment was cancelled. You can return to checkout to try again.",
}

export default function PaymentCancelledPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const orderId = typeof searchParams.orderId === "string" ? searchParams.orderId : undefined
  const orderNumber = typeof searchParams.orderNumber === "string" ? searchParams.orderNumber : undefined

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <XCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
          <div>
            <CardTitle>Payment cancelled</CardTitle>
            <p className="text-sm text-muted-foreground">Your payment was not completed.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Cancelled</AlertTitle>
            <AlertDescription>
              You closed the payment window or the payment was cancelled by the provider. No charges were made.
            </AlertDescription>
          </Alert>

          {orderNumber ? (
            <p className="text-sm text-muted-foreground">Order reference: <span className="font-medium text-foreground">{orderNumber}</span></p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/checkout">Return to checkout</Link>
            </Button>
            {orderId ? (
              <Button asChild variant="outline">
                <Link href={`/orders/${orderId}`}>View order</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
