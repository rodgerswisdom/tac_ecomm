import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
  onNext?: (method: DeliveryMethod) => void;
};

export function DeliveryStep({
  country,
  merchandiseSubtotal,
  freeShippingFromCoupon = false,
  onNext,
}: DeliveryStepProps) {
  const { formatPrice } = useCurrency();
  const options = useMemo(() => getDeliveryOptionsForCountry(country), [country]);
  const [selected, setSelected] = useState<DeliveryMethod>(options[0]?.id ?? "kenya_standard");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!options.some((option) => option.id === selected)) {
      setSelected(options[0]?.id ?? "kenya_standard");
    }
  }, [options, selected]);

  const showFreeShippingHint =
    isKenyaDestination(country) &&
    merchandiseSubtotal < FREE_SHIPPING_KENYA_KSH_THRESHOLD;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) {
      setError("Please select a delivery method.");
      return;
    }
    setError("");
    onNext?.(selected);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Delivery Method</h2>
      {showFreeShippingHint && (
        <p className="mb-4 text-sm text-brand-umber/70">
          Free shipping on Kenya orders over {formatFreeShippingThreshold(formatPrice)}.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="flex min-h-12 items-center gap-3 rounded border p-3 cursor-pointer"
            >
              <input
                type="radio"
                name="deliveryMethod"
                value={opt.id}
                checked={selected === opt.id}
                onChange={() => setSelected(opt.id)}
              />
              <span className="flex-1">{opt.label}</span>
              <span className="ml-auto font-semibold shrink-0">
                {quote.shippingKsh === 0 ? (
                  <span className="text-brand-teal">Free</span>
                ) : (
                  <>+{formatPrice(quote.shippingKsh)}</>
                )}
              </span>
            </label>
          );
        })}
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            Review order
          </Button>
        </div>
      </form>
    </div>
  );
}
