import { auth } from "./auth"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

/**
 * Get the current server session
 * Use this in server components and API routes
 * For NextAuth v5, use the auth() function
 */
export async function getCurrentSession() {
  return await auth()
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user || null
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("ADMIN")
}

/**
 * Require authentication - redirects to signin if not authenticated
 * Use in server components that require authentication
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  return user
}

/**
 * Require admin role - redirects to signin if not admin
 * Use in server components that require admin access
 */
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  if (user.role !== "ADMIN") {
    redirect("/")
  }
  return user
}
