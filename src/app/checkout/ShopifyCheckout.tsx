import React, { useState, useEffect } from "react";
import { CheckoutStepper } from "./CheckoutStepper";
import { CartStep } from "./steps/CartStep";
import { ShippingStep, ShippingFormData } from "./steps/ShippingStep";
import { DeliveryStep, DeliveryMethod } from "./steps/DeliveryStep";
import { PaymentStep, PaymentFormData } from "./steps/PaymentStep";
import { ReviewStep } from "./steps/ReviewStep";
import { OrderSummarySidebar } from "./OrderSummarySidebar";
import { useCart } from "@/contexts/CartContext";

export default function ShopifyCheckout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingFormData | null>(null);
  // Track if shipping is loading (for autopopulate)
  const [shippingLoading, setShippingLoading] = useState(false);
    // On mount, try to fetch saved shipping for logged-in user
    useEffect(() => {
      if (!shipping) {
        setShippingLoading(true);
        fetch("/api/user/shipping")
          .then(res => res.json())
          .then(data => {
            if (data.shipping) setShipping(data.shipping);
          })
          .finally(() => setShippingLoading(false));
      }
      // Only run on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  const [delivery, setDelivery] = useState<DeliveryMethod | null>(null);
  const [payment, setPayment] = useState<PaymentFormData | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { cart, clearCart } = useCart();
  const [error, setError] = useState("");

  function handleNextStep() {
    setCurrentStep((s) => Math.min(5, s + 1));
  }
  function handlePrevStep() {
    setCurrentStep((s) => Math.max(1, s - 1));
  }

  async function handlePlaceOrder() {
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...shipping,
          paymentMethod: payment?.method,
          shippingMethod: delivery,
          cartItems: cart,
          // Optionally add coupon, tax, shipping, total if available
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to place order. Please try again.");
        return;
      }
      setOrderPlaced(true);
      clearCart();
    } catch {
      setError("Failed to place order. Please try again.");
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto py-8">
      <div className="flex-1">
        <CheckoutStepper currentStep={currentStep} />
        <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
          {orderPlaced ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Thank you for your order!</h2>
              <p className="text-muted-foreground">Your order has been placed and you will receive a confirmation email soon.</p>
            </div>
          ) : (
            <>
              {currentStep === 1 && <CartStep />}
              {currentStep === 2 && (
                <ShippingStep
                  onNext={data => {
                    setShipping(data);
                    handleNextStep();
                  }}
                  initialData={shipping}
                  loading={shippingLoading}
                />
              )}
              {currentStep === 3 && (
                <DeliveryStep
                  onNext={method => {
                    setDelivery(method);
                    handleNextStep();
                  }}
                />
              )}
              {currentStep === 4 && (
                <PaymentStep
                  onNext={data => {
                    setPayment(data);
                    handleNextStep();
                  }}
                />
              )}
              {currentStep === 5 && shipping && delivery && payment && (
                <div className="space-y-8">
                  <ShippingStep
                    onNext={data => setShipping(data)}
                    initialData={shipping}
                  />
                  <ReviewStep
                    shipping={shipping}
                    delivery={delivery}
                    payment={payment}
                    onPlaceOrder={handlePlaceOrder}
                  />
                </div>
              )}
              {error && <div className="text-red-500 mt-4">{error}</div>}
              <div className="flex justify-between mt-8">
                <button
                  className="btn btn-secondary"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1 || orderPlaced}
                >
                  Back
                </button>
                {currentStep < 5 && (
                  <button
                    className="btn btn-primary"
                    onClick={handleNextStep}
                    disabled={orderPlaced}
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <OrderSummarySidebar />
    </div>
  );
}
