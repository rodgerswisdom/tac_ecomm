import { PaymentMethod } from "@prisma/client"
import { prisma } from "@/lib/prisma"

function startOfDay(date: Date) {
    const copy = new Date(date)
    copy.setHours(0, 0, 0, 0)
    return copy
}

function formatDayKey(date: Date) {
    return startOfDay(date).toISOString()
}

function dayRange(days: number) {
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)
    return { start, end: now }
}

export async function getOverviewMetrics() {
    const [{ _count: userCount }, { _count: productCount }, orderAgg, statusGroups, recentOrders] = await Promise.all([
        prisma.user.aggregate({ _count: { _all: true } }),
        prisma.product.aggregate({ _count: { _all: true } }),
        prisma.order.aggregate({
            _count: { _all: true },
            _sum: { total: true },
        }),
        prisma.order.groupBy({
            by: ["status"],
            _count: { _all: true },
        }),
        prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                user: { select: { name: true, email: true } },
            },
        }),
    ])

    const { start } = dayRange(30)
    const ordersLast30 = await prisma.order.findMany({
        where: { createdAt: { gte: start } },
        select: { id: true, total: true, createdAt: true },
    })

    const revenueTrendMap = new Map<string, { date: string; revenue: number; orders: number }>()

    for (let i = 0; i < 30; i++) {
        const day = new Date(start)
        day.setDate(start.getDate() + i)
        const key = formatDayKey(day)
        revenueTrendMap.set(key, {
            date: day.toISOString(),
            revenue: 0,
            orders: 0,
        })
    }

    for (const order of ordersLast30) {
        const key = formatDayKey(order.createdAt)
        const current = revenueTrendMap.get(key)
        if (current) {
            current.revenue += order.total
            current.orders += 1
        }
    }

    return {
        totals: {
            users: userCount._all,
            products: productCount._all,
            orders: orderAgg._count._all,
            revenue: orderAgg._sum.total ?? 0,
        },
        ordersByStatus: statusGroups.map((group) => ({ status: group.status, count: group._count._all })),
        recentOrders,
        revenueTrend: Array.from(revenueTrendMap.values()),
    }
}

export async function getDetailedAnalytics(days: number = 90) {
    const { start } = dayRange(days)

    const [orders, users, orderStatusGroups, paymentGroups, customerStats] = await Promise.all([
        prisma.order.findMany({
            where: { createdAt: { gte: start } },
            include: {
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, categoryId: true, category: { select: { name: true } } },
                        },
                    },
                },
                payments: true,
            },
        }),
        prisma.user.findMany({ where: { createdAt: { gte: start } } }),
        prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.payment.groupBy({ by: ["method"], _count: { _all: true } }),
        prisma.order.groupBy({ by: ["userId"], _count: { _all: true }, _sum: { total: true } }),
    ])

    const revenueTrendMap = new Map<string, { date: string; revenue: number; orders: number }>()
    const now = new Date()
    for (let i = 0; i < days; i++) {
        const day = new Date(start)
        day.setDate(start.getDate() + i)
        const key = formatDayKey(day)
        revenueTrendMap.set(key, { date: day.toISOString(), revenue: 0, orders: 0 })
    }

    let revenueTotal = 0
    for (const order of orders) {
        revenueTotal += order.total
        const key = formatDayKey(order.createdAt)
        const bucket = revenueTrendMap.get(key)
        if (bucket) {
            bucket.revenue += order.total
            bucket.orders += 1
        }
    }

    const orderCount = orders.length
    const averageOrderValue = orderCount ? revenueTotal / orderCount : 0

    const productStats = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>()
    for (const order of orders) {
        for (const item of order.items) {
            const key = item.productId
            if (!key) continue
            if (!productStats.has(key)) {
                productStats.set(key, {
                    productId: key,
                    name: item.product?.name ?? "Unknown product",
                    quantity: 0,
                    revenue: 0,
                })
            }
            const stats = productStats.get(key)!
            stats.quantity += item.quantity
            stats.revenue += item.price * item.quantity
        }
    }

    const topProducts = Array.from(productStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

    const categoryRevenueMap = new Map<string, { category: string; revenue: number }>()
    for (const order of orders) {
        for (const item of order.items) {
            const categoryName = item.product?.category?.name ?? "Uncategorized"
            if (!categoryRevenueMap.has(categoryName)) {
                categoryRevenueMap.set(categoryName, { category: categoryName, revenue: 0 })
            }
            const entry = categoryRevenueMap.get(categoryName)!
            entry.revenue += item.price * item.quantity
        }
    }

    const newCustomerTrendMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
        const day = new Date(start)
        day.setDate(start.getDate() + i)
        newCustomerTrendMap.set(formatDayKey(day), 0)
    }
    for (const user of users) {
        const key = formatDayKey(user.createdAt)
        if (newCustomerTrendMap.has(key)) {
            newCustomerTrendMap.set(key, (newCustomerTrendMap.get(key) ?? 0) + 1)
        }
    }

    const repeatBuyers = customerStats.filter((entry) => entry._count._all > 1).length
    const ordersPerCustomer = customerStats.map((entry) => ({
        userId: entry.userId,
        orders: entry._count._all,
    }))
    const highValueCustomers = customerStats
        .filter((entry) => (entry._sum.total ?? 0) >= 2000)
        .map((entry) => ({ userId: entry.userId, total: entry._sum.total ?? 0 }))

    const cartAbandonment = await prisma.cartItem.count({
        where: {
            updatedAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
    })

    return {
        revenueTrend: Array.from(revenueTrendMap.values()),
        averageOrderValue,
        topProducts,
        categoryRevenue: Array.from(categoryRevenueMap.values()),
        newCustomersTrend: Array.from(newCustomerTrendMap.entries()).map(([date, count]) => ({
            date,
            count,
        })),
        repeatVsFirst: {
            repeat: repeatBuyers,
            firstTime: customerStats.length - repeatBuyers,
        },
        ordersPerCustomer,
        highValueCustomers,
        orderStatusDistribution: orderStatusGroups.map((group) => ({
            status: group.status,
            count: group._count._all,
        })),
        paymentMethodUsage: paymentGroups.map((group) => ({
            method: group.method ?? PaymentMethod.CREDIT_CARD,
            count: group._count._all,
        })),
        cartAbandonment,
    }
}
