import { useEffect, useMemo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  calculateShippingKsh,
  formatFreeShippingThreshold,
  FREE_SHIPPING_KENYA_KSH_THRESHOLD,
  getDeliveryOptionsForCountry,
  isKenyaDestination,
  type DeliveryMethod,
} from "@/lib/delivery";
import { cn } from "@/lib/utils";
import { CheckoutCard, CheckoutSectionHeading } from "./CheckoutField";

export type { DeliveryMethod };

type ShippingMethodSectionProps = {
  country: string;
  merchandiseSubtotal: number;
  freeShippingFromCoupon?: boolean;
  value: DeliveryMethod | null;
  onChange: (method: DeliveryMethod) => void;
};

/** Shopify-style "Shipping method" list for the chosen destination. */
export function DeliveryStep({
  country,
  merchandiseSubtotal,
  freeShippingFromCoupon = false,
  value,
  onChange,
}: ShippingMethodSectionProps) {
  const { formatPrice } = useCurrency();
  const options = useMemo(() => getDeliveryOptionsForCountry(country), [country]);

  // Keep a valid selection when the country (and so the available options) changes.
  useEffect(() => {
    if (options.length > 0 && !options.some((option) => option.id === value)) {
      onChange(options[0].id);
    }
  }, [options, value, onChange]);

  const showFreeShippingHint =
    isKenyaDestination(country) && merchandiseSubtotal < FREE_SHIPPING_KENYA_KSH_THRESHOLD;

  return (
    <CheckoutCard labelledBy="checkout-shipping-method">
      <div id="checkout-shipping-method">
        <CheckoutSectionHeading>Shipping method</CheckoutSectionHeading>
      </div>
      {showFreeShippingHint && (
        <p className="text-sm text-brand-umber/70">
          Free shipping on Kenya orders over {formatFreeShippingThreshold(formatPrice)}.
        </p>
      )}
      <fieldset>
        <legend className="sr-only">Choose a shipping method</legend>
        <div className="overflow-hidden rounded-xl border border-brand-umber/20 bg-white">
          {options.map((opt, index) => {
            const quote = calculateShippingKsh({
              country,
              deliveryMethod: opt.id,
              merchandiseSubtotalKsh: merchandiseSubtotal,
              freeShippingFromCoupon,
            });
            return (
              <label
                key={opt.id}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3 px-4 py-3.5 text-sm",
                  index > 0 && "border-t border-brand-umber/15",
                  value === opt.id && "bg-brand-teal/5",
                )}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={opt.id}
                  checked={value === opt.id}
                  onChange={() => onChange(opt.id)}
                  className="h-4 w-4 border-brand-teal text-brand-teal focus:ring-brand-teal"
                />
                <span className="flex-1 text-brand-umber">{opt.label}</span>
                <span className="ml-auto shrink-0 font-semibold text-brand-umber">
                  {quote.shippingKsh === 0 ? <span className="text-brand-teal">Free</span> : formatPrice(quote.shippingKsh)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </CheckoutCard>
  );
}
