import { z } from "zod"

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NEXTAUTH_URL: z.string().url().optional(),
    APP_URL: z.string().url().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    CLOUDINARY_URL: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
    TUMA_API_EMAIL: z.string().optional(),
    TUMA_API_KEY: z.string().optional(),
    TUMA_API_BASE_URL: z.string().url().optional(),
    TUMA_CALLBACK_PUBLIC_URL: z.string().url().optional(),
    PAYPAL_CLIENT_ID: z.string().optional(),
    PAYPAL_CLIENT_SECRET: z.string().optional(),
    PAYPAL_MODE: z.enum(["sandbox", "live"]).optional(),
    ZOHO_SYNC_ENABLED: z.string().optional(),
    ZOHO_CLIENT_ID: z.string().optional(),
    ZOHO_CLIENT_SECRET: z.string().optional(),
    ZOHO_ORGANIZATION_ID: z.string().optional(),
    ZOHO_REDIRECT_URI: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    OPS_EMAIL: z.string().optional(),
    ADMIN_EMAIL: z.string().optional(),
    DEFAULT_CURRENCY: z.string().optional(),
    EXCHANGE_RATE_API_KEY: z.string().optional(),
    GOOGLE_ANALYTICS_ID: z.string().optional(),
  })
  .refine((env) => Boolean(env.NEXTAUTH_URL || env.APP_URL), {
    message: "Either NEXTAUTH_URL or APP_URL must be set",
    path: ["NEXTAUTH_URL"],
  })

export type ServerEnv = z.infer<typeof serverEnvSchema>

let cachedEnv: ServerEnv | null = null
let cachedMissing: string[] | null = null

function collectMissingKeys(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.path.join(".") || issue.message)
}

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv

  const parsed = serverEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    cachedMissing = collectMissingKeys(parsed.error)
    throw new Error(`Invalid server environment: ${cachedMissing.join(", ")}`)
  }

  cachedEnv = parsed.data
  cachedMissing = null
  return parsed.data
}

export function getServerEnvStatus(): { envValid: boolean; missing: string[] } {
  if (cachedEnv) {
    return { envValid: true, missing: [] }
  }

  const parsed = serverEnvSchema.safeParse(process.env)
  if (parsed.success) {
    cachedEnv = parsed.data
    return { envValid: true, missing: [] }
  }

  const missing = collectMissingKeys(parsed.error)
  cachedMissing = missing
  return { envValid: false, missing }
}
