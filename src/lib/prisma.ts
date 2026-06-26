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
  // connectionTimeoutMillis: 15 s — give Neon time to wake from cold-start
  // max: 2 — free-tier Neon has limited concurrent connections
  const adapter = new PrismaPg({
    connectionString,
    idleTimeoutMillis: 180_000,   // 3 min — close before Neon's 5-min suspend
    connectionTimeoutMillis: 15_000, // 15 s — allow for cold-start wake
    max: 2,
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
