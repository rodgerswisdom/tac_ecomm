import nextEnv from "@next/env"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const { loadEnvConfig } = nextEnv as { loadEnvConfig: (dir: string) => void }

loadEnvConfig(process.cwd())

const prisma = new PrismaClient()

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim()
    const password = process.env.ADMIN_PASSWORD
    const name = process.env.ADMIN_NAME?.trim() || "Admin User"

    if (!email) {
        throw new Error("ADMIN_EMAIL is not set in your environment variables")
    }

    if (!password || password.length < 8) {
        throw new Error("ADMIN_PASSWORD must be set and at least 8 characters long")
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = await prisma.user.upsert({
        where: { email: email.toLowerCase() },
        update: {
            name,
            passwordHash: hashedPassword,
            role: "ADMIN",
            emailVerified: new Date(),
        },
        create: {
            email: email.toLowerCase(),
            name,
            passwordHash: hashedPassword,
            role: "ADMIN",
            emailVerified: new Date(),
        },
    })

    console.log(`Admin account is ready for ${admin.email}`)
}

main()
    .catch((error) => {
        console.error("Failed to bootstrap admin user:", error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
