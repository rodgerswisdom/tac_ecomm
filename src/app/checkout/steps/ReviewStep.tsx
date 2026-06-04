import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "./PaymentStep";
import type { AppliedCoupon } from "../OrderSummarySidebar";

const paymentLabel: Record<PaymentMethod, string> = {
  TUMA: "M-Pesa",
  PESAPAL: "M-Pesa",
  PAYPAL: "PayPal",
  CARD: "Credit / Debit Card"
};

const deliveryLabel: Record<string, string> = {
  standard: "Standard Delivery (3-5 days)",
  pickup: "In-Store Pickup",
};

export function ReviewStep({ shipping, delivery, payment, appliedCoupon, onPlaceOrder, isSubmitting }: ReviewStepProps) {
  const { cart, getCartTotal } = useCart();
  const { formatPrice } = useCurrency();

  const subtotal = getCartTotal();
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Review & Confirm</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Shipping Info</h3>
        <div className="space-y-1 text-sm text-muted-foreground break-words">
          <p>{shipping.firstName} {shipping.lastName}</p>
          <p>{shipping.address}</p>
          <p>{shipping.city}, {shipping.state} {shipping.zipCode}</p>
          <p>{shipping.country}</p>
          <p>{shipping.email} {shipping.phone && <>| {shipping.phone}</>}</p>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Delivery Method</h3>
        <div className="text-sm text-muted-foreground">{deliveryLabel[delivery] ?? delivery}</div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Payment</h3>
        <div className="text-sm text-muted-foreground">
          {paymentLabel[payment.method]}
          {(payment.method === "TUMA" || payment.method === "PESAPAL") && shipping.phone ? (
            <p className="mt-2 text-brand-umber/80">
              You will receive an M-Pesa STK push on <strong>{shipping.phone}</strong> after placing
              the order. Enter your PIN on your phone to pay.
            </p>
          ) : null}
        </div>
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
      <div className="text-right space-y-1 font-semibold text-lg mb-6">
        <div className="flex justify-end gap-4 text-base font-normal text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-end gap-4 text-brand-teal">
            <span>Discount ({appliedCoupon?.code})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-end gap-4 pt-1">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={onPlaceOrder} disabled={isSubmitting}>
          {isSubmitting ? "Sending M-Pesa request…" : "Pay with M-Pesa"}
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
  appliedCoupon?: AppliedCoupon | null;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
};

