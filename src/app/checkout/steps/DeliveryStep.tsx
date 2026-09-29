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

export type { DeliveryMethod };

type DeliveryStepProps = {
  country: string;
  merchandiseSubtotal: number;
  freeShippingFromCoupon?: boolean;
  value: DeliveryMethod | null;
  onChange: (method: DeliveryMethod) => void;
};

export function DeliveryStep({
  country,
  merchandiseSubtotal,
  freeShippingFromCoupon = false,
  value,
  onChange,
}: DeliveryStepProps) {
  const { formatPrice } = useCurrency();
  const options = useMemo(() => getDeliveryOptionsForCountry(country), [country]);

  // Keep a valid selection when the country (and so the available options) changes.
  useEffect(() => {
    if (options.length > 0 && !options.some((option) => option.id === value)) {
      onChange(options[0].id);
    }
  }, [options, value, onChange]);

  const showFreeShippingHint =
    isKenyaDestination(country) &&
    merchandiseSubtotal < FREE_SHIPPING_KENYA_KSH_THRESHOLD;

  return (
    <fieldset className="space-y-3">
      <legend className="mb-3 text-xl font-semibold text-brand-umber">Delivery</legend>
      {showFreeShippingHint && (
        <p className="text-sm text-brand-umber/70">
          Free shipping on Kenya orders over {formatFreeShippingThreshold(formatPrice)}.
        </p>
      )}
      {options.map((opt) => {
        const quote = calculateShippingKsh({
          country,
          deliveryMethod: opt.id,
          merchandiseSubtotalKsh: merchandiseSubtotal,
          freeShippingFromCoupon,
        });

        return (
          <label
            key={opt.id}
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-brand-umber/15 p-3 has-[:checked]:border-brand-teal has-[:checked]:bg-brand-teal/5"
          >
            <input
              type="radio"
              name="deliveryMethod"
              value={opt.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              className="h-4 w-4 border-brand-teal text-brand-teal focus:ring-brand-teal"
            />
            <span className="flex-1 text-sm text-brand-umber">{opt.label}</span>
            <span className="ml-auto shrink-0 text-sm font-semibold">
              {quote.shippingKsh === 0 ? (
                <span className="text-brand-teal">Free</span>
              ) : (
                <>+{formatPrice(quote.shippingKsh)}</>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
