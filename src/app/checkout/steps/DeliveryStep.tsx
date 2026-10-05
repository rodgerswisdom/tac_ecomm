import { Fragment, useEffect, useMemo, useRef } from "react";
import { Info } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  calculateShippingKsh,
  CUSTOMER_ARRANGED_DELIVERY,
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
  onChange: (method: DeliveryMethod | null) => void;
  /** "Arrange your own delivery" instructions. */
  instructions: string;
  instructionsError?: string;
  onInstructionsChange: (value: string) => void;
  onInstructionsBlur: () => void;
};

/** Shopify-style "Shipping method" list for the chosen destination. */
export function DeliveryStep({
  country,
  merchandiseSubtotal,
  freeShippingFromCoupon = false,
  value,
  onChange,
  instructions,
  instructionsError,
  onInstructionsChange,
  onInstructionsBlur,
}: ShippingMethodSectionProps) {
  const { formatPrice } = useCurrency();
  const options = useMemo(() => getDeliveryOptionsForCountry(country), [country]);
  const instructionsRef = useRef<HTMLTextAreaElement>(null);

  // Kenya prices depend on where the customer is, so they must pick their band themselves;
  // elsewhere the first (standard) option is a safe default.
  const isKenya = isKenyaDestination(country);
  useEffect(() => {
    if (options.some((option) => option.id === value)) return;
    const next = isKenya || options.length === 0 ? null : options[0].id;
    if (next !== value) onChange(next);
  }, [options, value, onChange, isKenya]);

  function applySuggestion(text: string) {
    onInstructionsChange(text);
    // Put the cursor at the end so e.g. "…parcel service to " can be finished with a town.
    requestAnimationFrame(() => {
      const el = instructionsRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(text.length, text.length);
    });
  }

  return (
    <CheckoutCard labelledBy="checkout-shipping-method">
      <div id="checkout-shipping-method">
        <CheckoutSectionHeading>Shipping method</CheckoutSectionHeading>
      </div>
      {isKenya && (
        <p className="text-sm text-brand-umber/70">
          Choose the area we&apos;re delivering to. Prefer to collect? Choose Pickup above — it&apos;s free.
          {merchandiseSubtotal < FREE_SHIPPING_KENYA_KSH_THRESHOLD
            ? ` Delivery is free on orders over ${formatFreeShippingThreshold(formatPrice)}.`
            : null}
        </p>
      )}
      <fieldset>
        <legend className="sr-only">Choose a shipping method</legend>
        <div className="overflow-hidden rounded-xl border border-brand-umber/20 bg-white">
          {options.map((opt, index) => {
            const isCustomerArranged = opt.id === "customer_arranged";
            const selected = value === opt.id;
            const quote = calculateShippingKsh({
              deliveryMethod: opt.id,
              merchandiseSubtotalKsh: merchandiseSubtotal,
              freeShippingFromCoupon,
            });
            return (
              <Fragment key={opt.id}>
                <label
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 px-4 py-3.5 text-sm",
                    index > 0 && "border-t border-brand-umber/15",
                    selected && "bg-brand-teal/5",
                  )}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={opt.id}
                    checked={selected}
                    onChange={() => onChange(opt.id)}
                    className="h-4 w-4 border-brand-teal text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="flex-1 text-brand-umber">
                    {opt.label}
                    {opt.description ? (
                      <span className="block text-xs text-brand-umber/60">{opt.description}</span>
                    ) : null}
                  </span>
                  <span className="ml-auto shrink-0 font-semibold text-brand-umber">
                    {isCustomerArranged ? (
                      <span className="text-brand-umber/70">{CUSTOMER_ARRANGED_DELIVERY.priceLabel}</span>
                    ) : quote.shippingKsh === 0 ? (
                      <span className="text-brand-teal">Free</span>
                    ) : (
                      formatPrice(quote.shippingKsh)
                    )}
                  </span>
                </label>

                {isCustomerArranged && selected ? (
                  <div className="space-y-3 border-t border-brand-teal/20 bg-brand-teal/5 px-4 pb-4 pt-3">
                    <label htmlFor="deliveryInstructions" className="text-sm font-medium text-brand-umber/80">
                      How would you like it shipped?
                    </label>
                    <div className="flex flex-wrap gap-2" aria-label="Suggestions">
                      {CUSTOMER_ARRANGED_DELIVERY.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => applySuggestion(suggestion)}
                          className="rounded-full border border-brand-teal/30 bg-white px-3 py-1 text-xs text-brand-umber/80 transition hover:border-brand-teal hover:text-brand-umber"
                        >
                          {suggestion.trim().replace(/ to$/, " to …")}
                        </button>
                      ))}
                    </div>
                    <textarea
                      ref={instructionsRef}
                      id="deliveryInstructions"
                      name="deliveryInstructions"
                      rows={3}
                      maxLength={CUSTOMER_ARRANGED_DELIVERY.instructionsMaxLength}
                      value={instructions}
                      onChange={(e) => onInstructionsChange(e.target.value)}
                      onBlur={onInstructionsBlur}
                      placeholder='e.g. "Send it by Easy Coach to Kisumu, I will collect at the stage"'
                      aria-invalid={instructionsError ? true : undefined}
                      aria-describedby={instructionsError ? "deliveryInstructions-error" : "deliveryInstructions-help"}
                      className={cn(
                        "w-full rounded-xl border border-brand-umber/20 bg-white px-3 py-2.5 text-base text-brand-umber placeholder:text-brand-umber/40 focus:outline-none focus:ring-2 focus:ring-brand-teal",
                        instructionsError && "border-red-500 focus:ring-red-500",
                      )}
                    />
                    {instructionsError ? (
                      <p id="deliveryInstructions-error" role="alert" className="text-xs text-red-600">
                        {instructionsError}
                      </p>
                    ) : null}
                    <div id="deliveryInstructions-help" className="flex gap-2 text-xs text-brand-umber/65">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      <p>
                        {CUSTOMER_ARRANGED_DELIVERY.handover} {CUSTOMER_ARRANGED_DELIVERY.responsibility}
                      </p>
                    </div>
                  </div>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </fieldset>
    </CheckoutCard>
  );
}
