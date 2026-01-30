import { OrderStatus } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

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

    if (filters.status) whereFilters.push({ status: filters.status })

    if (filters.search) {
        whereFilters.push({
            OR: [
                { orderNumber: { contains: filters.search, mode: "insensitive" } },
                { user: { name: { contains: filters.search, mode: "insensitive" } } },
                { user: { email: { contains: filters.search, mode: "insensitive" } } },
            ],
        })
    }

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
