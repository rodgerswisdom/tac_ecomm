import { PaymentMethod, PaymentStatus } from "@prisma/client"
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

/* ---------------- OVERVIEW ---------------- */

export async function getOverviewMetrics() {
    const DAYS = 30
    const [{ _count: userCount }, { _count: productCount }, statusGroups, recentOrders] =
        await Promise.all([
            prisma.user.aggregate({ _count: { _all: true } }),
            prisma.product.aggregate({ _count: { _all: true } }),
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

    const { start } = dayRange(DAYS)
    const prevStart = new Date(start)
    const prevEnd = new Date(start)

    prevStart.setDate(prevStart.getDate() - DAYS)
    prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1)

    const [
        paymentsLast30,
        paymentsPrev30,
        currentOrdersWindow,
        prevOrdersWindow,
        currentUsersWindow,
        prevUsersWindow,
        currentProductsWindow,
        prevProductsWindow,
    ] = await Promise.all([
        prisma.payment.findMany({
            where: {
                status: PaymentStatus.COMPLETED,
                createdAt: { gte: start },
            },
            select: { amount: true, createdAt: true },
        }),
        prisma.payment.findMany({
            where: {
                status: PaymentStatus.COMPLETED,
                createdAt: { gte: prevStart, lt: prevEnd },
            },
            select: { amount: true },
        }),
        prisma.order.count({
            where: {
                paymentStatus: PaymentStatus.COMPLETED,
                createdAt: { gte: start },
            },
        }),
        prisma.order.count({
            where: {
                paymentStatus: PaymentStatus.COMPLETED,
                createdAt: { gte: prevStart, lt: prevEnd },
            },
        }),
        prisma.user.count({ where: { createdAt: { gte: start } } }),
        prisma.user.count({ where: { createdAt: { gte: prevStart, lt: prevEnd } } }),
        prisma.product.count({ where: { createdAt: { gte: start } } }),
        prisma.product.count({ where: { createdAt: { gte: prevStart, lt: prevEnd } } }),
    ])

    const pctChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
    }

    const paidOrdersTotal = await prisma.order.count({
        where: { paymentStatus: PaymentStatus.COMPLETED },
    })

    const revenueTrendMap = new Map<
        string,
        { date: string; revenue: number; orders: number }
    >()

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

    for (const payment of paymentsLast30) {
        const key = formatDayKey(payment.createdAt)
        const bucket = revenueTrendMap.get(key)
        if (bucket) {
            bucket.revenue += payment.amount
            bucket.orders += 1
        }
    }

    const totalRevenue = paymentsLast30.reduce((sum, p) => sum + p.amount, 0)
    const prevRevenue = paymentsPrev30.reduce((sum, p) => sum + p.amount, 0)

    const revenueGrowth = pctChange(totalRevenue, prevRevenue)
    const orderGrowth = pctChange(currentOrdersWindow, prevOrdersWindow)
    const userGrowth = pctChange(currentUsersWindow, prevUsersWindow)
    const productGrowth = pctChange(currentProductsWindow, prevProductsWindow)

    return {
        totals: {
            users: { value: userCount._all, change: userGrowth },
            products: { value: productCount._all, change: productGrowth },
            orders: { value: paidOrdersTotal, change: orderGrowth },
            revenue: { value: totalRevenue, change: revenueGrowth },
        },
        ordersByStatus: statusGroups.map((g) => ({
            status: g.status,
            count: g._count._all,
        })),
        recentOrders,
        revenueTrend: Array.from(revenueTrendMap.values()),
    }
}

/* ---------------- DETAILED ANALYTICS ---------------- */

