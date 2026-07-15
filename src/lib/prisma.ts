import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  // Neon serverless auto-suspends compute after ~5 min of inactivity and
  // terminates the TCP connection server-side. The pool must close idle
  // connections before that happens, otherwise subsequent queries hit a dead
  // connection and produce P2022 / ColumnNotFound errors.
  //
  // idleTimeoutMillis: 3 min — close idle connections before Neon's 5-min cutoff
  // connectionTimeoutMillis: 30 s — allow for cold-start wake on free-tier Neon
  // max: 5 — dev layout + page can run several reads per request
  const adapter = new PrismaPg({
    connectionString,
    idleTimeoutMillis: 180_000,
    connectionTimeoutMillis: 30_000,
    max: 5,
  })

  return new PrismaClient({
    adapter,
    transactionOptions: {
      timeout: 20000,
      maxWait: 10000,
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
