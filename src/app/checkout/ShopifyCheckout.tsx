"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShippingStep,
  EMPTY_SHIPPING,
  validateShipping,
  type ShippingFieldErrors,
  type ShippingFormData,
} from "./steps/ShippingStep";
import { DeliveryStep, type DeliveryMethod } from "./steps/DeliveryStep";
import { OrderSummarySidebar } from "./OrderSummarySidebar";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { trackBeginCheckout } from "@/lib/analytics";
import { calculateShippingKsh } from "@/lib/delivery";

type SavedShipping = Partial<ShippingFormData> & {
  firstName?: string;
  lastName?: string;
  zipCode?: string;
};

function fromSavedShipping(saved: SavedShipping): ShippingFormData {
  return {
    name: saved.name || [saved.firstName, saved.lastName].filter(Boolean).join(" "),
    email: saved.email ?? "",
    phone: saved.phone ?? "",
    address: saved.address ?? "",
    city: saved.city ?? "",
    postalCode: saved.postalCode ?? saved.zipCode ?? "",
    country: saved.country || EMPTY_SHIPPING.country,
  };
}

export default function ShopifyCheckout() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, getCartTotal } = useCart();
  const { formatPrice } = useCurrency();

  const [shipping, setShipping] = useState<ShippingFormData>(EMPTY_SHIPPING);
  const [fieldErrors, setFieldErrors] = useState<ShippingFieldErrors>({});
  const [shippingLoading, setShippingLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [delivery, setDelivery] = useState<DeliveryMethod | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showSummaryMobile, setShowSummaryMobile] = useState(false);

  useEffect(() => {
    setShippingLoading(true);
    fetch("/api/user/shipping")
      .then((res) => res.json())
      .then((data) => {
        if (data.shipping) setShipping(fromSavedShipping(data.shipping));
      })
      .catch(() => {})
      .finally(() => setShippingLoading(false));
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !redirecting) {
      router.replace("/cart");
    }
  }, [cart.length, redirecting, router]);

  // Track begin_checkout once when the page loads with items.
  useEffect(() => {
    if (cart.length > 0) {
      trackBeginCheckout(cart, getCartTotal(), appliedCoupon?.code);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeliveryChange = useCallback((method: DeliveryMethod) => setDelivery(method), []);

  const subtotal = getCartTotal();
  const discount = appliedCoupon?.discount ?? 0;
  const shippingCost = delivery
    ? calculateShippingKsh({
        country: shipping.country,
        deliveryMethod: delivery,
        merchandiseSubtotalKsh: subtotal,
        freeShippingFromCoupon: appliedCoupon?.type === "FREE_SHIPPING",
      }).shippingKsh
    : 0;
  const total = Math.max(0, subtotal - discount + shippingCost);

  function handleShippingChange(next: ShippingFormData) {
    setShipping(next);
    // Clear a field's error as soon as the customer edits it.
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(updated) as (keyof ShippingFormData)[]) {
          if (next[key] !== shipping[key]) delete updated[key];
        }
        return updated;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateShipping(shipping);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted fields.");
      document.getElementById(Object.keys(errors)[0])?.focus();
      return;
    }
    if (!delivery) {
      setError("Please select a delivery option.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      if (session?.user && saveAddress) {
        // Best effort — never block payment on saving the address.
        await fetch("/api/user/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shipping),
        }).catch(() => {});
      }

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...shipping,
          shippingMethod: delivery,
          cartItems: cart,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.redirectUrl) {
        setError(data.error || "We could not start the payment. Please try again.");
        return;
      }

      // The cart is cleared on the thank-you page once Paystack confirms payment.
      setRedirecting(true);
      window.location.assign(data.redirectUrl);
    } catch {
      setError("We could not start the payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || redirecting;

  return (
    <main className="relative min-h-screen overflow-x-clip page-surface">
      <Navbar />
      <section className="nav-clearance section-spacing pb-0">
        <div className="gallery-container flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-heading mobile-page-title text-brand-umber md:text-6xl">Checkout</h1>
            <div className="flex items-center gap-2 rounded-full border border-brand-teal/30 bg-white/85 px-4 py-2 text-xs text-brand-umber/70">
              <Lock className="h-4 w-4 text-brand-teal" aria-hidden />
              <span>Secure payment by Paystack</span>
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="outline"
              className="w-full border-brand-teal/30 text-brand-umber hover:bg-brand-teal/5"
              onClick={() => setShowSummaryMobile((prev) => !prev)}
              aria-expanded={showSummaryMobile}
            >
              {showSummaryMobile ? "Hide order summary" : `View order summary · ${formatPrice(total)}`}
            </Button>
            {showSummaryMobile && (
              <div className="mt-3">
                <OrderSummarySidebar
                  appliedCoupon={appliedCoupon}
                  onAppliedCouponChange={setAppliedCoupon}
                  country={shipping.country}
                  deliveryMethod={delivery}
                  className="md:hidden"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8 md:flex-row">
            <form
              noValidate
              onSubmit={handleSubmit}
              autoComplete="on"
              className="flex-1 space-y-8 rounded-[2.5rem] border border-brand-teal/20 bg-white p-5 shadow-[0_35px_80px_rgba(74,43,40,0.14)] sm:p-8 md:p-10"
            >
              <ShippingStep
                value={shipping}
                onChange={handleShippingChange}
                errors={fieldErrors}
                disabled={shippingLoading || busy}
              />

              {session?.user && (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="save-address"
                    checked={saveAddress}
                    onCheckedChange={(checked) => setSaveAddress(checked === true)}
                    disabled={busy}
                    className="mt-0.5"
                  />
                  <label htmlFor="save-address" className="cursor-pointer text-sm text-brand-umber/70">
                    Save these details for next time
                  </label>
                </div>
              )}

              <DeliveryStep
                country={shipping.country}
                merchandiseSubtotal={subtotal}
                freeShippingFromCoupon={appliedCoupon?.type === "FREE_SHIPPING"}
                value={delivery}
                onChange={handleDeliveryChange}
              />

              {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Button type="submit" disabled={busy || shippingLoading} className="h-12 w-full text-base">
                  {redirecting
                    ? "Redirecting to Paystack…"
                    : submitting
                      ? "Starting payment…"
                      : `Pay ${formatPrice(total)}`}
                </Button>
                <p className="text-center text-xs text-brand-umber/60">
                  You&apos;ll pay securely on Paystack with M-Pesa or card. Charged in KES.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/cart")}
                  disabled={busy}
                  className="w-full text-brand-umber/70"
                >
                  Back to cart
                </Button>
              </div>
            </form>

            {/* Stretches to the form's height so the summary can stay pinned while the form scrolls. */}
            <div className="hidden md:block md:self-stretch">
              <OrderSummarySidebar
                appliedCoupon={appliedCoupon}
                onAppliedCouponChange={setAppliedCoupon}
                country={shipping.country}
                deliveryMethod={delivery}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
