'use server'

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function requireAdmin() {
    const session = await auth()

    if (!session || session.user?.role !== "ADMIN") {
        const headersList = await headers()
        const pathname = headersList.get("x-pathname") ?? "/admin"
        const signInUrl = `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`
        redirect(signInUrl)
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
