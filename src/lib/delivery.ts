import type { CurrencyCode } from "@/lib/currency";
import { convertFromBase } from "@/lib/currency";

export type DeliveryMethod =
  | "kenya_standard"
  | "kenya_express"
  | "international_standard"
  | "international_express";

/** Kenya-only free shipping when merchandise subtotal (KSH) meets this threshold. */
export const FREE_SHIPPING_KENYA_KSH_THRESHOLD = 5000;

/** Base shipping fees stored in KSH (same base unit as product prices). */
export const SHIPPING_RATES_KSH: Record<DeliveryMethod, number> = {
  kenya_standard: 300,
  kenya_express: 500,
  international_standard: 2500,
  international_express: 4500,
};

export const DELIVERY_OPTIONS: {
  id: DeliveryMethod;
  label: string;
  price: number;
  regions: "kenya" | "international" | "all";
}[] = [
  {
    id: "kenya_standard",
    label: "Kenya Standard (1-3 business days)",
    price: SHIPPING_RATES_KSH.kenya_standard,
    regions: "kenya",
  },
  {
    id: "kenya_express",
    label: "Kenya Express (1-2 business days)",
    price: SHIPPING_RATES_KSH.kenya_express,
    regions: "kenya",
  },
  {
    id: "international_standard",
    label: "International Standard (3-7 business days)",
    price: SHIPPING_RATES_KSH.international_standard,
    regions: "international",
  },
  {
    id: "international_express",
    label: "International Express (2-5 business days)",
    price: SHIPPING_RATES_KSH.international_express,
    regions: "international",
  },
];

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  kenya_standard: "Kenya Standard (1-3 business days)",
  kenya_express: "Kenya Express (1-2 business days)",
  international_standard: "International Standard (3-7 business days)",
  international_express: "International Express (2-5 business days)",
};

export function isKenyaDestination(country: string | null | undefined): boolean {
  if (!country) return false;
  const normalized = country.trim().toUpperCase();
  return normalized === "KE" || normalized === "KEN" || normalized === "KENYA";
}

export function isDeliveryMethod(value: string): value is DeliveryMethod {
  return DELIVERY_OPTIONS.some((option) => option.id === value);
}

export function getDeliveryOptionsForCountry(country: string | null | undefined) {
  const kenya = isKenyaDestination(country);
  return DELIVERY_OPTIONS.filter((option) => {
    if (option.regions === "all") return true;
    if (kenya) return option.regions === "kenya";
    return option.regions === "international";
  });
}

export function isDeliveryMethodValidForCountry(
  method: DeliveryMethod,
  country: string | null | undefined
): boolean {
  return getDeliveryOptionsForCountry(country).some((option) => option.id === method);
}

export type ShippingQuote = {
  shippingKsh: number;
  baseRateKsh: number;
  qualifiesForFreeShipping: boolean;
  freeShippingFromCoupon: boolean;
};

export function calculateShippingKsh({
  country,
  deliveryMethod,
  merchandiseSubtotalKsh,
  freeShippingFromCoupon = false,
}: {
  country: string | null | undefined;
  deliveryMethod: DeliveryMethod;
  merchandiseSubtotalKsh: number;
  freeShippingFromCoupon?: boolean;
}): ShippingQuote {
  const baseRateKsh = SHIPPING_RATES_KSH[deliveryMethod] ?? 0;

  if (freeShippingFromCoupon) {
    return {
      shippingKsh: 0,
      baseRateKsh,
      qualifiesForFreeShipping: false,
      freeShippingFromCoupon,
    };
  }

  const qualifiesForFreeShipping =
    isKenyaDestination(country) &&
    merchandiseSubtotalKsh >= FREE_SHIPPING_KENYA_KSH_THRESHOLD &&
    (deliveryMethod === "kenya_standard" || deliveryMethod === "kenya_express");

  if (qualifiesForFreeShipping) {
    return {
      shippingKsh: 0,
      baseRateKsh,
      qualifiesForFreeShipping: true,
      freeShippingFromCoupon: false,
    };
  }

  return {
    shippingKsh: baseRateKsh,
    baseRateKsh,
    qualifiesForFreeShipping: false,
    freeShippingFromCoupon: false,
  };
}

/** Format the Kenya free-shipping threshold in the shopper's selected currency. */
export function formatFreeShippingThreshold(
  formatPrice: (amountKsh: number) => string
): string {
  return formatPrice(FREE_SHIPPING_KENYA_KSH_THRESHOLD);
}

/** Numeric threshold in a display currency (for labels/tooltips). */
export function freeShippingThresholdInCurrency(currency: CurrencyCode): number {
  return convertFromBase(FREE_SHIPPING_KENYA_KSH_THRESHOLD, currency);
}

export function getEstimatedDeliveryDays(method: DeliveryMethod): number {
  const estimates: Record<DeliveryMethod, number> = {
    kenya_standard: 2,
    kenya_express: 1,
    international_standard: 5,
    international_express: 3,
  };
  return estimates[method] ?? 5;
}
