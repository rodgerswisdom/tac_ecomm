import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "KES"
const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-KE"

export function formatPrice(price: number, currency: string = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `TAC-${timestamp}-${random}`.toUpperCase()
}

export function calculateTax(amount: number, taxRate: number = 0.08): number {
  return Math.round(amount * taxRate * 100) / 100
}

export function calculateShipping(weight: number, distance: string = 'domestic'): number {
  const baseRate = distance === 'domestic' ? 5.99 : 15.99
  const weightRate = weight > 1 ? (weight - 1) * 2 : 0
  return baseRate + weightRate
}

export function getTimezoneOffset(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rate: number): number {
  if (fromCurrency === toCurrency) return amount
  return Math.round(amount * rate * 100) / 100
}
