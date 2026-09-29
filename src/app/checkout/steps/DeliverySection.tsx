import { useRef } from "react";
import { MapPin, Store, Truck } from "lucide-react";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { countries } from "@/data/countries";
import { PICKUP_LOCATION } from "@/lib/delivery";
import { cn } from "@/lib/utils";
import { CheckoutCard, CheckoutField, CheckoutSectionHeading } from "./CheckoutField";
import type {
  CheckoutField as FieldName,
  CheckoutFieldErrors,
  CheckoutFormData,
  DeliveryType,
} from "./checkout-form";

type DeliverySectionProps = {
  form: CheckoutFormData;
  errors: CheckoutFieldErrors;
  disabled?: boolean;
  canSaveDetails: boolean;
  saveDetails: boolean;
  onSaveDetailsChange: (value: boolean) => void;
  onChange: (patch: Partial<CheckoutFormData>) => void;
  onBlur: (field: FieldName) => void;
};

const DELIVERY_TYPES: { id: DeliveryType; label: string; icon: typeof Truck }[] = [
  { id: "ship", label: "Ship", icon: Truck },
  { id: "pickup", label: "Pickup", icon: Store },
];

export function DeliverySection({
  form,
  errors,
  disabled,
  canSaveDetails,
  saveDetails,
  onSaveDetailsChange,
  onChange,
  onBlur,
}: DeliverySectionProps) {
  const isPickup = form.deliveryType === "pickup";
  const tabRefs = useRef<Record<DeliveryType, HTMLButtonElement | null>>({ ship: null, pickup: null });

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const ids = DELIVERY_TYPES.map((type) => type.id);
    const current = ids.indexOf(form.deliveryType);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? ids.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length;
    onChange({ deliveryType: ids[next] });
    tabRefs.current[ids[next]]?.focus();
  }

  function field(name: FieldName) {
    return {
      id: name,
      value: form[name],
      error: errors[name],
      disabled,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [name]: e.target.value }),
      onBlur: () => onBlur(name),
    };
  }

  return (
    <CheckoutCard labelledBy="checkout-delivery">
      <div id="checkout-delivery">
        <CheckoutSectionHeading>Delivery</CheckoutSectionHeading>
      </div>

      {/* Ship | Pickup tabs (WAI-ARIA tabs: arrow keys move between them). */}
      <div
        role="tablist"
        aria-label="Delivery method"
        className="grid grid-cols-2 gap-1 rounded-xl bg-brand-beige/40 p-1"
        onKeyDown={handleTabKeyDown}
      >
        {DELIVERY_TYPES.map(({ id, label, icon: Icon }) => {
          const selected = form.deliveryType === id;
          return (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              type="button"
              role="tab"
              id={`delivery-tab-${id}`}
              aria-selected={selected}
              aria-controls="delivery-panel"
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange({ deliveryType: id })}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal",
                selected
                  ? "bg-white text-brand-teal shadow-[0_4px_12px_rgba(74,43,40,0.12)]"
                  : "text-brand-umber/60 hover:text-brand-umber",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="delivery-panel"
        aria-labelledby={`delivery-tab-${form.deliveryType}`}
        className="space-y-4"
      >

      {isPickup ? (
        <div className="flex gap-3 rounded-xl border border-brand-teal/30 bg-brand-teal/5 px-4 py-3 text-sm">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden />
          <div className="space-y-0.5">
            <p className="font-semibold text-brand-umber">{PICKUP_LOCATION.name}</p>
            <p className="text-brand-umber/75">{PICKUP_LOCATION.address}</p>
            <p className="text-brand-umber/60">{PICKUP_LOCATION.instructions}</p>
          </div>
          <span className="ml-auto shrink-0 font-semibold text-brand-teal">Free</span>
        </div>
      ) : (
        <div className="space-y-1">
          <span id="country-label" className="text-sm font-medium text-brand-umber/80">
            Country/Region
          </span>
          <CustomDropdown
            options={countries.map((c) => ({ value: c.code, label: c.name }))}
            value={form.country}
            onChange={(country) => onChange({ country })}
            placeholder="Select country/region"
            searchable
            disabled={disabled}
            className="w-full [&>button]:h-12 [&>button]:rounded-xl [&>button]:border-brand-umber/20 [&>button]:bg-white [&>button]:px-4 [&>button]:py-0 [&>button]:text-brand-umber [&>button]:shadow-none [&>button]:focus:ring-brand-teal [&>button_span]:text-base [&>button_span]:text-brand-umber [&>button_svg]:text-brand-umber/60 [&>div]:w-full [&>div]:border-brand-umber/20 [&>div]:bg-white"
          />
          {errors.country ? (
            <p role="alert" className="text-xs text-red-600">
              {errors.country}
            </p>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CheckoutField {...field("firstName")} label="First name" autoComplete="given-name" />
        <CheckoutField {...field("lastName")} label="Last name" autoComplete="family-name" />

        {!isPickup ? (
          <>
            <CheckoutField
              {...field("address")}
              label="Address"
              autoComplete="address-line1"
              className="sm:col-span-2"
            />
            <CheckoutField
              {...field("apartment")}
              label="Apartment, suite, etc. (optional)"
              autoComplete="address-line2"
              className="sm:col-span-2"
            />
            <CheckoutField {...field("city")} label="City" autoComplete="address-level2" />
            <CheckoutField {...field("postalCode")} label="Postal code (optional)" autoComplete="postal-code" />
          </>
        ) : null}

        <CheckoutField
          {...field("phone")}
          label="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0712 345 678"
          className="sm:col-span-2"
        />
      </div>

      {canSaveDetails && !isPickup ? (
        <div className="flex items-center gap-2">
          <Checkbox
            id="save-details"
            checked={saveDetails}
            onCheckedChange={(checked) => onSaveDetailsChange(checked === true)}
            disabled={disabled}
          />
          <label htmlFor="save-details" className="cursor-pointer text-sm text-brand-umber/80">
            Save this information for next time
          </label>
        </div>
      ) : null}
      </div>
    </CheckoutCard>
  );
}
