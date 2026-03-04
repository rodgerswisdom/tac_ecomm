import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService, getEmailConfig } from '@/lib/email'
import { signMfaToken } from '@/lib/mfa-token'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const verificationId = typeof body?.verificationId === 'string' ? body.verificationId.trim() : ''
    const code = typeof body?.code === 'string' ? body.code.replace(/\s/g, '') : ''

    if (!verificationId || !code) {
      return NextResponse.json(
        { message: 'Verification ID and code are required' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { message: 'Invalid or expired code. Please request a new one.' },
        { status: 400 }
      )
    }

    const pending = await prisma.pendingSignup.findUnique({
      where: { id: verificationId },
    })

    if (!pending) {
      return NextResponse.json(
        { message: 'Invalid or expired code. Please request a new one.' },
        { status: 400 }
      )
    }

    if (pending.expiresAt < new Date()) {
      await prisma.pendingSignup.delete({ where: { id: verificationId } }).catch(() => {})
      return NextResponse.json(
        { message: 'Invalid or expired code. Please request a new one.' },
        { status: 400 }
      )
    }

    if (pending.otp !== code) {
      return NextResponse.json(
        { message: 'Invalid or expired code. Please try again.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        passwordHash: pending.passwordHash,
        role: 'CUSTOMER',
        emailVerified: new Date(),
      },
    })

    await prisma.pendingSignup.delete({ where: { id: verificationId } })

    try {
      const emailService = new EmailService(getEmailConfig())
      await emailService.sendWelcomeEmail(pending.name, pending.email)
    } catch (err) {
      console.error('Welcome email failed:', err)
    }

    const mfaToken = signMfaToken(user.id)

    return NextResponse.json({
      message: 'Account created successfully',
      mfaToken,
    })
  } catch (error) {
    console.error('Signup verify error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
