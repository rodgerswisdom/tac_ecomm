import { UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"

export async function getUsersSummary() {
    const [users, spend] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { orders: true } },
            },
        }),
        prisma.order.groupBy({
            by: ["userId"],
            _sum: { total: true },
        }),
    ])

    const spendByUser = new Map(spend.map((item) => [item.userId, item._sum.total ?? 0]))

    return users.map((user) => ({
        ...user,
        totalSpent: spendByUser.get(user.id) ?? 0,
    }))
}

const roleSchema = z.object({
    userId: z.string().cuid(),
    role: z.nativeEnum(UserRole),
})

export async function updateUserRoleAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const parsed = roleSchema.safeParse({
        userId: formData.get("userId")?.toString(),
        role: formData.get("role")?.toString(),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid role change request")
    }

    if (parsed.data.role === UserRole.ADMIN) {
        await prisma.user.update({
            where: { id: parsed.data.userId },
            data: { role: parsed.data.role },
        })
        revalidatePath("/admin/users")
        return
    }

    const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } })
    const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } })

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
