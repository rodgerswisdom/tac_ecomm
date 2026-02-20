import { PaymentMethod, PaymentStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { convertToUsd } from "@/lib/currency"
import type { CurrencyCode } from "@/lib/currency"

const PAYMENT_CURRENCY_TO_CODE: Record<string, CurrencyCode> = {
    USD: "USD",
    KES: "KSH",
    KSH: "KSH",
    EUR: "EUR",
}

/** Default currency for payments with missing or wrong currency (e.g. legacy KES stored as USD). */
const DEFAULT_PAYMENT_CURRENCY = (process.env.DEFAULT_CURRENCY || "USD").toUpperCase()
const STORE_IS_KES = DEFAULT_PAYMENT_CURRENCY === "KES" || DEFAULT_PAYMENT_CURRENCY === "KSH"

/**
 * Convert payment amount to USD for revenue. When store default is KES, payments stored as "USD"
 * are often legacy mistakes (amount was actually KES). Amounts in [1, 2000) are treated as KES.
 */
function paymentAmountToUsd(amount: number, currency: string | null): number {
    const raw = (currency || "").trim().toUpperCase()
    let code = raw ? PAYMENT_CURRENCY_TO_CODE[raw] : undefined
    if (!code && STORE_IS_KES) code = "KSH"
    if (!code) code = DEFAULT_PAYMENT_CURRENCY === "EUR" ? "EUR" : "USD"
    if (code === "USD" && STORE_IS_KES && amount >= 1 && amount < 2000) {
        return convertToUsd(amount, "KSH")
    }
    return code !== "USD" ? convertToUsd(amount, code) : amount
}

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

    const { start } = dayRange(30)

    const paymentsLast30 = await prisma.payment.findMany({
        where: {
            status: PaymentStatus.COMPLETED,
            createdAt: { gte: start },
        },
        select: {
            amount: true,
            currency: true,
            createdAt: true,
        },
    })

    const paidOrdersCount = await prisma.order.count({
        where: {
            paymentStatus: PaymentStatus.COMPLETED,
        },
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
        const amountUsd = paymentAmountToUsd(payment.amount, payment.currency)
        if (bucket) {
            bucket.revenue += amountUsd
            bucket.orders += 1
        }
    }

    const totalRevenue = paymentsLast30.reduce(
        (sum, p) => sum + paymentAmountToUsd(p.amount, p.currency),
        0
    )

    return {
        totals: {
            users: userCount._all,
            products: productCount._all,
            orders: paidOrdersCount,
            revenue: totalRevenue,
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

export async function getDetailedAnalytics(days = 90) {
    const { start } = dayRange(days)

    const [orders, users, orderStatusGroups, paymentGroups, customerStats] =
        await Promise.all([
            prisma.order.findMany({
                where: {
                    createdAt: { gte: start },
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
            prisma.user.findMany({ where: { createdAt: { gte: start } } }),
            prisma.order.groupBy({
                by: ["status"],
                _count: { _all: true },
            }),
            prisma.payment.groupBy({
                by: ["method"],
                _count: { _all: true },
                where: { status: PaymentStatus.COMPLETED },
            }),
            prisma.order.groupBy({
                by: ["userId"],
                _count: { _all: true },
                _sum: { total: true },
                where: { paymentStatus: PaymentStatus.COMPLETED },
            }),
        ])

    const revenueTrendMap = new Map<
        string,
        { date: string; revenue: number; orders: number }
    >()

    for (let i = 0; i < days; i++) {
        const day = new Date(start)
        day.setDate(start.getDate() + i)
        revenueTrendMap.set(formatDayKey(day), {
            date: day.toISOString(),
            revenue: 0,
            orders: 0,
        })
    }

    let revenueTotal = 0

    for (const order of orders) {
        const paidAmountUsd = order.payments.reduce(
            (sum, p) => sum + paymentAmountToUsd(p.amount, p.currency),
            0
        )

        revenueTotal += paidAmountUsd

        const key = formatDayKey(order.createdAt)
        const bucket = revenueTrendMap.get(key)
        if (bucket) {
            bucket.revenue += paidAmountUsd
            bucket.orders += 1
        }
    }

    const averageOrderValue = orders.length
        ? revenueTotal / orders.length
        : 0

    const productStats = new Map<
        string,
        { productId: string; name: string; quantity: number; revenue: number }
    >()

    for (const order of orders) {
        for (const item of order.items) {
            const key = item.productId
            if (!key) continue

            if (!productStats.has(key)) {
                productStats.set(key, {
                    productId: key,
                    name: item.product?.name ?? "Unknown",
                    quantity: 0,
                    revenue: 0,
                })
            }

            const stat = productStats.get(key)!
            stat.quantity += item.quantity
            stat.revenue += item.price * item.quantity
        }
    }

    const categoryRevenueMap = new Map<string, number>()
    for (const stat of productStats.values()) {
        const category =
            orders
                .flatMap((o) => o.items)
                .find((i) => i.productId === stat.productId)
                ?.product?.category?.name ?? "Uncategorized"

        categoryRevenueMap.set(
            category,
            (categoryRevenueMap.get(category) ?? 0) + stat.revenue
        )
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

    const repeatBuyers = customerStats.filter(
        (c) => c._count._all > 1
    ).length

    return {
        revenueTrend: Array.from(revenueTrendMap.values()),
        averageOrderValue,
        topProducts: Array.from(productStats.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5),
        categoryRevenue: Array.from(categoryRevenueMap.entries()).map(
            ([category, revenue]) => ({ category, revenue })
        ),
        newCustomersTrend: Array.from(newCustomerTrendMap.entries()).map(
            ([date, count]) => ({ date, count })
        ),
        repeatVsFirst: {
            repeat: repeatBuyers,
            firstTime: customerStats.length - repeatBuyers,
        },
        ordersPerCustomer: customerStats.map((c) => ({
            userId: c.userId,
            orders: c._count._all,
        })),
        highValueCustomers: customerStats
            .filter((c) => (c._sum.total ?? 0) >= 2000)
            .map((c) => ({
                userId: c.userId,
                total: c._sum.total ?? 0,
            })),
        orderStatusDistribution: orderStatusGroups.map((g) => ({
            status: g.status,
            count: g._count._all,
        })),
        paymentMethodUsage: paymentGroups.map((g) => ({
            method: g.method ?? PaymentMethod.CREDIT_CARD,
            count: g._count._all,
        })),
    }
}
