"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDown, Lock, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ContactSection } from "./steps/ContactSection";
import { DeliverySection } from "./steps/DeliverySection";
import { DeliveryStep, type DeliveryMethod } from "./steps/DeliveryStep";
import { PaymentSection } from "./steps/PaymentSection";
import {
  EMPTY_CHECKOUT_FORM,
  loadGuestDetails,
  saveGuestDetails,
  validateCheckoutForm,
  validateDeliveryInstructions,
  validateField,
  type CheckoutField,
  type CheckoutFieldErrors,
  type CheckoutFormData,
} from "./steps/checkout-form";
import { OrderSummarySidebar } from "./OrderSummarySidebar";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { trackBeginCheckout } from "@/lib/analytics";
import { calculateShippingKsh, CUSTOMER_ARRANGED_DELIVERY } from "@/lib/delivery";
import { cn } from "@/lib/utils";

type SavedShipping = Partial<Record<keyof CheckoutFormData, string>> & {
  zipCode?: string;
  name?: string;
};

function fromSavedShipping(saved: SavedShipping): Partial<CheckoutFormData> {
  // Older saved addresses only have a single "name"; split it as a best guess.
  const [first = "", ...rest] = (saved.name ?? "").trim().split(/\s+/);
  return {
    firstName: saved.firstName || first,
    lastName: saved.lastName || rest.join(" "),
    phone: saved.phone ?? "",
    address: saved.address ?? "",
    apartment: saved.apartment ?? "",
    city: saved.city ?? "",
    postalCode: saved.postalCode ?? saved.zipCode ?? "",
    country: saved.country || EMPTY_CHECKOUT_FORM.country,
  };
}

