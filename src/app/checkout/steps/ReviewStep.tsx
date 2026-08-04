import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { ManualPaymentDetails } from "@/components/checkout/ManualPaymentDetails";
import { STK_PAYMENT_ENABLED } from "@/lib/manual-payment";
import type { PaymentMethod } from "./PaymentStep";
import type { AppliedCoupon } from "../OrderSummarySidebar";
import {
  calculateShippingKsh,
  DELIVERY_LABELS,
  type DeliveryMethod,
} from "@/lib/delivery";

const paymentLabel: Record<PaymentMethod, string> = {
  TUMA: "M-Pesa",
  PESAPAL: "M-Pesa",
  PAYPAL: "PayPal",
  CARD: "Credit / Debit Card",
  BANK_TRANSFER: "M-Pesa Paybill",
};

export function ReviewStep({
  shipping,
  delivery,
  payment,
  appliedCoupon,
  onPlaceOrder,
  isSubmitting,
}: ReviewStepProps) {
  const { cart, getCartTotal } = useCart();
  const { formatPrice } = useCurrency();

  const subtotal = getCartTotal();
  const discount = appliedCoupon?.discount ?? 0;
  const freeShippingFromCoupon = appliedCoupon?.type === "FREE_SHIPPING";
  const shippingQuote = calculateShippingKsh({
    country: shipping.country,
    deliveryMethod: delivery as DeliveryMethod,
    merchandiseSubtotalKsh: subtotal,
    freeShippingFromCoupon,
  });
  const shippingCost = shippingQuote.shippingKsh;
  const total = Math.max(0, subtotal - discount + shippingCost);
  const useManualPayment = !STK_PAYMENT_ENABLED || payment.method === "BANK_TRANSFER";

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-brand-umber">Review & Confirm</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-brand-umber/10 bg-white/70 px-3 py-2.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-brand-umber/50">Ship to</h3>
          <div className="mt-1 space-y-0.5 text-sm leading-snug text-brand-umber/80 break-words">
            <p className="font-medium text-brand-umber">
              {shipping.firstName} {shipping.lastName}
            </p>
            <p>
              {shipping.address}, {shipping.city} {shipping.zipCode}
            </p>
            <p className="text-xs text-brand-umber/65">
              {shipping.email}
              {shipping.phone ? ` · ${shipping.phone}` : ""}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-brand-umber/10 bg-white/70 px-3 py-2.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-brand-umber/50">Delivery</h3>
          <p className="mt-1 text-sm leading-snug text-brand-umber/80">
            {DELIVERY_LABELS[delivery as DeliveryMethod] ?? delivery}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-umber/50">
          Payment
        </h3>
        {useManualPayment ? (
          <ManualPaymentDetails amountKes={total} variant="checkout" />
        ) : (
          <p className="text-sm text-muted-foreground">
            {paymentLabel[payment.method]}
            {(payment.method === "TUMA" || payment.method === "PESAPAL") && shipping.phone
              ? ` — STK to ${shipping.phone}`
              : null}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-brand-umber/10 bg-white/70 px-3 py-2.5">
        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-brand-umber/50">Items</h3>
        <ul className="mt-1 divide-y divide-brand-umber/5 text-sm">
          {cart.map((item) => (
            <li key={item.cartLineKey} className="flex items-baseline justify-between gap-3 py-1">
              <span className="min-w-0 truncate text-brand-umber/80">
                {item.name}
                {item.selectedImageLabel ? ` (${item.selectedImageLabel})` : ""} ×{item.quantity}
              </span>
              <span className="shrink-0 tabular-nums text-brand-umber">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 space-y-0.5 border-t border-brand-umber/10 pt-2 text-sm">
          <div className="flex justify-between text-brand-umber/65">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-brand-teal">
              <span>Discount ({appliedCoupon?.code})</span>
              <span className="tabular-nums">-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-brand-umber/65">
            <span>Shipping</span>
            <span className="tabular-nums">
              {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-brand-umber">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="button" onClick={onPlaceOrder} disabled={isSubmitting}>
          {isSubmitting
            ? "Placing order…"
            : useManualPayment
              ? "Place order"
              : "Pay with M-Pesa"}
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
