import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"
import type { NextAuthConfig } from "next-auth"
import { authConfig } from "./auth.config"

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
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const email = (credentials.email as string).trim().toLowerCase()

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user || !user.passwordHash) {
            return null
          }

          const isValid = await compare(credentials.password as string, user.passwordHash)

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
}

// Export auth function for NextAuth v5
import NextAuth from "next-auth"
export const { auth, signIn, signOut, handlers } = NextAuth(authOptions)
