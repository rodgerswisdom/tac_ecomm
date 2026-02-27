import "dotenv/config"
import { defineConfig, env } from "prisma/config"

/**
 * Prisma 7+ config. Connection URLs for Migrate are read from here instead of schema.
 * See https://pris.ly/d/config-datasource
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
