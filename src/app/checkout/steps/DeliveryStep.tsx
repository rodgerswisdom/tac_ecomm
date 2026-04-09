import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";

const deliveryOptions = [
  { id: "standard", label: "Standard Delivery (3-5 days)", price: 0 },
  { id: "pickup", label: "In-Store Pickup", price: 0 }
];

export function DeliveryStep({ onNext }: { onNext?: (method: DeliveryMethod) => void }) {
  const { formatPrice } = useCurrency();
  const [selected, setSelected] = useState<DeliveryMethod>(deliveryOptions[0].id as DeliveryMethod);
  const [error, setError] = useState("");

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
      <form onSubmit={handleSubmit} className="space-y-4">
        {deliveryOptions.map(opt => (
          <label key={opt.id} className="flex min-h-12 items-center gap-3 rounded border p-3 cursor-pointer">
            <input
              type="radio"
              name="deliveryMethod"
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => setSelected(opt.id as DeliveryMethod)}
            />
            <span>{opt.label}</span>
            {opt.price > 0 && <span className="ml-auto font-semibold">+{formatPrice(opt.price)}</span>}
          </label>
        ))}
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">Review order</Button>
        </div>
      </form>
    </div>
  );
}

export type DeliveryMethod = "standard" | "pickup";
