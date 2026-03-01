"use client";

import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { getPaymentCurrencyForCheckout, formatInCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AppliedCoupon = { code: string; discount: number; type: string };

interface OrderSummarySidebarProps {
  appliedCoupon?: AppliedCoupon | null;
  onAppliedCouponChange?: (coupon: AppliedCoupon | null) => void;
}

export function OrderSummarySidebar({
  appliedCoupon = null,
  onAppliedCouponChange,
}: OrderSummarySidebarProps) {
  const { cart, getCartTotal, getCartItemCount } = useCart();
  const paymentCurrency = getPaymentCurrencyForCheckout();
  const formatPrice = (amountUsd: number) => formatInCurrency(amountUsd, paymentCurrency);

  const subtotal = getCartTotal();
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const [codeInput, setCodeInput] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applying, setApplying] = useState(false);

  async function handleApply() {
    const code = codeInput.trim();
    if (!code) {
      setApplyError("Enter a discount code.");
      return;
    }
    setApplyError("");
    setApplying(true);
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid && data.discount != null) {
        onAppliedCouponChange?.({
          code: data.code ?? code,
          discount: Number(data.discount),
          type: data.type ?? "PERCENTAGE",
        });
        setCodeInput("");
      } else {
        onAppliedCouponChange?.(null);
        setApplyError(data.message || "Invalid or expired coupon.");
      }
    } catch {
      setApplyError("Could not validate code. Try again.");
    } finally {
      setApplying(false);
    }
  }

  function handleRemove() {
    onAppliedCouponChange?.(null);
    setApplyError("");
  }

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

      {onAppliedCouponChange ? (
        <div className="mb-4 space-y-2 border-t border-brand-teal/20 pt-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-brand-teal font-medium">
                Discount ({appliedCoupon.code})
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">-{formatPrice(appliedCoupon.discount)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-brand-umber/70 hover:text-brand-umber"
                  onClick={handleRemove}
                >
                  Remove
                </Button>
              </span>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Discount code"
                  value={codeInput}
                  onChange={e => {
                    setCodeInput(e.target.value);
                    setApplyError("");
                  }}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleApply())}
                  className="h-9 rounded-full border-brand-umber/20 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-9 shrink-0 rounded-full bg-brand-teal text-white hover:bg-brand-teal/90"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? "…" : "Apply"}
                </Button>
              </div>
              {applyError ? (
                <p className="text-xs text-brand-coral">{applyError}</p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <div className="space-y-2 border-t border-brand-teal/20 pt-4 text-sm">
        <div className="flex justify-between text-brand-umber/80">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-brand-teal">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
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
