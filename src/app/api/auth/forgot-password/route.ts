import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { createEmailService } from '@/lib/email'

// Token valid for 24 hours
const EXPIRY_MS = 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 })
        }

        const normalizedEmail = email.trim().toLowerCase()

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

        if (!user) {
            return NextResponse.json(
                { message: "We couldn't find an account with that email. Please check and try again." },
                { status: 404 }
            )
        }

        // Rate limit: max 3 reset requests per email per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const recentRequests = await prisma.verificationToken.count({
            where: {
                identifier: `password-reset:${normalizedEmail}`,
                createdAt: { gte: oneHourAgo },
            },
        })
        if (recentRequests >= 3) {
            return NextResponse.json({
                message: 'Too many password reset requests for this email. Please try again later.'
            }, { status: 429 })
        }

        // Invalidate any previous token for this email, then create a fresh one
        await prisma.verificationToken.deleteMany({
            where: { identifier: `password-reset:${normalizedEmail}` },
        })

        const token = randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + EXPIRY_MS)

        await prisma.verificationToken.create({
            data: {
                identifier: `password-reset:${normalizedEmail}`,
                token,
                expires,
            },
        })

        const baseUrl = (process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? 'https://tacaccessories.com').replace(/\/$/, '')
        const resetLink = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`

        void createEmailService()
            .sendPasswordResetEmail(normalizedEmail, resetLink)
            .catch((err) => console.error('[email] password reset email failed:', err))

        return NextResponse.json({
            message: 'A password reset link has been sent to your email.',
        })
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
