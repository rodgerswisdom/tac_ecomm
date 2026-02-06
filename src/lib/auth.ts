import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"
import type { NextAuthConfig } from "next-auth"
import { UserRole } from "@prisma/client"

const providers: NextAuthConfig["providers"] = [
  CredentialsProvider({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.email || !credentials?.password) {
          return null // Return null instead of throwing for better error handling
        }

        const email = (credentials.email as string).trim().toLowerCase()
        
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          // Don't reveal if user exists or not (security best practice)
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
]

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }) as any
  )
}

// Only add Email provider if email server is configured
if (process.env.RESEND_API_KEY || process.env.EMAIL_SERVER_PASSWORD) {
  providers.push(
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "smtp.resend.com",
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER || "resend",
          pass: process.env.EMAIL_SERVER_PASSWORD || process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM || "noreply@tacaccessories.com",
    }) as any
  )
}

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const role = (user as { role?: UserRole }).role
        if (role) {
          token.role = role
        } else {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          })
          token.role = dbUser?.role ?? ("CUSTOMER" as UserRole)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

// Export auth function for NextAuth v5
import NextAuth from "next-auth"
export const { auth, signIn, signOut } = NextAuth(authOptions)
