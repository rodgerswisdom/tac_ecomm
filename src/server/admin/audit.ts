import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export type AuditAction =
    | "CREATE_PRODUCT" | "UPDATE_PRODUCT" | "DELETE_PRODUCT" | "ARCHIVE_PRODUCT" | "DUPLICATE_PRODUCT"
    | "CREATE_CATEGORY" | "UPDATE_CATEGORY" | "DELETE_CATEGORY"
    | "CREATE_ARTISAN" | "UPDATE_ARTISAN" | "DELETE_ARTISAN"
    | "UPDATE_ORDER_STATUS" | "DELETE_ORDER"
    | "UPDATE_USER_ROLE" | "DELETE_USER"
    | "CREATE_COUPON" | "UPDATE_COUPON" | "DELETE_COUPON" | "TOGGLE_COUPON"

export async function logAdminAction(
    action: AuditAction,
    entity: string,
    entityId: string,
    details?: string
) {
    try {
        const session = await auth()
        if (!session?.user?.id) return

        // Use type assertion because Prisma client might be stale in this environment
        await (prisma as any).auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details,
                adminId: session.user.id,
                adminName: session.user.name || session.user.email || "Admin",
            },
        })
    } catch (error) {
        console.error("Failed to log admin action:", error)
    }
}
