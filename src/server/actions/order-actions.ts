"use server"

import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { ActionResult } from "@/lib/admin/action-result"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/server/admin/auth"

const updateStatusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.nativeEnum(OrderStatus),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  note: z.string().max(500).optional().nullable(),
})

export type UpdateOrderStatusFormState = {
  status: "idle" | "success" | "error"
  message?: string
}

const deleteOrderSchema = z.object({
  orderId: z.string().cuid(),
})

export async function updateOrderStatusAction(
  _prevState: UpdateOrderStatusFormState,
  formData: FormData
): Promise<UpdateOrderStatusFormState> {
  try {
    await assertAdmin()
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unauthorized",
    }
  }

  const parsed = updateStatusSchema.safeParse({
    orderId: formData.get("orderId")?.toString(),
    status: formData.get("status")?.toString(),
    paymentStatus: formData.get("paymentStatus")?.toString(),
    note: formData.get("note")?.toString(),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid order update",
    }
  }

  try {
    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: {
        status: parsed.data.status,
        paymentStatus: parsed.data.paymentStatus,
        notes: parsed.data.note ?? undefined,
      },
    })

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${parsed.data.orderId}`)

    return {
      status: "success",
      message: "Order status updated",
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to update order",
    }
  }
}

export async function deleteOrderAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const parsed = deleteOrderSchema.safeParse({
    orderId: formData.get("orderId")?.toString(),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order delete request" }
  }

  try {
    await prisma.order.delete({ where: { id: parsed.data.orderId } })
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { error: "Order not found or already deleted" }
      }
      if (error.code === "P2003") {
        return { error: "Cannot delete this order because it is linked to other records." }
      }
    }
    console.error(error)
    return { error: "Failed to delete order" }
  }
}
