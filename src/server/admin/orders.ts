"use server"

import { Prisma, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"
import { reconcilePaystackOrder, syncPaystackRefundsForOrder } from "@/lib/paystack"
import { InsufficientStockError, releaseOrderStock, takeOrderStock } from "@/lib/stock"
import { scheduleBackInStockNotifications } from "@/lib/stock-notify"
import { confirmManualPayment, rejectManualPayment } from "@/lib/manual-payment-server"

/** Order statuses where the items have been taken out of stock. */
const STOCK_TAKEN_STATUSES = new Set<OrderStatus>([
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
])
/** Statuses that back an order out — stock goes back unless it already shipped. */
const STOCK_RETURNED_STATUSES = new Set<OrderStatus>([
    OrderStatus.PENDING,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
    OrderStatus.EXPIRED,
])
import type { ActionResult } from "@/lib/admin/action-result"

export type OrderFilters = {
    status?: OrderStatus
    /** M-Pesa Paybill orders whose code is waiting for staff to check the bank statement. */
    awaitingVerification?: boolean
    search?: string
    page?: number
    pageSize?: number
}

export async function getOrders(filters: OrderFilters = {}) {
    const page = Math.max(filters.page ?? 1, 1)
    const pageSize = Math.min(filters.pageSize ?? 20, 50)

    const whereFilters: Prisma.OrderWhereInput[] = []

    if (filters.status) {
        whereFilters.push({ status: filters.status })
    }

    if (filters.awaitingVerification) {
        whereFilters.push({
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            status: OrderStatus.PENDING,
            payments: { some: { method: PaymentMethod.BANK_TRANSFER, status: PaymentStatus.PENDING } },
        })
    }

    if (filters.search) {
        whereFilters.push({
            OR: [
                { orderNumber: { contains: filters.search, mode: "insensitive" } },
                { user: { name: { contains: filters.search, mode: "insensitive" } } },
                { user: { email: { contains: filters.search, mode: "insensitive" } } },
            ],
        })
    }

    const where: Prisma.OrderWhereInput | undefined = whereFilters.length ? { AND: whereFilters } : undefined

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                user: { select: { name: true, email: true } },
                shippingAddress: true,
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                sku: true,
                                images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
                            },
                        },
                        productImage: { select: { url: true, alt: true, order: true } },
                    },
                },
                payments: { take: 1, orderBy: { createdAt: "desc" } },
                _count: { select: { items: true } },
            },
        }),
        prisma.order.count({ where }),
    ])

    return {
        orders,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
    }
}

export async function getOrderDetail(orderId: string) {
    const identifier = orderId?.trim()
    if (!identifier) return null

    return prisma.order.findFirst({
        where: {
            OR: [
                { id: identifier },
                { orderNumber: identifier },
            ],
        },
        include: {
            user: true,
            shippingAddress: true,
            items: {
                include: {
                    product: {
                        select: {
                            name: true,
                            sku: true,
                            images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
                        },
                    },
                    productImage: { select: { url: true, alt: true, order: true } },
                },
            },
            payments: { orderBy: { createdAt: "desc" } },
        },
    })
}

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
        const { orderId, status: nextStatus } = parsed.data
        const current = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } })
        if (!current) {
            return { status: "error", message: "Order not found" }
        }

        const shipped = current.status === OrderStatus.SHIPPED || current.status === OrderStatus.DELIVERED
        let restockedProductIds: string[] = []
        let stockMessage = ""

        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: nextStatus,
                    paymentStatus: parsed.data.paymentStatus,
                    notes: parsed.data.note ?? undefined,
                },
            })

            // Keep stock in step with the order: taken once it's confirmed, returned if it
            // is backed out before shipping (Order.stockReserved makes both idempotent).
            if (STOCK_TAKEN_STATUSES.has(nextStatus)) {
                if (await takeOrderStock(orderId, tx)) stockMessage = " Stock updated."
            } else if (STOCK_RETURNED_STATUSES.has(nextStatus)) {
                if (shipped) {
                    stockMessage = " Stock was not returned because the order had shipped — if items came back, adjust stock in Products."
                } else {
                    restockedProductIds = await releaseOrderStock(orderId, tx)
                    if (restockedProductIds.length > 0) stockMessage = " Stock returned."
                }
            }
        })

        if (restockedProductIds.length > 0) scheduleBackInStockNotifications(restockedProductIds)

        revalidatePath("/admin/orders")
        revalidatePath(`/admin/orders/${orderId}`)

        return {
            status: "success",
            message: `Order status updated.${stockMessage}`,
        }
    } catch (error) {
        if (error instanceof InsufficientStockError) {
            return {
                status: "error",
                message: "Not enough stock to confirm this order. Restock the items (or refund the customer) first.",
            }
        }
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

/** Ask Paystack for the latest status of every payment attempt, and any refunds, on an order. */
export async function recheckPaystackPaymentAction(formData: FormData): Promise<void> {
    await assertAdmin()
    const orderId = formData.get("orderId")?.toString()
    if (!orderId) return

    await reconcilePaystackOrder({ id: orderId }, { force: true })
    await syncPaystackRefundsForOrder(orderId)

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
}

export type ManualPaymentReviewState = UpdateOrderStatusFormState

const manualPaymentReviewSchema = z.object({
    orderId: z.string().cuid(),
    paymentId: z.string().cuid(),
    decision: z.enum(["confirm", "reject"]),
    reason: z.string().trim().max(300).optional(),
})

/** Staff confirm or reject an M-Pesa Paybill payment after checking the bank statement. */
export async function reviewManualPaymentAction(
    _prevState: ManualPaymentReviewState,
    formData: FormData,
): Promise<ManualPaymentReviewState> {
    let adminEmail: string
    try {
        const session = await assertAdmin()
        adminEmail = session.user?.email ?? "admin"
    } catch {
        return { status: "error", message: "Unauthorized" }
    }

    const parsed = manualPaymentReviewSchema.safeParse({
        orderId: formData.get("orderId")?.toString(),
        paymentId: formData.get("paymentId")?.toString(),
        decision: formData.get("decision")?.toString(),
        reason: formData.get("reason")?.toString() || undefined,
    })
    if (!parsed.success) {
        return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid request" }
    }

    const { orderId, paymentId, decision, reason } = parsed.data
    try {
        const result =
            decision === "confirm"
                ? await confirmManualPayment(orderId, paymentId, adminEmail)
                : await rejectManualPayment(orderId, paymentId, reason ?? "", adminEmail)
        if (!result.ok) return { status: "error", message: result.error }

        revalidatePath("/admin/orders")
        revalidatePath(`/admin/orders/${orderId}`)
        return { status: "success", message: result.message }
    } catch (error) {
        console.error("[admin] manual payment review failed:", error)
        return { status: "error", message: "Could not update the payment. Please try again." }
    }
}
