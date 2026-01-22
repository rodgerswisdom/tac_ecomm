import { redirect } from "next/navigation"
import { auth } from "@/app/api/auth/[...nextauth]/route"

export async function requireAdmin() {
    const session = await auth()

    if (!session || session.user?.role !== "ADMIN") {
        redirect("/auth/signin")
    }

    return session
}

export async function assertAdmin() {
    const session = await auth()

    if (!session || session.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    return session
}
