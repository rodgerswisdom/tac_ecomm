import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { OrdersListClient } from "./OrdersListClient"

export const metadata = {
  title: "My Orders | TAC E-commerce",
  description: "View and manage your order history",
}

export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <OrdersListClient />
}

