import "dotenv/config"

/**
 * Prisma 7+ config. Connection URLs for Migrate are read from here instead of schema.
 * See https://pris.ly/d/config-datasource
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
    // Uses DATABASE_URL from environment (loaded via dotenv above)
    url: process.env.DATABASE_URL!,
  },
}