export async function getDetailedAnalytics(days?: number, startDate?: Date, endDate?: Date) {
    let start: Date
    let end: Date

    if (startDate && endDate) {
        start = startOfDay(startDate)
        end = endDate
        days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    } else {
        const range = dayRange(days ?? 90)
        start = range.start
        end = range.end
        days = days ?? 90
    }

    // Calculate previous period for comparison
    const prevEnd = new Date(start)
    const prevStart = new Date(start)
    prevStart.setDate(start.getDate() - days)

    const [orders, users, orderStatusGroups, paymentGroups, customerStats, prevOrders, prevUsers] =
        await Promise.all([
            prisma.order.findMany({
                where: {
                    createdAt: { gte: start, lte: end },
                    paymentStatus: PaymentStatus.COMPLETED,
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    category: { select: { name: true } },
                                },
                            },
                        },
                    },
                    payments: {
                        where: { status: PaymentStatus.COMPLETED },
                    },
                },
            }),
            prisma.user.findMany({ where: { createdAt: { gte: start, lte: end } } }),
            prisma.order.groupBy({
                by: ["status"],
                _count: { _all: true },
                where: { createdAt: { gte: start, lte: end } }
            }),
            prisma.payment.groupBy({
                by: ["method"],
                _count: { _all: true },
                where: { status: PaymentStatus.COMPLETED, createdAt: { gte: start, lte: end } },
            }),
            prisma.order.groupBy({
                by: ["userId"],
                _count: { _all: true },
                _sum: { total: true },
                where: { paymentStatus: PaymentStatus.COMPLETED, createdAt: { gte: start, lte: end } },
            }),
            // PREVIOUS PERIOD DATA
            prisma.order.findMany({
                where: {
                    createdAt: { gte: prevStart, lt: prevEnd },
                    paymentStatus: PaymentStatus.COMPLETED,
                },
                include: {
                    payments: { where: { status: PaymentStatus.COMPLETED } }
                }
            }),
            prisma.user.count({ where: { createdAt: { gte: prevStart, lt: prevEnd } } })
        ])

    // ... (rest of the processing logic remains similar but uses these results)
    // I need to actually calculate the comparison values here.

    const currentRevenue = orders.reduce((sum, o) => sum + o.payments.reduce((s, p) => s + p.amount, 0), 0)
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.payments.reduce((s, p) => s + p.amount, 0), 0)

    const currentAOV = orders.length ? currentRevenue / orders.length : 0
    const prevAOV = prevOrders.length ? prevRevenue / prevOrders.length : 0

    const currentUsers = users.length
    const prevUsersCount = typeof prevUsers === 'number' ? prevUsers : 0

    const revenueGrowth = prevRevenue === 0 ? 100 : ((currentRevenue - prevRevenue) / prevRevenue) * 100
    const aovGrowth = prevAOV === 0 ? 100 : ((currentAOV - prevAOV) / prevAOV) * 100
    const userGrowth = prevUsersCount === 0 ? 100 : ((currentUsers - prevUsersCount) / prevUsersCount) * 100
    const orderGrowth = prevOrders.length === 0 ? 100 : ((orders.length - prevOrders.length) / prevOrders.length) * 100

    const revenueTrendMap = new Map<string, { date: string; revenue: number; orders: number }>()

    for (let i = 0; i < days; i++) {
        const day = new Date(start)
        day.setDate(start.getDate() + i)
        revenueTrendMap.set(formatDayKey(day), {
            date: day.toISOString(),
            revenue: 0,
            orders: 0,
        })
    }

    for (const order of orders) {
        const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0)
        const key = formatDayKey(order.createdAt)
        const bucket = revenueTrendMap.get(key)
        if (bucket) {
            bucket.revenue += paidAmount
            bucket.orders += 1
        }
    }

    const productStats = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>()

    for (const order of orders) {
        for (const item of order.items) {
            const key = item.productId
            if (!key) continue
            if (!productStats.has(key)) {
                productStats.set(key, { productId: key, name: item.product?.name ?? "Unknown", quantity: 0, revenue: 0 })
            }
            const stat = productStats.get(key)!
            stat.quantity += item.quantity
            stat.revenue += item.price * item.quantity
        }
    }

    const categoryRevenueMap = new Map<string, number>()
    for (const stat of productStats.values()) {
        const category = orders.flatMap((o) => o.items).find((i) => i.productId === stat.productId)?.product?.category?.name ?? "Uncategorized"
        categoryRevenueMap.set(category, (categoryRevenueMap.get(category) ?? 0) + stat.revenue)
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
            newCustomerTrendMap.set(key, newCustomerTrendMap.get(key)! + 1)
        }
    }

    const topCustomerStats = customerStats
        .sort((a, b) => (b._sum.total ?? 0) - (a._sum.total ?? 0))
        .slice(0, 10)

    const topUserIds = topCustomerStats.map(s => s.userId).filter(Boolean) as string[]
    const usersData = await prisma.user.findMany({
        where: { id: { in: topUserIds } },
        select: { id: true, name: true, email: true, image: true }
    })

    const highValueCustomers = topCustomerStats.map(stat => {
        const user = usersData.find(u => u.id === stat.userId)
        const total = stat._sum.total ?? 0
        return {
            userId: stat.userId,
            name: user?.name ?? "Guest",
            email: user?.email ?? "No email",
            image: user?.image,
            total,
            orderCount: stat._count._all,
            contribution: currentRevenue > 0 ? (total / currentRevenue) * 100 : 0
        }
    })

    const repeatBuyers = customerStats.filter((c) => c._count._all > 1).length

    return {
        revenueTrend: Array.from(revenueTrendMap.values()),
        averageOrderValue: currentAOV,
        revenueTotal: currentRevenue,
        comparisons: {
            revenueGrowth,
            aovGrowth,
            userGrowth,
            orderGrowth,
        },
        topProducts: Array.from(productStats.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
        categoryRevenue: Array.from(categoryRevenueMap.entries()).map(([category, revenue]) => ({ category, revenue })),
        newCustomersTrend: Array.from(newCustomerTrendMap.entries()).map(([date, count]) => ({ date, count })),
        repeatVsFirst: {
            repeat: repeatBuyers,
            firstTime: customerStats.length - repeatBuyers,
        },
        ordersPerCustomer: customerStats.map((c) => ({ userId: c.userId, orders: c._count._all })),
        highValueCustomers,
        orderStatusDistribution: orderStatusGroups.map((g) => ({ status: g.status, count: g._count._all })),
        paymentMethodUsage: paymentGroups.map((g) => ({ method: g.method ?? PaymentMethod.CREDIT_CARD, count: g._count._all })),
    }
}
