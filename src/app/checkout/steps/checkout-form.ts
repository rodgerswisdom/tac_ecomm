export type DeliveryType = "ship" | "pickup";

/** Everything the checkout form collects (Shopify-style fields). */
export type CheckoutFormData = {
  email: string;
  marketingOptIn: boolean;
  deliveryType: DeliveryType;
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  phone: string;
  /** Only used with "Arrange your own delivery". */
  deliveryInstructions: string;
};

export type CheckoutField = Exclude<keyof CheckoutFormData, "marketingOptIn" | "deliveryType">;
export type CheckoutFieldErrors = Partial<Record<CheckoutField, string>>;

export const EMPTY_CHECKOUT_FORM: CheckoutFormData = {
  email: "",
  marketingOptIn: false,
  deliveryType: "ship",
  country: "KE",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  postalCode: "",
  phone: "",
  deliveryInstructions: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate one field; returns an error message or undefined. */
export function validateField(field: CheckoutField, form: CheckoutFormData): string | undefined {
  const value = form[field].trim();
  const shipping = form.deliveryType === "ship";
  switch (field) {
    case "email":
      if (!value) return "Enter an email";
      if (!EMAIL_PATTERN.test(value)) return "Enter a valid email";
      return undefined;
    case "firstName":
      return value ? undefined : "Enter a first name";
    case "lastName":
      return value ? undefined : "Enter a last name";
    case "phone": {
      if (!value) return "Enter a phone number";
      const digits = value.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 15) return "Enter a valid phone number";
      return undefined;
    }
    case "address":
      return shipping && !value ? "Enter an address" : undefined;
    case "city":
      return shipping && !value ? "Enter a city" : undefined;
    case "country":
      return shipping && !value ? "Select a country/region" : undefined;
    // Required only for "Arrange your own delivery" — checked by validateDeliveryInstructions.
    case "deliveryInstructions":
      return undefined;
    default:
      return undefined;
  }
}

const VALIDATED_FIELDS: CheckoutField[] = [
  "email",
  "country",
  "firstName",
  "lastName",
  "address",
  "city",
  "phone",
];

export function validateDeliveryInstructions(value: string, maxLength: number): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Tell us how you'd like your order delivered";
  if (trimmed.length > maxLength) return `Keep it under ${maxLength} characters`;
  return undefined;
}

export function validateCheckoutForm(form: CheckoutFormData): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  for (const field of VALIDATED_FIELDS) {
    const error = validateField(field, form);
    if (error) errors[field] = error;
  }
  return errors;
}

// Guests: remember details on this device only (like Shopify's "remember me"), never
// on the server. Wrapped in try/catch because storage can be blocked.
const GUEST_DETAILS_KEY = "tac-checkout-details";

export function loadGuestDetails(): Partial<CheckoutFormData> | null {
  try {
    const raw = window.localStorage.getItem(GUEST_DETAILS_KEY);
    return raw ? (JSON.parse(raw) as Partial<CheckoutFormData>) : null;
  } catch {
    return null;
  }
}

export function saveGuestDetails(form: CheckoutFormData) {
  try {
    // Marketing consent and per-order delivery instructions are never remembered.
    const details: Partial<CheckoutFormData> = { ...form };
    delete details.marketingOptIn;
    delete details.deliveryInstructions;
    window.localStorage.setItem(GUEST_DETAILS_KEY, JSON.stringify(details));
  } catch {
    // Storage unavailable — nothing to remember.
  }
}

export function clearGuestDetails() {
  try {
    window.localStorage.removeItem(GUEST_DETAILS_KEY);
  } catch {
    // ignore
  }
}
