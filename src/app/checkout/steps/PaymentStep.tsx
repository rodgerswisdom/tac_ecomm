import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const paymentMethods = [
  { id: "card", label: "Credit/Debit Card" },
  { id: "mpesa", label: "M-Pesa" },
  { id: "paypal", label: "PayPal" }
];

export function PaymentStep({ onNext }: { onNext?: (data: PaymentFormData) => void }) {
  const [method, setMethod] = useState<PaymentMethod>(paymentMethods[0].id as PaymentMethod);
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!method) {
      setError("Please select a payment method.");
      return;
    }
    if (method === "card" && (!card.number || !card.expiry || !card.cvc)) {
      setError("Please fill in all card details.");
      return;
    }
    setError("");
    onNext?.({ method, card });
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          {paymentMethods.map(opt => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value={opt.id}
                checked={method === opt.id}
                onChange={() => setMethod(opt.id as PaymentMethod)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {method === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="cardNumber"
              placeholder="Card Number"
              value={card.number}
              onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
              required
            />
            <Input
              name="expiry"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
              required
            />
            <Input
              name="cvc"
              placeholder="CVC"
              value={card.cvc}
              onChange={e => setCard(c => ({ ...c, cvc: e.target.value }))}
              required
            />
          </div>
        )}
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex justify-end">
          <Button type="submit">Review Order</Button>
        </div>
      </form>
    </div>
  );
}

export type PaymentMethod = "card" | "mpesa" | "paypal";
export type PaymentFormData = {
  method: PaymentMethod;
  card?: {
    number: string;
    expiry: string;
    cvc: string;
  };
};
