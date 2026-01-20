import { OrderStatus, PaymentStatus } from "@prisma/client"
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

    const whereFilters = [
        filters.status ? { status: filters.status } : undefined,
        filters.search
            ? {
                OR: [
                    { orderNumber: { contains: filters.search, mode: "insensitive" } },
                    { user: { name: { contains: filters.search, mode: "insensitive" } } },
                    { user: { email: { contains: filters.search, mode: "insensitive" } } },
                ],
            }
            : undefined,
    ].filter(Boolean)

    const where = whereFilters.length ? { AND: whereFilters } : undefined

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
    return prisma.order.findUnique({
        where: { id: orderId },
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

export async function updateOrderStatusAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const parsed = updateStatusSchema.safeParse({
        orderId: formData.get("orderId")?.toString(),
        status: formData.get("status")?.toString(),
        paymentStatus: formData.get("paymentStatus")?.toString(),
        note: formData.get("note")?.toString(),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? "Invalid order update")
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
}
