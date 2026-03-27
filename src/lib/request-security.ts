import { NextRequest } from "next/server";

type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; retryAfterSeconds: number };

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const checkoutRateLimitBuckets = new Map<string, RateLimitBucket>();

const CHECKOUT_WINDOW_MS = 10 * 60 * 1000;
const CHECKOUT_MAX_REQUESTS = 5;

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(request: NextRequest): Set<string> {
  const allowed = new Set<string>();
  allowed.add(request.nextUrl.origin);

  const appOrigin = normalizeOrigin(process.env.APP_URL);
  if (appOrigin) allowed.add(appOrigin);

  const authOrigin = normalizeOrigin(process.env.NEXTAUTH_URL);
  if (authOrigin) allowed.add(authOrigin);

  return allowed;
}

export function passesCsrfProtection(request: NextRequest): boolean {
  const allowedOrigins = getAllowedOrigins(request);

  const origin = normalizeOrigin(request.headers.get("origin"));
  if (origin) {
    return allowedOrigins.has(origin);
  }

  const referer = normalizeOrigin(request.headers.get("referer"));
  if (referer) {
    return allowedOrigins.has(referer);
  }

  // Same-site browser fetches typically send Origin for JSON POSTs.
  return false;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [ip] = forwardedFor.split(",");
    if (ip?.trim()) return ip.trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  return "unknown";
}

function cleanupExpiredBuckets(now: number) {
  for (const [key, bucket] of checkoutRateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      checkoutRateLimitBuckets.delete(key);
    }
  }
}

export function checkCheckoutRateLimit(request: NextRequest, email: string): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const ip = getClientIp(request);
  const key = `${ip}:${email.toLowerCase()}`;

  const existing = checkoutRateLimitBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    checkoutRateLimitBuckets.set(key, { count: 1, resetAt: now + CHECKOUT_WINDOW_MS });
    return {
      allowed: true,
      remaining: CHECKOUT_MAX_REQUESTS - 1,
      resetAt: now + CHECKOUT_WINDOW_MS,
    };
  }

  if (existing.count >= CHECKOUT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  checkoutRateLimitBuckets.set(key, existing);

  return {
    allowed: true,
    remaining: CHECKOUT_MAX_REQUESTS - existing.count,
    resetAt: existing.resetAt,
  };
}
