export type DeliveryMethod =
  | "nairobi_cbd"
  | "nairobi_near_cbd"
  | "nairobi_outer"
  | "kenya_upcountry"
  // Legacy Kenya methods, replaced by the bands above. Kept so older orders still display.
  | "kenya_standard"
  | "kenya_express"
  | "international_standard"
  | "international_express"
  | "pickup"
  | "customer_arranged";

/**
 * "Arrange your own delivery": the customer tells us how to send the parcel and pays their
 * courier directly, so no shipping is charged at checkout. Kenya only. Edit copy here.
 */
export const CUSTOMER_ARRANGED_DELIVERY = {
  label: "Arrange your own delivery",
  priceLabel: "No charge",
  summary: "You pay your courier directly",
  responsibility:
    "You pay your courier directly. Once we hand your parcel to your courier in Nairobi CBD, they're responsible for delivering it.",
  handover: "We'll call you to agree the handover time and place in Nairobi CBD.",
  instructionsMaxLength: 500,
  suggestions: [
    "My rider will collect from you in the CBD",
    "Send it by bus/matatu parcel service to ",
    "Send it via G4S / Wells Fargo to ",
  ],
} as const;

/** Where "Pickup" orders are collected. Edit here to change what checkout, admin and emails show. */
export const PICKUP_LOCATION = {
  name: "Reinsurance Plaza",
  address: "Reinsurance Plaza, Nairobi",
  city: "Nairobi",
  country: "KE",
  instructions: "We'll call or email you when your order is ready for collection.",
} as const;

/**
 * Kenya delivery bands. The customer picks the band their address falls in; ops check it
 * against the address when they dispatch. Edit areas/prices here.
 */
export const KENYA_DELIVERY_BANDS = [
  { id: "nairobi_cbd", label: "Within Nairobi CBD", areas: "Delivered anywhere in the CBD" },
  { id: "nairobi_near_cbd", label: "Around the CBD", areas: "Upper Hill, Parklands, Westlands, Nairobi West" },
  { id: "nairobi_outer", label: "Outside the CBD, within Nairobi", areas: "Athi River, Kitengela, Kikuyu, Ruaka and similar" },
  { id: "kenya_upcountry", label: "Outside Nairobi", areas: "Mombasa, Kisumu, Eldoret, Nakuru and other towns" },
] as const satisfies readonly { id: DeliveryMethod; label: string; areas: string }[];

/** Base shipping fees stored in KSH (same base unit as product prices). */
export const SHIPPING_RATES_KSH: Record<DeliveryMethod, number> = {
  nairobi_cbd: 300,
  nairobi_near_cbd: 300,
  nairobi_outer: 600,
  kenya_upcountry: 700,
  kenya_standard: 300,
  kenya_express: 500,
  international_standard: 2500,
  international_express: 4500,
  pickup: 0,
  customer_arranged: 0,
};

export const DELIVERY_OPTIONS: {
  id: DeliveryMethod;
  label: string;
  /** Shown under the label at checkout. */
  description?: string;
  price: number;
  regions: "kenya" | "international" | "all";
}[] = [
  ...KENYA_DELIVERY_BANDS.map((band) => ({
    id: band.id,
    label: band.label,
    description: band.areas,
    price: SHIPPING_RATES_KSH[band.id],
    regions: "kenya" as const,
  })),
  {
    id: "customer_arranged",
    label: CUSTOMER_ARRANGED_DELIVERY.label,
    description: CUSTOMER_ARRANGED_DELIVERY.summary,
    price: SHIPPING_RATES_KSH.customer_arranged,
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
  nairobi_cbd: "Delivery — within Nairobi CBD",
  nairobi_near_cbd: "Delivery — around the CBD (Upper Hill, Parklands, Westlands, Nairobi West)",
  nairobi_outer: "Delivery — outside the CBD, within Nairobi",
  kenya_upcountry: "Delivery — outside Nairobi",
  kenya_standard: "Kenya Standard (1-3 business days)",
  kenya_express: "Kenya Express (1-2 business days)",
  international_standard: "International Standard (3-7 business days)",
  international_express: "International Express (2-5 business days)",
  pickup: `Pickup — ${PICKUP_LOCATION.address}`,
  customer_arranged: CUSTOMER_ARRANGED_DELIVERY.label,
};

export function isKenyaDestination(country: string | null | undefined): boolean {
  if (!country) return false;
  const normalized = country.trim().toUpperCase();
  return normalized === "KE" || normalized === "KEN" || normalized === "KENYA";
}

export function isDeliveryMethod(value: string): value is DeliveryMethod {
  return value === "pickup" || DELIVERY_OPTIONS.some((option) => option.id === value);
}

export function getDeliveryOptionsForCountry(country: string | null | undefined) {
  const kenya = isKenyaDestination(country);
  return DELIVERY_OPTIONS.filter((option) => {
    if (option.regions === "all") return true;
    if (kenya) return option.regions === "kenya";
    return option.regions === "international";
  });
}

/** Shipping methods for a destination. Pickup is chosen separately (Ship / Pickup toggle). */
export function isDeliveryMethodValidForCountry(
  method: DeliveryMethod,
  country: string | null | undefined
): boolean {
  if (method === "pickup") return true;
  return getDeliveryOptionsForCountry(country).some((option) => option.id === method);
}

export type ShippingQuote = {
  shippingKsh: number;
  baseRateKsh: number;
  freeShippingFromCoupon: boolean;
};

/** Shipping is the method's flat rate; only a FREE_SHIPPING coupon waives it. */
export function calculateShippingKsh({
  deliveryMethod,
  freeShippingFromCoupon = false,
}: {
  deliveryMethod: DeliveryMethod;
  freeShippingFromCoupon?: boolean;
}): ShippingQuote {
  const baseRateKsh = SHIPPING_RATES_KSH[deliveryMethod] ?? 0;
  return {
    shippingKsh: freeShippingFromCoupon ? 0 : baseRateKsh,
    baseRateKsh,
    freeShippingFromCoupon,
  };
}

export function getEstimatedDeliveryDays(method: DeliveryMethod): number {
  const estimates: Record<DeliveryMethod, number> = {
    nairobi_cbd: 1,
    nairobi_near_cbd: 1,
    nairobi_outer: 2,
    kenya_upcountry: 3,
    kenya_standard: 2,
    kenya_express: 1,
    international_standard: 5,
    international_express: 3,
    pickup: 1,
    customer_arranged: 2,
  };
  return estimates[method] ?? 5;
}
