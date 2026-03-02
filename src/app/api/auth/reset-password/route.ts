import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { token, email, password } = await request.json()

        if (!token || !email || !password) {
            return NextResponse.json(
                { message: 'Token, email, and password are required' },
                { status: 400 }
            )
        }

        const normalizedEmail = String(email).trim().toLowerCase()

        if (String(password).length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // Look up the token
        const record = await prisma.verificationToken.findFirst({
            where: {
                identifier: `password-reset:${normalizedEmail}`,
                token: String(token),
            },
        })

        if (!record) {
            return NextResponse.json(
                { message: 'Invalid or already used reset link.' },
                { status: 400 }
            )
        }

        if (record.expires < new Date()) {
            // Clean up the expired token
            await prisma.verificationToken.delete({
                where: { identifier_token: { identifier: record.identifier, token: record.token } },
            })
            return NextResponse.json(
                { message: 'This reset link has expired. Please request a new one.' },
                { status: 400 }
            )
        }

        // Confirm the user exists
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (!user) {
            return NextResponse.json({ message: 'Invalid reset link.' }, { status: 400 })
        }

        // Hash and save the new password
        const hashedPassword = await hash(String(password), 12)

        await prisma.$transaction([
            // Update the password
            prisma.user.update({
                where: { email: normalizedEmail },
                data: { passwordHash: hashedPassword },
            }),
            // Consume (delete) the token — one-time use
            prisma.verificationToken.delete({
                where: { identifier_token: { identifier: record.identifier, token: record.token } },
            }),
        ])

        return NextResponse.json({ message: 'Password updated successfully. You can now sign in.' })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
