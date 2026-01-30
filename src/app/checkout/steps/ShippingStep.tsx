import React, { useState } from "react";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { countries } from "@/data/countries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ShippingStepProps = {
  onNext?: (data: ShippingFormData) => void;
  initialData?: ShippingFormData | null;
  loading?: boolean;
};

export function ShippingStep({ onNext, initialData, loading }: ShippingStepProps) {
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
  React.useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simple validation
    if (!form.firstName || !form.lastName || !form.email || !form.address || !form.city || !form.state || !form.zipCode) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    onNext?.(form);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit} autoComplete="on">
        <Input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required disabled={loading} />
        <Input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required disabled={loading} />
        <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="md:col-span-2" disabled={loading} />
        <Input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="md:col-span-2" disabled={loading} />
        <Input name="address" placeholder="Address" value={form.address} onChange={handleChange} required className="md:col-span-2" disabled={loading} />
        <Input name="city" placeholder="City" value={form.city} onChange={handleChange} required disabled={loading} />
        <Input name="state" placeholder="State" value={form.state} onChange={handleChange} required disabled={loading} />
        <Input name="zipCode" placeholder="ZIP / Postal Code" value={form.zipCode} onChange={handleChange} required disabled={loading} />
        <div className="md:col-span-2">
          <CustomDropdown
            options={countries.map(c => ({ value: c.code, label: c.name }))}
            value={form.country}
            onChange={country => setForm(f => ({ ...f, country }))}
            placeholder="Select Country"
            searchable
            className="w-full"
            disabled={loading}
          />
        </div>
        {error && <div className="text-red-500 col-span-2">{error}</div>}
        <div className="col-span-2 flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Continue to Delivery"}</Button>
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
