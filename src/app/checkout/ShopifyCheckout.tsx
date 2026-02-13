"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckoutStepper } from "./CheckoutStepper";
import { ShippingStep, ShippingFormData } from "./steps/ShippingStep";
import { DeliveryStep, DeliveryMethod } from "./steps/DeliveryStep";
import { PaymentStep, PaymentFormData } from "./steps/PaymentStep";
import { ReviewStep } from "./steps/ReviewStep";
import { OrderSummarySidebar } from "./OrderSummarySidebar";
import { useCart } from "@/contexts/CartContext";

const TOTAL_STEPS = 3;

export default function ShopifyCheckout() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingFormData | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  useEffect(() => {
    setShippingLoading(true);
    fetch("/api/user/shipping")
      .then(res => res.json())
      .then(data => {
        if (data.shipping) setShipping(data.shipping);
      })
      .finally(() => setShippingLoading(false));
  }, []);
  const [delivery, setDelivery] = useState<DeliveryMethod | null>(null);
  const [payment, setPayment] = useState<PaymentFormData | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { cart, clearCart } = useCart();
  const [error, setError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      router.replace("/cart");
    }
  }, [cart.length, orderPlaced, router]);

  function handleNextStep() {
    setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }
  function handlePrevStep() {
    if (currentStep === 1) {
      router.push("/cart");
      return;
    }
    setCurrentStep((s) => Math.max(1, s - 1));
  }

  async function handlePlaceOrder() {
    if (!shipping || !delivery || !payment) {
      setError("Please complete all steps before placing your order.");
      return;
    }
    setError("");
    setPlacingOrder(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...shipping,
          paymentMethod: payment?.method,
          shippingMethod: delivery,
          cartItems: cart,
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to place order. Please try again.");
        return;
      }
      if (data.redirectUrl) {
        setPlacingOrder(false);
        window.location.href = data.redirectUrl;
        return;
      }
      setOrderPlaced(true);
      clearCart();
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-beige bg-texture-linen">
      <Navbar />
      <section className="section-spacing pb-0">
        <div className="gallery-container flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <span className="caps-spacing text-xs text-brand-teal">Secure Checkout</span>
              <h1 className="font-heading text-5xl text-brand-umber md:text-6xl">
                Checkout
              </h1>
              <p className="max-w-2xl text-sm text-brand-umber/70">
                Complete your order with shipping, delivery, and payment. Your information is protected.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-brand-teal/30 bg-white/85 px-4 py-2 text-xs text-brand-umber/70">
              <Lock className="h-4 w-4 text-brand-teal" aria-hidden />
              <span>Secure checkout</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <CheckoutStepper currentStep={currentStep} />
              <div className="rounded-[2.5rem] border border-brand-teal/20 bg-white p-8 md:p-10 shadow-[0_35px_80px_rgba(74,43,40,0.14)] backdrop-blur-sm min-h-[400px]">
                {orderPlaced ? (
                  <div className="text-center py-16">
                    <h2 className="font-heading text-3xl text-brand-umber mb-4">Thank you for your order</h2>
                    <p className="text-brand-umber/70">
                      Your order has been placed and you will receive a confirmation email soon.
                    </p>
                    <Button className="mt-8" asChild>
                      <Link href="/collections">Continue shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <>
              {currentStep === 1 && (
                <div className="space-y-8">
                  <ShippingStep
                    onNext={data => setShipping(data)}
                    initialData={shipping}
                    loading={shippingLoading}
                    canSaveAddress={!!session?.user}
                    onSaveAddress={async (data) => {
                      const res = await fetch("/api/user/shipping", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                      });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || "Failed to save address");
                      }
                    }}
                  />
                        {shipping && (
                          <DeliveryStep
                            onNext={method => {
                              setDelivery(method);
                              handleNextStep();
                            }}
                          />
                        )}
                      </div>
                    )}
                    {currentStep === 2 && (
                      <PaymentStep
                        onNext={data => {
                          setPayment(data);
                          handleNextStep();
                        }}
                      />
                    )}
                    {currentStep === 3 && shipping && delivery && payment && (
                      <ReviewStep
                        shipping={shipping}
                        delivery={delivery}
                        payment={payment}
                        onPlaceOrder={handlePlaceOrder}
                        isSubmitting={placingOrder}
                      />
                    )}
                    {error && <div className="text-red-500 mt-4">{error}</div>}
                    <div className="flex justify-between mt-8">
                      <Button
                        variant="outline"
                        onClick={handlePrevStep}
                        disabled={orderPlaced}
                        className="border-brand-teal/30 text-brand-umber hover:bg-brand-teal/5"
                      >
                        Back
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <OrderSummarySidebar />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
