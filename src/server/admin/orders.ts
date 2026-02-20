"use server"

import { OrderStatus, PaymentStatus } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"

export type OrderFilters = {
    status?: OrderStatus
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

    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                user: { select: { name: true, email: true } },
                shippingAddress: true,
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
                    product: { select: { name: true, sku: true } },
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

export async function deleteOrderAction(formData: FormData) {
    await assertAdmin()

    const parsed = deleteOrderSchema.safeParse({
        orderId: formData.get("orderId")?.toString(),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid order delete request")
    }

    await prisma.order.delete({ where: { id: parsed.data.orderId } })

    revalidatePath("/admin/orders")
}
