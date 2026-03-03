import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { EmailService, getEmailConfig } from '@/lib/email'

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    let user;
    if (existingUser) {
      // User exists but not verified, we'll just resend the OTP
      user = existingUser;
    } else {
      // Hash password with bcrypt (12 rounds — good security/performance balance)
      const hashedPassword = await hash(plainPassword, 12)

      // Create user in database
      user = await prisma.user.create({
        data: {
          name: trimmedName,
          email: normalizedEmail,
          passwordHash: hashedPassword,
          role: 'CUSTOMER',
          emailVerified: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })
    }

    // Generate 6-digit OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in VerificationToken table (expires in 10 minutes)
    try {
      // Clear any existing tokens for this email first
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail }
      })

      await prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token: otp,
          expires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      })

      // Send OTP verification email
      const emailService = new EmailService(getEmailConfig())
      await emailService.sendVerificationOTPEmail(normalizedEmail, otp)
    } catch (err) {
      console.error('OTP generation or email failed:', err)
      // We don't fail the request here, but the user won't be able to verify immediately
      // The frontend should handle the transition to the verification step
    }

    return NextResponse.json(
      {
        message: 'Acccount created. Please verify your email with the code sent to you.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
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

