"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateShippingKsh, type DeliveryMethod } from "@/lib/delivery";
import { patternAssets } from "@/lib/patterns";

export type AppliedCoupon = { code: string; discount: number; type: string };

interface OrderSummarySidebarProps {
  appliedCoupon?: AppliedCoupon | null;
  onAppliedCouponChange?: (coupon: AppliedCoupon | null) => void;
  country?: string;
  deliveryMethod?: DeliveryMethod | null;
  className?: string;
}

export function OrderSummarySidebar({
  appliedCoupon = null,
  onAppliedCouponChange,
  country,
  deliveryMethod = null,
  className = "",
}: OrderSummarySidebarProps) {
  const { cart, getCartTotal, getCartItemCount } = useCart();
  const { formatPrice, currency } = useCurrency();

  const subtotal = getCartTotal();
  const discount = appliedCoupon?.discount ?? 0;
  const freeShippingFromCoupon = appliedCoupon?.type === "FREE_SHIPPING";
  const shippingQuote = useMemo(() => {
    if (!country || !deliveryMethod) {
      return { shippingKsh: 0 };
    }
    return calculateShippingKsh({
      country,
      deliveryMethod,
      merchandiseSubtotalKsh: subtotal,
      freeShippingFromCoupon,
    });
  }, [country, deliveryMethod, subtotal, freeShippingFromCoupon]);
  const shippingCost = shippingQuote.shippingKsh;
  const total = Math.max(0, subtotal - discount + shippingCost);

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

  const itemCount = getCartItemCount();

  return (
    <aside
      aria-labelledby="order-summary-heading"
      className={`w-full shrink-0 rounded-[2rem] border border-brand-teal/20 bg-white p-5 shadow-[0_35px_80px_rgba(74,43,40,0.14)] sm:p-7 md:sticky md:top-24 md:w-[340px] md:self-start lg:w-[420px] xl:w-[460px] ${className}`}
    >
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 id="order-summary-heading" className="font-heading text-2xl text-brand-umber">
          Order summary
        </h2>
        <span className="text-sm text-brand-umber/60">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <ul className="max-h-[45vh] space-y-4 overflow-y-auto pr-1 pt-2">
        {cart.map((item) => (
          <li key={item.cartLineKey} className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-brand-umber/10 bg-brand-beige/30">
                <Image
                  src={item.image || patternAssets.kubaGrid}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <span
                className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-umber/80 px-1.5 text-xs font-semibold text-white"
                aria-label={`Quantity ${item.quantity}`}
              >
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-brand-umber">{item.name}</p>
              {item.selectedImageLabel ? (
                <p className="truncate text-xs text-brand-umber/60">{item.selectedImageLabel}</p>
              ) : null}
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums text-brand-umber">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {onAppliedCouponChange ? (
        <div className="mt-6 space-y-2 border-t border-brand-teal/20 pt-5">
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-brand-teal/5 px-3 py-2 text-sm">
              <span className="font-medium text-brand-teal">Code {appliedCoupon.code} applied</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-brand-umber/70 hover:text-brand-umber"
                onClick={handleRemove}
              >
                Remove
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Discount code"
                  aria-label="Discount code"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value);
                    setApplyError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
                  aria-invalid={applyError ? true : undefined}
                  className="h-11 rounded-xl border-brand-umber/20 text-sm"
                />
                <Button
                  type="button"
                  className="h-11 shrink-0 rounded-xl bg-brand-teal px-5 text-white hover:bg-brand-teal/90"
                  onClick={handleApply}
                  disabled={applying || !codeInput.trim()}
                >
                  {applying ? "Applying…" : "Apply"}
                </Button>
              </div>
              {applyError ? (
                <p role="alert" className="text-xs text-brand-coral">
                  {applyError}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <dl className="mt-6 space-y-3 border-t border-brand-teal/20 pt-5 text-sm">
        <div className="flex justify-between text-brand-umber/80">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-brand-teal">
            <dt>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</dt>
            <dd className="tabular-nums">-{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between text-brand-umber/80">
          <dt>Shipping</dt>
          <dd className="tabular-nums">
            {!deliveryMethod ? (
              <span className="text-brand-umber/55">Enter shipping address</span>
            ) : shippingCost === 0 ? (
              <span className="text-brand-teal">Free</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-brand-teal/20 pt-4 text-brand-umber">
          <dt className="text-base font-semibold">Total</dt>
          <dd className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-brand-umber/55">{currency === "KSH" ? "KES" : currency}</span>
            <span className="font-heading text-2xl font-semibold tabular-nums">{formatPrice(total)}</span>
          </dd>
        </div>
      </dl>
    </aside>
  );
}