export default function ShopifyCheckout() {
  const router = useRouter();
  const { data: session } = useSession();
  const signedInEmail = session?.user?.email ?? null;
  const { cart, getCartTotal } = useCart();
  const { formatPrice } = useCurrency();

  const [form, setForm] = useState<CheckoutFormData>(EMPTY_CHECKOUT_FORM);
  const [touched, setTouched] = useState<Set<CheckoutField>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saveDetails, setSaveDetails] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<DeliveryMethod | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showSummaryMobile, setShowSummaryMobile] = useState(false);

  // Prefill: signed-in customers from their saved address, guests from this device.
  useEffect(() => {
    if (signedInEmail) {
      setDetailsLoading(true);
      fetch("/api/user/shipping")
        .then((res) => res.json())
        .then((data) => {
          if (data.shipping) setForm((prev) => ({ ...prev, ...fromSavedShipping(data.shipping) }));
        })
        .catch(() => {})
        .finally(() => setDetailsLoading(false));
    } else {
      const guest = loadGuestDetails();
      if (guest) setForm((prev) => ({ ...prev, ...guest, marketingOptIn: false }));
    }
  }, [signedInEmail]);

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

  const handleShippingMethodChange = useCallback((method: DeliveryMethod) => setShippingMethod(method), []);

  const isPickup = form.deliveryType === "pickup";
  const deliveryMethod: DeliveryMethod | null = isPickup ? "pickup" : shippingMethod;
  // Signed-in customers pay with their account email (the API uses the session's email).
  const effectiveForm: CheckoutFormData = signedInEmail ? { ...form, email: signedInEmail } : form;

  const subtotal = getCartTotal();
  const discount = appliedCoupon?.discount ?? 0;
  const shippingCost = deliveryMethod
    ? calculateShippingKsh({
        country: isPickup ? "KE" : form.country,
        deliveryMethod,
        merchandiseSubtotalKsh: subtotal,
        freeShippingFromCoupon: appliedCoupon?.type === "FREE_SHIPPING",
      }).shippingKsh
    : 0;
  const total = Math.max(0, subtotal - discount + shippingCost);

  // Shopify-style errors: shown once a field has been left, or after trying to pay.
  const errors: CheckoutFieldErrors = {};
  for (const field of Object.keys(validateCheckoutForm(effectiveForm)) as CheckoutField[]) {
    if (submitAttempted || touched.has(field)) errors[field] = validateField(field, effectiveForm);
  }
  const isCustomerArranged = deliveryMethod === "customer_arranged";
  const instructionsProblem = isCustomerArranged
    ? validateDeliveryInstructions(form.deliveryInstructions, CUSTOMER_ARRANGED_DELIVERY.instructionsMaxLength)
    : undefined;
  if (instructionsProblem && (submitAttempted || touched.has("deliveryInstructions"))) {
    errors.deliveryInstructions = instructionsProblem;
  }

  function updateForm(patch: Partial<CheckoutFormData>) {
    setForm((prev) => ({ ...prev, ...patch }));
    if (error) setError("");
  }

  function markTouched(field: CheckoutField) {
    setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    const allErrors = validateCheckoutForm(effectiveForm);
    const firstInvalid = Object.keys(allErrors)[0];
    if (firstInvalid) {
      setError("Please fix the highlighted fields.");
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    if (!deliveryMethod) {
      setError("Please choose a shipping method.");
      return;
    }
    if (instructionsProblem) {
      setError("Please tell us how you'd like your order delivered.");
      document.getElementById("deliveryInstructions")?.focus();
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      if (signedInEmail && saveDetails && !isPickup) {
        // Best effort — never block payment on saving details.
        await fetch("/api/user/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(effectiveForm),
        }).catch(() => {});
      }

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...effectiveForm,
          shippingMethod: deliveryMethod,
          cartItems: cart,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.redirectUrl) {
        setError(data.error || "We could not start the payment. Please try again.");
        return;
      }

      if (!signedInEmail) saveGuestDetails(effectiveForm);
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
  const summaryProps = {
    appliedCoupon,
    onAppliedCouponChange: setAppliedCoupon,
    country: isPickup ? "KE" : form.country,
    deliveryMethod,
  };

  return (
    <main className="relative min-h-screen overflow-x-clip page-surface">
      <Navbar />
      <section className="nav-clearance section-spacing pb-0">
        <div className="gallery-container flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-heading text-3xl text-brand-umber md:text-4xl">Checkout</h1>
            <div className="flex items-center gap-2 rounded-full border border-brand-teal/30 bg-white/85 px-4 py-2 text-xs text-brand-umber/70">
              <Lock className="h-4 w-4 text-brand-teal" aria-hidden />
              <span>Secure checkout</span>
            </div>
          </div>

          {/* Mobile: Shopify-style collapsible summary bar. */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowSummaryMobile((prev) => !prev)}
              aria-expanded={showSummaryMobile}
              aria-controls="mobile-order-summary"
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-brand-teal/30 bg-white px-4 py-3 text-sm text-brand-teal"
            >
              <span className="flex items-center gap-2 font-medium">
                <ShoppingBag className="h-4 w-4" aria-hidden />
                {showSummaryMobile ? "Hide order summary" : "Show order summary"}
                <ChevronDown className={cn("h-4 w-4 transition-transform", showSummaryMobile && "rotate-180")} aria-hidden />
              </span>
              <span className="font-semibold text-brand-umber">{formatPrice(total)}</span>
            </button>
            {showSummaryMobile && (
              <div id="mobile-order-summary" className="mt-3">
                <OrderSummarySidebar {...summaryProps} className="md:hidden" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8 md:flex-row">
            <form
              noValidate
              onSubmit={handleSubmit}
              autoComplete="on"
              className="flex-1 space-y-5"
            >
              <ContactSection
                form={form}
                errors={errors}
                signedInEmail={signedInEmail}
                disabled={busy}
                onChange={updateForm}
                onBlur={markTouched}
              />

              <DeliverySection
                form={form}
                errors={errors}
                disabled={detailsLoading || busy}
                canSaveDetails={Boolean(signedInEmail)}
                saveDetails={saveDetails}
                onSaveDetailsChange={setSaveDetails}
                onChange={updateForm}
                onBlur={markTouched}
              />

              {!isPickup ? (
                <DeliveryStep
                  country={form.country}
                  merchandiseSubtotal={subtotal}
                  freeShippingFromCoupon={appliedCoupon?.type === "FREE_SHIPPING"}
                  value={shippingMethod}
                  onChange={handleShippingMethodChange}
                  instructions={form.deliveryInstructions}
                  instructionsError={errors.deliveryInstructions}
                  onInstructionsChange={(deliveryInstructions) => updateForm({ deliveryInstructions })}
                  onInstructionsBlur={() => markTouched("deliveryInstructions")}
                />
              ) : null}

              <PaymentSection />

              <div className="space-y-3">
                {error && (
                  <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={busy || detailsLoading} className="h-14 w-full text-base font-semibold">
                  {redirecting ? "Redirecting to Paystack…" : submitting ? "Starting payment…" : "Pay now"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/cart")}
                  disabled={busy}
                  className="w-full text-brand-umber/70"
                >
                  Return to cart
                </Button>
              </div>
            </form>

            {/* Stretches to the form's height so the summary can stay pinned while the form scrolls. */}
            <div className="hidden md:block md:self-stretch">
              <OrderSummarySidebar {...summaryProps} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
