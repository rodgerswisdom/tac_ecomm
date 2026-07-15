import "dotenv/config"

/**
 * Prisma 7+ config. Connection URLs for Migrate are read from here instead of schema.
 * See https://pris.ly/d/config-datasource
 *
 * Migrations require a direct Postgres connection (not PgBouncer/pooler). On Neon,
 * set DIRECT_URL to the non-pooler hostname (omit "-pooler" from the host).
 * If DIRECT_URL is unset, a Neon pooler DATABASE_URL is auto-converted for migrate only.
 *
 * To avoid the pg SSL mode warning, add to DATABASE_URL in .env:
 *   ?sslmode=verify-full   (current strict behavior, recommended)
 * or for libpq compatibility: &uselibpqcompat=true&sslmode=require
 */
function resolveMigrationUrl(): string {
  if (process.env.DIRECT_URL) {
    return process.env.DIRECT_URL
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  // Neon pooler hostnames break Prisma advisory locks during migrate deploy.
  if (databaseUrl.includes("-pooler")) {
    return databaseUrl.replace("-pooler", "")
  }

  return databaseUrl
}

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: resolveMigrationUrl(),
  },
}
