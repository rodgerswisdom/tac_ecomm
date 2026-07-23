import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { getServerEnv } from "@/env.server"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const { DATABASE_URL } = getServerEnv()
  const connectionString = DATABASE_URL

  // Neon serverless auto-suspends compute after ~5 min of inactivity and
  // terminates the TCP connection server-side. The pool must close idle
  // connections before that happens, otherwise subsequent queries hit a dead
  // connection and produce P2022 / ColumnNotFound errors.
  //
  // idleTimeoutMillis: 3 min — close idle connections before Neon's 5-min cutoff
  // connectionTimeoutMillis: 60 s — allow for cold-start wake on free-tier Neon
  // max: 8 — leave headroom for parallel page reads without exhausting the pool
  const adapter = new PrismaPg({
    connectionString,
    idleTimeoutMillis: 180_000,
    connectionTimeoutMillis: 60_000,
    max: 8,
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
