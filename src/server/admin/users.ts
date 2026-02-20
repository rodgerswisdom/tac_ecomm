"use server"

import { Prisma, UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"
import { logAdminAction } from "./audit"

/**
 * ================================
 * Types & Constants
 * ================================
 */

type UsersSummaryFilters = {
    search?: string
    page?: number
    pageSize?: number
}

const DEFAULT_PAGE_SIZE = 10

export type ActionResult = { success?: boolean; error?: string }

/**
 * ================================
 * Validation Schemas
 * ================================
 */

// User creation validation
const createUserSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("A valid email is required"),
    role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER),
})

// Role update validation
const roleSchema = z.object({
    userId: z.string().cuid(),
    role: z.nativeEnum(UserRole),
})

/**
 * ================================
 * Queries
 * ================================
 */

// Fetch paginated users summary for admin table
export async function getUsersSummary({
    search,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
}: UsersSummaryFilters = {}) {
    const sanitizedPage = Math.max(page, 1)
    const sanitizedPageSize = Math.min(Math.max(pageSize, 5), 50)

    // Search filter
    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
        }
        : undefined

    try {
        const [usersData, total] = await prisma.$transaction([
            (prisma.user as any).findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (sanitizedPage - 1) * sanitizedPageSize,
                take: sanitizedPageSize,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    updatedAt: true,
                    createdAt: true,
                    lastActiveAt: true,
                    status: true,
                    _count: { select: { orders: true } },
                },
            }),
            prisma.user.count({ where }),
        ])

        const users = usersData as any[]
        const now = new Date()
        const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

        // Derive user status from lastActiveAt
        const formattedUsers = users.map((user) => {
            const isBanned = user.status === "BANNED"
            const isInactive = user.status === "INACTIVE"
            const isActiveByTime = user.lastActiveAt && (now.getTime() - new Date(user.lastActiveAt).getTime() < ACTIVE_THRESHOLD_MS)

            let displayStatus = "Inactive"
            if (isBanned) displayStatus = "Banned"
            else if (isInactive) displayStatus = "Inactive"
            else if (isActiveByTime) displayStatus = "Active"

            return {
                ...user,
                status: displayStatus,
            }
        })

        return {
            users: formattedUsers,
            total,
            page: sanitizedPage,
            pageSize: sanitizedPageSize,
            pageCount: Math.max(Math.ceil(total / sanitizedPageSize), 1),
        }
    } catch (error) {
        console.error("Failed to load users summary", error)

        return {
            users: [],
            total: 0,
            page: 1,
            pageSize: sanitizedPageSize,
            pageCount: 1,
        }
    }
}

export async function getUserDetail(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                updatedAt: true,
                createdAt: true,
                _count: { select: { orders: true } },
                sessions: {
                    orderBy: { expires: "desc" },
                    take: 1,
                    select: { expires: true },
                },
            },
        })

        if (!user) return null

        const now = new Date()
        const ACTIVE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
        const status = user.sessions?.[0]?.expires && user.sessions[0].expires > now
            ? "Active"
            : user.updatedAt && now.getTime() - user.updatedAt.getTime() < ACTIVE_WINDOW_MS
                ? "Active"
                : "Inactive"

        return {
            ...user,
            status,
        }
    } catch (error) {
        console.error("Failed to load user", error)
        return null
    }
}

/**
 * ================================
 * Actions
 * ================================
 */

// Create new user
export async function createUserAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
    await assertAdmin()

    const parsed = createUserSchema.safeParse({
        name: formData.get("name")?.toString(),
        email: formData.get("email")?.toString(),
        role: formData.get("role")?.toString() ?? UserRole.CUSTOMER,
    })

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid user payload" }
    }

    try {
        await prisma.user.create({
            data: parsed.data,
        })
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return { error: "A user with that email already exists" }
        }
        return { error: "Failed to create user" }
    }

    revalidatePath("/admin/users")
    return { success: true }
}

// Update user role
export async function updateUserRoleAction(formData: FormData) {
    await assertAdmin()

    const parsed = roleSchema.safeParse({
        userId: formData.get("userId")?.toString(),
        role: formData.get("role")?.toString(),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid role change request")
    }

    // Promoting to admin is always allowed
    if (parsed.data.role === UserRole.ADMIN) {
        await prisma.user.update({
            where: { id: parsed.data.userId },
            data: { role: parsed.data.role },
        })

        revalidatePath("/admin/users")
        return
    }

    // Prevent removing the last admin
    const adminCount = await prisma.user.count({
        where: { role: UserRole.ADMIN },
    })

    const target = await prisma.user.findUnique({
        where: { id: parsed.data.userId },
    })

    if (!target) {
        throw new Error("User not found")
    }

    if (target.role === UserRole.ADMIN && adminCount <= 1) {
        throw new Error("At least one admin user is required")
    }

    await prisma.user.update({
        where: { id: parsed.data.userId },
        data: { role: parsed.data.role },
    })

    revalidatePath("/admin/users")
}

// Delete user
export async function deleteUserAction(formData: FormData) {
    await assertAdmin()

    const userId = formData.get("id")?.toString()

    if (!userId) {
        throw new Error("User ID is required")
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    })

    if (!user) {
        throw new Error("User not found")
    }

    // Prevent deleting the last admin
    if (user.role === UserRole.ADMIN) {
        const adminCount = await prisma.user.count({
            where: { role: UserRole.ADMIN },
        })

        if (adminCount <= 1) {
            throw new Error("At least one admin must remain")
        }
    }

    await prisma.user.delete({
        where: { id: userId },
    })

    revalidatePath("/admin/users")
}

export async function bulkDeleteUsersAction(ids: string[]) {
    await assertAdmin()
    if (!ids.length) return { error: "No users selected" }

    try {
        // Prevent deleting the last admin is handled per-user in loop or bulk
        // For simplicity in bulk, we'll filter out the current user and any admin if they are the only ones
        const session = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, role: true } })

        const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } })
        const adminsToDelete = session.filter(u => u.role === UserRole.ADMIN)

        if (adminsToDelete.length >= adminCount) {
            return { error: "Cannot delete all admin users" }
        }

        await prisma.user.deleteMany({
            where: { id: { in: ids } }
        })

        for (const id of ids) {
            await logAdminAction("DELETE_USER", "User", id, "Bulk deleted user")
        }

        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        console.error("Bulk delete users failed:", error)
        return { error: "Failed to delete users. Most likely they have active orders." }
    }
}
