import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { EmailService, getEmailConfig } from '@/lib/email'

const OTP_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const MAX_SIGNUP_OTP_PER_EMAIL = 5

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    const trimmedName = typeof name === 'string' ? name.trim() : ''
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const plainPassword = typeof password === 'string' ? password : ''

    if (!trimmedName || !normalizedEmail || !plainPassword) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    if (plainPassword.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
    const recentCount = await prisma.pendingSignup.count({
      where: {
        email: normalizedEmail,
        createdAt: { gte: windowStart },
      },
    })

    if (recentCount >= MAX_SIGNUP_OTP_PER_EMAIL) {
      return NextResponse.json(
        { message: 'Too many verification requests. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    await prisma.pendingSignup.deleteMany({
      where: { email: normalizedEmail },
    })

    const hashedPassword = await hash(plainPassword, 12)
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS)

    const pending = await prisma.pendingSignup.create({
      data: {
        email: normalizedEmail,
        name: trimmedName,
        passwordHash: hashedPassword,
        otp,
        expiresAt,
      },
    })

    try {
      const emailService = new EmailService(getEmailConfig())
      const sent = await emailService.sendSignupOtpEmail(normalizedEmail, otp)
      if (!sent) {
        await prisma.pendingSignup.delete({ where: { id: pending.id } }).catch(() => {})
        return NextResponse.json(
          { message: 'Failed to send verification code. Please try again.' },
          { status: 500 }
        )
      }
    } catch (err) {
      console.error('Signup OTP email failed:', err)
      await prisma.pendingSignup.delete({ where: { id: pending.id } }).catch(() => {})
      return NextResponse.json(
        { message: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Verification code sent to your email',
        verificationId: pending.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
