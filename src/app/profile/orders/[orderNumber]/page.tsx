import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getOrderByNumber } from "@/server/actions/dashboard-actions"
import { OrderDetailClient } from "./OrderDetailClient"

export const metadata = {
  title: "Order Details | TAC E-commerce",
  description: "View your order details and tracking information",
}

interface OrderDetailPageProps {
  params: {
    orderNumber: string
  }
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const order = await getOrderByNumber(params.orderNumber)

  if (!order) {
    notFound()
  }

  return <OrderDetailClient order={order} />
}

// Made with Bob
