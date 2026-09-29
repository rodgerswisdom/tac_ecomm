import React from "react";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { countries } from "@/data/countries";
import { Input } from "@/components/ui/input";
import { isKenyaDestination } from "@/lib/delivery";

export type ShippingFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  /** Only asked for outside Kenya, where couriers need it. */
  postalCode: string;
  country: string;
};

export type ShippingFieldErrors = Partial<Record<keyof ShippingFormData, string>>;

export const EMPTY_SHIPPING: ShippingFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "KE",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateShipping(form: ShippingFormData): ShippingFieldErrors {
  const errors: ShippingFieldErrors = {};
  if (!form.name.trim()) errors.name = "Enter your full name.";
  if (!form.email.trim()) errors.email = "Enter your email for the receipt.";
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!form.phone.trim()) errors.phone = "Enter a phone number for delivery.";
  if (!form.address.trim()) errors.address = "Enter your delivery address.";
  if (!form.city.trim()) errors.city = "Enter your town or city.";
  if (!form.country) errors.country = "Select a country.";
  return errors;
}

type ShippingStepProps = {
  value: ShippingFormData;
  onChange: (next: ShippingFormData) => void;
  errors?: ShippingFieldErrors;
  disabled?: boolean;
};

const labelClassName = "text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70";
const controlClassName = "h-12 text-base";

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: keyof ShippingFormData;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ShippingStep({ value, onChange, errors = {}, disabled }: ShippingStepProps) {
  const showPostalCode = !isKenyaDestination(value.country);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, [e.target.name]: e.target.value });
  }

  function inputProps(name: keyof ShippingFormData) {
    return {
      id: name,
      name,
      value: value[name],
      onChange: handleChange,
      disabled,
      className: controlClassName,
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    };
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-umber">Contact & delivery</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id="name" label="Full name" error={errors.name} className="md:col-span-2">
          <Input {...inputProps("name")} autoComplete="name" required />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <Input {...inputProps("email")} type="email" autoComplete="email" required />
        </Field>
        <Field id="phone" label="Phone" error={errors.phone}>
          <Input {...inputProps("phone")} type="tel" placeholder="0712 345 678" autoComplete="tel" required />
        </Field>
        <Field id="address" label="Delivery address" error={errors.address} className="md:col-span-2">
          <Input
            {...inputProps("address")}
            placeholder="Street, building, apartment"
            autoComplete="street-address"
            required
          />
        </Field>
        <Field id="city" label="Town / City" error={errors.city}>
          <Input {...inputProps("city")} autoComplete="address-level2" required />
        </Field>
        <div className="space-y-1.5">
          <span id="country-label" className={labelClassName}>
            Country
          </span>
          <CustomDropdown
            options={countries.map((c) => ({ value: c.code, label: c.name }))}
            value={value.country}
            onChange={(country) => onChange({ ...value, country })}
            placeholder="Select country"
            searchable
            className="w-full [&>button]:h-12 [&>button]:rounded-full [&>button]:border-brand-umber/20 [&>button]:bg-white [&>button]:px-4 [&>button]:py-0 [&>button]:text-brand-umber [&>button]:shadow-[0_6px_18px_rgba(74,43,40,0.08)] [&>button]:focus:ring-brand-teal [&>button_span]:text-brand-umber [&>button_span]:text-base [&>button_svg]:text-brand-umber/60 [&>div]:w-full [&>div]:border-brand-umber/20 [&>div]:bg-white"
            disabled={disabled}
          />
          {errors.country ? (
            <p role="alert" className="text-xs text-red-600">
              {errors.country}
            </p>
          ) : null}
        </div>
        {showPostalCode ? (
          <Field id="postalCode" label="Postal code (optional)" error={errors.postalCode}>
            <Input {...inputProps("postalCode")} autoComplete="postal-code" />
          </Field>
        ) : null}
      </div>
    </section>
  );
}
