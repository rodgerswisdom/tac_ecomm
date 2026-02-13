import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "./PaymentStep";

const paymentLabel: Record<PaymentMethod, string> = {
  PESAPAL: "M-Pesa / Pesapal",
  PAYPAL: "PayPal",
  CARD: "Credit / Debit Card"
};

export function ReviewStep({ shipping, delivery, payment, onPlaceOrder, isSubmitting }: ReviewStepProps) {
  const { cart, getCartTotal } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Review & Confirm</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Shipping Info</h3>
        <div className="text-sm text-muted-foreground">
          {shipping.firstName} {shipping.lastName}, {shipping.address}, {shipping.city}, {shipping.state}, {shipping.zipCode}, {shipping.country}<br />
          {shipping.email} {shipping.phone && <>| {shipping.phone}</>}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Delivery Method</h3>
        <div className="text-sm text-muted-foreground">{delivery}</div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Payment</h3>
        <div className="text-sm text-muted-foreground">{paymentLabel[payment.method]}</div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Cart Items</h3>
        <ul className="text-sm">
          {cart.map(item => (
            <li key={item.id}>
              {item.name} x{item.quantity} - {formatPrice(item.price * item.quantity)}
            </li>
          ))}
        </ul>
      </div>
      <div className="text-right font-semibold text-lg mb-6">
        Total: {formatPrice(getCartTotal())}
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={onPlaceOrder} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}

type ReviewStepProps = {
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  delivery: string;
  payment: { method: PaymentMethod; card?: { number: string; expiry: string; cvc: string } };
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
};

