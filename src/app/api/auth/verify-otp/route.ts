import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService, getEmailConfig } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json(
                { message: 'Email and verification code are required' },
                { status: 400 }
            )
        }

        const normalizedEmail = email.trim().toLowerCase()

        // Find the verification token in database
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: normalizedEmail,
                token: otp,
            },
        })

        if (!verificationToken) {
            return NextResponse.json(
                { message: 'Invalid verification code' },
                { status: 400 }
            )
        }

        // Check if token has expired
        if (new Date(verificationToken.expires) < new Date()) {
            // Delete the expired token
            await prisma.verificationToken.delete({
                where: { token: verificationToken.token }
            })
            return NextResponse.json(
                { message: 'Verification code has expired. Please request a new one.' },
                { status: 400 }
            )
        }

        // Update user: mark as verified
        const user = await prisma.user.update({
            where: { email: normalizedEmail },
            data: {
                emailVerified: new Date(),
                status: 'ACTIVE' // Ensure user is active
            },
            select: {
                name: true,
                email: true,
            }
        })

        // Delete the verification token after successful use
        await prisma.verificationToken.delete({
            where: { token: verificationToken.token }
        })

        // Now send the welcome email since they are verified
        try {
            const emailService = new EmailService(getEmailConfig())
            await emailService.sendWelcomeEmail(user.name || 'valued customer', user.email)
        } catch (err) {
            console.error('Welcome email failed after verification:', err)
        }

        return NextResponse.json(
            { message: 'Email verified successfully! You can now sign in.' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
