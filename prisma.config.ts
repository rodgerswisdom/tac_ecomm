import "dotenv/config"

/**
 * Prisma 7+ config. Connection URLs for Migrate are read from here instead of schema.
 * See https://pris.ly/d/config-datasource
 *
 * Migrations require a direct Postgres connection (not PgBouncer/pooler). On Neon,
 * set DIRECT_URL to the non-pooler hostname (omit "-pooler" from the host).
 *
 * To avoid the pg SSL mode warning, add to DATABASE_URL in .env:
 *   ?sslmode=verify-full   (current strict behavior, recommended)
 * or for libpq compatibility: &uselibpqcompat=true&sslmode=require
 */
export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prefer DIRECT_URL for migrate deploy (advisory locks fail through poolers).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
}
