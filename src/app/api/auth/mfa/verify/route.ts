import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { signMfaToken } from "@/lib/mfa-token"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const challengeId = typeof body?.challengeId === "string" ? body.challengeId.trim() : ""
    const code = typeof body?.code === "string" ? body.code.replace(/\s/g, "") : ""

    if (!challengeId || !code) {
      return NextResponse.json(
        { message: "Challenge ID and code are required" },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { message: "Invalid or expired code. Try again or request a new code." },
        { status: 400 }
      )
    }

    const challenge = await prisma.mfaChallenge.findUnique({
      where: { id: challengeId },
      include: { user: true },
    })

    if (!challenge) {
      return NextResponse.json(
        { message: "Invalid or expired code. Try again or request a new code." },
        { status: 400 }
      )
    }

    if (challenge.expiresAt < new Date()) {
      await prisma.mfaChallenge.delete({ where: { id: challengeId } }).catch(() => {})
      return NextResponse.json(
        { message: "Invalid or expired code. Try again or request a new code." },
        { status: 400 }
      )
    }

    if (challenge.otp !== code) {
      return NextResponse.json(
        { message: "Invalid or expired code. Try again or request a new code." },
        { status: 400 }
      )
    }

    await prisma.mfaChallenge.delete({ where: { id: challengeId } })

    let mfaToken: string
    try {
      mfaToken = signMfaToken(challenge.userId)
    } catch (e) {
      console.error("MFA token sign error:", e)
      return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }

    return NextResponse.json({ mfaToken })
  } catch (error) {
    console.error("MFA verify error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
