"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

export function OrderSummarySidebar() {
  const { cart, getCartTotal, getCartItemCount } = useCart();
  const { formatPrice } = useCurrency();
  const subtotal = getCartTotal();
  const shippingEst = subtotal >= 50000 ? 0 : 2500;
  const duty = subtotal * 0.12;
  const total = subtotal + shippingEst + duty;

  return (
    <aside className="w-full md:w-80 shrink-0 rounded-[2.5rem] border border-brand-teal/20 bg-white p-6 shadow-[0_35px_80px_rgba(74,43,40,0.14)] backdrop-blur-sm md:sticky md:top-24 md:self-start">
      <h3 className="caps-spacing text-xs text-brand-teal mb-4">Order Summary</h3>
      <ul className="mb-4 space-y-2 text-sm text-brand-umber">
        {cart.map(item => (
          <li key={item.id} className="flex justify-between gap-2">
            <span className="truncate">{item.name} ×{item.quantity}</span>
            <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-2 border-t border-brand-teal/20 pt-4 text-sm">
        <div className="flex justify-between text-brand-umber/80">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-brand-umber/80">
          <span>Shipping (est.)</span>
          <span>{shippingEst === 0 ? "Free" : formatPrice(shippingEst)}</span>
        </div>
        <div className="flex justify-between text-brand-umber/80">
          <span>Duty / Tax</span>
          <span>{formatPrice(duty)}</span>
        </div>
        <div className="flex justify-between font-semibold text-brand-umber pt-2">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-brand-umber/60">
        {getCartItemCount()} {getCartItemCount() === 1 ? "item" : "items"}
      </p>
    </aside>
  );
}
