import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerEnvStatus } from '@/env.server'

export async function GET() {
  const envStatus = getServerEnvStatus()

  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV,
      envValid: envStatus.envValid,
      missingEnv: envStatus.missing,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        envValid: envStatus.envValid,
        missingEnv: envStatus.missing,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
