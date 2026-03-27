import React, { useState, useEffect } from "react";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { countries } from "@/data/countries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type ShippingStepProps = {
  onNext?: (data: ShippingFormData) => void;
  initialData?: ShippingFormData | null;
  loading?: boolean;
  /** When true, show "Save this address for next time" and call onSaveAddress on submit when checked */
  canSaveAddress?: boolean;
  onSaveAddress?: (data: ShippingFormData) => Promise<void>;
};

export function ShippingStep({ onNext, initialData, loading, canSaveAddress, onSaveAddress }: ShippingStepProps) {
  const controlClassName = "h-12 text-base";
  const [form, setForm] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  });
  const [saveForNextTime, setSaveForNextTime] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setSaveForNextTime(true);
    }
  }, [initialData]);

  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.address || !form.city || !form.state || !form.zipCode) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    if (canSaveAddress && saveForNextTime && onSaveAddress) {
      setSaving(true);
      try {
        await onSaveAddress(form);
      } catch {
        setError("Could not save address. You can still continue.");
      } finally {
        setSaving(false);
      }
    }
    onNext?.(form);
  }

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-brand-umber">Shipping Information</h2>
      <p className="mb-6 text-sm text-brand-umber/65">
        Enter your shipping details. If you have a saved address, it is shown below — you can edit any field.
      </p>
      <form className="space-y-5" onSubmit={handleSubmit} autoComplete="on">
        <section className="rounded-2xl border border-brand-teal/20 bg-brand-beige/55 p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-umber/70">
            Contact
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70">
                First Name
              </label>
              <Input id="firstName" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required disabled={loading} className={controlClassName} autoComplete="given-name" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70">
                Last Name
              </label>
              <Input id="lastName" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required disabled={loading} className={controlClassName} autoComplete="family-name" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70">
                Email
              </label>
              <Input id="email" name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className={controlClassName} disabled={loading} autoComplete="email" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="phone" className="text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70">
                Phone Number
              </label>
              <Input id="phone" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={controlClassName} disabled={loading} autoComplete="tel" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-teal/20 bg-brand-beige/55 p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-umber/70">
            Delivery Address
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="address" className="text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70">
                Street Address
              </label>
              <Input id="address" name="address" placeholder="Street Address" value={form.address} onChange={handleChange} required className={controlClassName} disabled={loading} autoComplete="street-address" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70">
                City
              </label>
              <Input id="city" name="city" placeholder="City" value={form.city} onChange={handleChange} required disabled={loading} className={controlClassName} autoComplete="address-level2" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="state" className="text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70">
                State / Region
              </label>
              <Input id="state" name="state" placeholder="State / Region" value={form.state} onChange={handleChange} required disabled={loading} className={controlClassName} autoComplete="address-level1" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="zipCode" className="text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70">
                ZIP / Postal Code
              </label>
              <Input id="zipCode" name="zipCode" placeholder="ZIP / Postal Code" value={form.zipCode} onChange={handleChange} required disabled={loading} className={controlClassName} autoComplete="postal-code" />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-brand-umber/70">
                Country
              </span>
              <CustomDropdown
                options={countries.map(c => ({ value: c.code, label: c.name }))}
                value={form.country}
                onChange={country => setForm(f => ({ ...f, country }))}
                placeholder="Select Country"
                searchable
                className="w-full [&>button]:h-12 [&>button]:rounded-full [&>button]:border-brand-umber/20 [&>button]:bg-white [&>button]:px-4 [&>button]:py-0 [&>button]:text-brand-umber [&>button]:shadow-[0_6px_18px_rgba(74,43,40,0.08)] [&>button]:focus:ring-brand-teal [&>button_span]:text-brand-umber [&>button_span]:text-base [&>button_svg]:text-brand-umber/60 [&>div]:w-full [&>div]:border-brand-umber/20 [&>div]:bg-white"
                disabled={loading}
              />
            </div>
          </div>
        </section>

        {canSaveAddress && (
          <div className="flex items-start gap-2 rounded-xl border border-brand-teal/15 bg-white/70 px-3 py-3">
            <Checkbox
              id="save-address"
              checked={saveForNextTime}
              onCheckedChange={checked => setSaveForNextTime(checked === true)}
              disabled={loading}
              className="mt-0.5"
            />
            <label htmlFor="save-address" className="cursor-pointer text-sm text-brand-umber/70">
              Save this address for next time
            </label>
          </div>
        )}

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

        <div className="pt-1">
          <Button type="submit" disabled={loading || saving} className="h-12 w-full px-6 text-base">
            {loading ? "Loading..." : saving ? "Saving..." : "Continue to Delivery"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export type ShippingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};
