import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import type { NextAuthConfig } from "next-auth"
import { authConfig } from "./auth.config"
import { verifyMfaToken } from "./mfa-token"

export const authOptions: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    ...authConfig.providers.filter(p => (p as any).id !== 'credentials'),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mfaToken: { label: "MFA Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          const mfaToken = credentials?.mfaToken as string | undefined
          if (mfaToken) {
            const payload = verifyMfaToken(mfaToken)
            if (!payload?.sub) return null
            const user = await prisma.user.findUnique({
              where: { id: payload.sub },
            })
            if (!user) return null
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }
          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      // Basic token population
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }

      // Refresh lastActiveAt (throttled)
      if (token.id && (trigger === "signIn" || trigger === "update" || !token.lastRefreshed || Date.now() - (token.lastRefreshed as number) > 60000)) {
        try {
          await (prisma.user as any).update({
            where: { id: token.id as string },
            data: { lastActiveAt: new Date() }
          })
          token.lastRefreshed = Date.now()
        } catch (e) {
          console.error("Failed to update lastActiveAt:", e)
        }
      }

      return token
    }
  }
}

// Export auth function for NextAuth v5
import NextAuth from "next-auth"
export const { auth, signIn, signOut, handlers } = NextAuth(authOptions)
