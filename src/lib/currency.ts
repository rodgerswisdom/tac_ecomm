/**
 * Currency support: base prices are stored in KSH (Kenyan Shilling).
 * Rates are from KSH base to display currency (1 KSH = rate USD, etc.).
 * Exchange rate API still fetches USD-based rates; we compute inverses.
 */

export type CurrencyCode = "KSH" | "USD" | "EUR";

export let CURRENCIES: Record<
  CurrencyCode,
  { code: CurrencyCode; symbol: string; rateFromBase: number; decimals: number }
> = {
  KSH: { code: "KSH", symbol: "KES", rateFromBase: 1, decimals: 0 },
  USD: { code: "USD", symbol: "$", rateFromBase: 1 / 130, decimals: 2 },
  EUR: { code: "EUR", symbol: "€", rateFromBase: 0.92 / 130, decimals: 2 },
};

/** Initialize the global CURRENCIES rates from database settings.
 *  Accepts USD-based rates (1 USD = kesRate KSH, 1 USD = eurRate EUR)
 *  and computes KSH-base rates internally.
 */
export function initializeRates(kesRate: number, eurRate: number) {
  CURRENCIES.KSH.rateFromBase = 1;
  CURRENCIES.USD.rateFromBase = 1 / kesRate;
  CURRENCIES.EUR.rateFromBase = eurRate / kesRate;
}

const STORAGE_KEY = "tac-currency";

/** Payment currency used for checkout (and sent to gateway). */
export function getPaymentCurrencyForCheckout(): CurrencyCode {
  if (typeof window === "undefined") return "KSH";
  const c = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY?.toUpperCase();
  if (c === "KES" || c === "KSH") return "KSH";
  if (c === "EUR") return "EUR";
  return "KSH";
}

export function getStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "KSH";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "KSH" || stored === "USD" || stored === "EUR") return stored;
  return "KSH";
}

export function setStoredCurrency(code: CurrencyCode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, code);
}

/** Convert amount (in base currency KSH) to display currency and format. */
export function formatInCurrency(
  amountBase: number,
  currency: CurrencyCode
): string {
  const c = CURRENCIES[currency];
  const value = amountBase * c.rateFromBase;
  if (c.decimals === 0) {
    return `${c.symbol} ${Math.round(value).toLocaleString()}`;
  }
  return `${c.symbol} ${value.toLocaleString(undefined, {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals,
  })}`;
}

/** Convert amount in base currency (KSH) to display-currency value. */
export function convertFromBase(
  amountBase: number,
  currency: CurrencyCode
): number {
  return amountBase * CURRENCIES[currency].rateFromBase;
}

/** Convert amount from a given currency to base currency (KSH). */
export function convertToBase(
  amount: number,
  fromCurrency: CurrencyCode
): number {
  const rate = CURRENCIES[fromCurrency].rateFromBase;
  return rate === 0 ? amount : amount / rate;
}

/** Legacy alias for code that still references convertFromUsd during transition. */
export const convertFromUsd = convertFromBase;
/** Legacy alias for code that still references convertToUsd during transition. */
export const convertToUsd = convertToBase;
