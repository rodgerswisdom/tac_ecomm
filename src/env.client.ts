import { z } from "zod"

const clientEnvSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().optional(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
  NEXT_PUBLIC_KEVERD_API_KEY: z.string().optional(),
})

export type ClientEnv = z.infer<typeof clientEnvSchema>

let cachedClientEnv: ClientEnv | null = null

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    NEXT_PUBLIC_KEVERD_API_KEY: process.env.NEXT_PUBLIC_KEVERD_API_KEY,
  })

  cachedClientEnv = parsed.success ? parsed.data : {}
  return cachedClientEnv
}
