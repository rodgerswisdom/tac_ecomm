"use server"

import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"
import { format } from "date-fns"

/**
 * Utility to escape CSV fields
 */
function escapeCSV(value: any): string {
    if (value === null || value === undefined) return ""
    const stringValue = String(value)
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
}

/**
 * Export Orders to CSV
 */
export async function exportOrdersAction() {
    await assertAdmin()

    const orders = await prisma.order.findMany({
        include: {
            user: { select: { name: true, email: true } },
            shippingAddress: true,
            items: {
                include: {
                    product: { select: { name: true, sku: true } }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    const headers = [
        "Order Number",
        "Date",
        "Customer Name",
        "Customer Email",
        "Status",
        "Payment Status",
        "Total Amout",
        "Currency",
        "Items Count",
        "Shipping City",
        "Shipping Phone"
    ]

    const rows = orders.map(order => [
        order.orderNumber,
        format(order.createdAt, "yyyy-MM-dd HH:mm"),
        order.user?.name ?? "Guest",
        order.user?.email ?? "N/A",
        order.status,
        order.paymentStatus,
        order.total,
        order.currency ?? "KES",
        order.items.length,
        order.shippingAddress?.city ?? "N/A",
        order.shippingAddress?.phone ?? "N/A"
    ])

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n")

    return csvContent
}

/**
 * Export Users to CSV
 */
export async function exportUsersAction() {
    await assertAdmin()

    const users = await prisma.user.findMany({
        include: {
            _count: { select: { orders: true } }
        },
        orderBy: { createdAt: "desc" }
    })

    const headers = [
        "ID",
        "Name",
        "Email",
        "Role",
        "Status",
        "Orders Count",
        "Joined Date",
        "Last Active"
    ]

    const now = new Date()
    const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000

    const rows = users.map(user => {
        const u = user as any
        const isActive = u.lastActiveAt && (now.getTime() - new Date(u.lastActiveAt).getTime() < ACTIVE_THRESHOLD_MS)

        return [
            u.id,
            u.name ?? "N/A",
            u.email,
            u.role,
            u.status === "BANNED" ? "Banned" : isActive ? "Active" : "Inactive",
            u._count.orders,
            format(u.createdAt, "yyyy-MM-dd"),
            u.lastActiveAt ? format(u.lastActiveAt, "yyyy-MM-dd HH:mm") : "Never"
        ]
    })

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n")

    return csvContent
}
