"use server"

import { OrderStatus, PaymentStatus } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "../auth"
import { createEmailService } from "@/lib/email"

// ─────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────

const updateStatusSchema = z.object({
    orderId: z.string().cuid(),
    status: z.nativeEnum(OrderStatus),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    trackingNumber: z.string().max(120).optional().nullable(),
    estimatedDelivery: z.string().max(100).optional().nullable(),
    note: z.string().max(500).optional().nullable(),
})

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type UpdateOrderStatusFormState = {
    status: "idle" | "success" | "error"
    message?: string
}

// ─────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────

export async function updateOrderStatusAction(
    _prevState: UpdateOrderStatusFormState,
    formData: FormData,
): Promise<UpdateOrderStatusFormState> {
    // Auth guard
    try {
        await assertAdmin()
    } catch (error) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Unauthorized",
        }
    }

    // Validate input
    const parsed = updateStatusSchema.safeParse({
        orderId: formData.get("orderId"),
        status: formData.get("status"),
        paymentStatus: formData.get("paymentStatus"),
        trackingNumber: formData.get("trackingNumber") || null,
        estimatedDelivery: formData.get("estimatedDelivery") || null,
        note: formData.get("note"),
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: parsed.error.issues[0]?.message ?? "Invalid order update",
        }
    }

    const { orderId, status, paymentStatus, trackingNumber, estimatedDelivery, note } = parsed.data

    // Fetch current order state BEFORE update (to detect status transitions)
    const previousOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
    })

    if (!previousOrder) {
        return { status: "error", message: "Order not found" }
    }

    // Persist the update
    await prisma.order.update({
        where: { id: orderId },
        data: {
            status,
            paymentStatus: paymentStatus ?? undefined,
            trackingNumber: trackingNumber ?? undefined,
            notes: note ?? undefined,
        },
    })

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)

    // ── Trigger email notifications on status transitions ──────────────────────

    const statusChanged = previousOrder.status !== status
    const nowShipped = statusChanged && status === OrderStatus.SHIPPED
    const nowDelivered = statusChanged && status === OrderStatus.DELIVERED

    if (nowShipped || nowDelivered) {
        // Fetch full order details needed for email templates
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { name: true, email: true } },
                shippingAddress: true,
                items: {
                    include: {
                        product: { select: { name: true } },
                    },
                },
            },
        })

        if (order && order.user?.email) {
            const customerName =
                [order.shippingAddress?.firstName, order.shippingAddress?.lastName]
                    .filter(Boolean)
                    .join(" ") ||
                order.user?.name ||
                "Valued Customer"

            const emailData = {
                customerName,
                customerEmail: order.user.email,
                orderNumber: order.orderNumber,
                orderDate: order.createdAt.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
                items: order.items.map((item) => ({
                    name: item.product?.name ?? "Product",
                    quantity: item.quantity,
                    price: item.price,
                })),
                subtotal: order.subtotal,
                tax: order.tax,
                shipping: order.shipping,
                total: order.total,
                currency: order.currency ?? "USD",
                shippingAddress: {
                    name: customerName,
                    address: order.shippingAddress?.address1 ?? "",
                    city: order.shippingAddress?.city ?? "",
                    state: order.shippingAddress?.state ?? "",
                    zipCode: order.shippingAddress?.postalCode ?? "",
                    country: order.shippingAddress?.country ?? "",
                },
                trackingNumber: order.trackingNumber ?? undefined,
                estimatedDelivery: estimatedDelivery ?? undefined,
            }

            const emailService = createEmailService()

            if (nowShipped) {
                void emailService
                    .sendOrderShipped(emailData)
                    .catch((err) => console.error("[email] order shipped failed:", err))
            }

            if (nowDelivered) {
                void emailService
                    .sendOrderDelivered(emailData)
                    .catch((err) => console.error("[email] order delivered failed:", err))
            }
        }
    }

    const statusLabel = status.replace(/_/g, " ").toLowerCase()
    return {
        status: "success",
        message: `Order updated to ${statusLabel}${nowShipped ? " — shipment email sent" : nowDelivered ? " — delivery email sent" : ""}`,
    }
}

export async function deleteOrderAction(formData: FormData) {
    await assertAdmin()

    const orderId = formData.get("orderId")?.toString()
    if (!orderId) throw new Error("Missing orderId")

    await prisma.order.delete({ where: { id: orderId } })
    revalidatePath("/admin/orders")
}
