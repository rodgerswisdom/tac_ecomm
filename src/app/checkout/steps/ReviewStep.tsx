import React from "react";
import { useCart } from "@/contexts/CartContext";
import { getPaymentCurrencyForCheckout, formatInCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "./PaymentStep";
import type { AppliedCoupon } from "../OrderSummarySidebar";

const paymentLabel: Record<PaymentMethod, string> = {
  PESAPAL: "M-Pesa / Pesapal",
  PAYPAL: "PayPal",
  CARD: "Credit / Debit Card"
};

export function ReviewStep({ shipping, delivery, payment, appliedCoupon, onPlaceOrder, isSubmitting }: ReviewStepProps) {
  const { cart, getCartTotal } = useCart();
  const paymentCurrency = getPaymentCurrencyForCheckout();
  const formatPrice = (amountUsd: number) => formatInCurrency(amountUsd, paymentCurrency);

  const subtotal = getCartTotal();
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

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
  appliedCoupon?: AppliedCoupon | null;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
};

