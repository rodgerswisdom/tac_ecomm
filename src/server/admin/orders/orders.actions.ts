"use server"

import { OrderStatus, PaymentStatus } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "../auth"

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

export async function updateOrderStatusAction(
    _prevState: UpdateOrderStatusFormState,
    formData: FormData,
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
        orderId: formData.get("orderId"),
        status: formData.get("status"),
        paymentStatus: formData.get("paymentStatus"),
        note: formData.get("note"),
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: parsed.error.issues[0]?.message ?? "Invalid order update",
        }
    }

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

    return { status: "success", message: "Order status updated" }
}

export async function deleteOrderAction(formData: FormData) {
    await assertAdmin()

    const orderId = formData.get("orderId")?.toString()
    if (!orderId) throw new Error("Missing orderId")

    await prisma.order.delete({ where: { id: orderId } })
    revalidatePath("/admin/orders")
}
