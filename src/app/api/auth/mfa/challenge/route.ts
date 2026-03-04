import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { EmailService, getEmailConfig } from "@/lib/email"
import { signMfaToken } from "@/lib/mfa-token"

const OTP_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_OTP_PER_EMAIL_PER_WINDOW = 5

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body?.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const isValid = await compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Admin users skip MFA: return mfaToken immediately so they are not sent an OTP
    if (user.role === UserRole.ADMIN) {
      try {
        const mfaToken = signMfaToken(user.id)
        return NextResponse.json({ mfaToken })
      } catch (err) {
        console.error("MFA token sign error (admin):", err)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
      }
    }

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
    const recentCount = await prisma.mfaChallenge.count({
      where: {
        userId: user.id,
        createdAt: { gte: windowStart },
      },
    })

    if (recentCount >= MAX_OTP_PER_EMAIL_PER_WINDOW) {
      return NextResponse.json(
        { message: "Too many sign-in attempts. Please try again in 15 minutes." },
        { status: 429 }
      )
    }

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS)

    const challenge = await prisma.mfaChallenge.create({
      data: {
        userId: user.id,
        otp,
        expiresAt,
      },
    })

    try {
      const emailService = new EmailService(getEmailConfig())
      await emailService.sendMfaOtpEmail(user.email, otp)
    } catch (err) {
      console.error("Failed to send MFA OTP email:", err)
      await prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => {})
      return NextResponse.json(
        { message: "Failed to send verification code. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ challengeId: challenge.id })
  } catch (error) {
    console.error("MFA challenge error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
