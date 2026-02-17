import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { UserRole } from "@prisma/client"

/**
 * Edge-compatible NextAuth configuration.
 * Excludes database adapters and libraries that require Node.js (like bcrypt).
 */
export const authConfig = {
    providers: [
        // We provide an empty authorize here because it will be overridden in the main auth.ts
        // or we just define the providers for the middleware's sake.
        CredentialsProvider({
            authorize: () => null
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isAdminRoute = nextUrl.pathname.startsWith('/admin')
            const role = auth?.user?.role

            if (isAdminRoute) {
                if (isLoggedIn && role === "ADMIN") return true
                return false // Redirect to login
            }
            return true
        },
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as UserRole
            }
            return session
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    },
    debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig
