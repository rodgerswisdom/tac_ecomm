/**
 * Currency support: base prices are stored in USD.
 * Rates are from USD to display currency (1 USD = rate KSH, etc.).
 */

export type CurrencyCode = "KSH" | "USD" | "EUR";

export const CURRENCIES: Record<
  CurrencyCode,
  { code: CurrencyCode; symbol: string; rateFromUsd: number; decimals: number }
> = {
  USD: { code: "USD", symbol: "$", rateFromUsd: 1, decimals: 2 },
  KSH: { code: "KSH", symbol: "KES", rateFromUsd: 130, decimals: 0 },
  EUR: { code: "EUR", symbol: "€", rateFromUsd: 0.92, decimals: 2 },
};

const STORAGE_KEY = "tac-currency";

export function getStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "USD";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "KSH" || stored === "USD" || stored === "EUR") return stored;
  return "USD";
}

export function setStoredCurrency(code: CurrencyCode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, code);
}

/** Convert amount (in USD) to display currency and format. */
export function formatInCurrency(amountUsd: number, currency: CurrencyCode): string {
  const c = CURRENCIES[currency];
  const value = amountUsd * c.rateFromUsd;
  if (c.decimals === 0) {
    return `${c.symbol} ${Math.round(value).toLocaleString()}`;
  }
  return `${c.symbol} ${value.toLocaleString(undefined, {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals,
  })}`;
}

/** Convert amount in USD to display-currency value (for "Free" or custom labels). */
export function convertFromUsd(amountUsd: number, currency: CurrencyCode): number {
  return amountUsd * CURRENCIES[currency].rateFromUsd;
}

/** Convert amount from a given currency to USD (for order/payment amounts stored in order currency). */
export function convertToUsd(amount: number, fromCurrency: CurrencyCode): number {
  const rate = CURRENCIES[fromCurrency].rateFromUsd;
  return rate === 0 ? amount : amount / rate;
}
