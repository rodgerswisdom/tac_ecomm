import React from "react";

const steps = [
  "Shipping",
  "Payment",
  "Review"
];

export function CheckoutStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, idx) => {
        const active = idx + 1 <= currentStep;
        return (
          <div key={step} className="flex-1 flex flex-col items-center">
            <div
              className={`rounded-full w-10 h-10 flex items-center justify-center font-semibold border-2 transition ${
                active
                  ? "border-brand-teal bg-gradient-to-r from-brand-teal to-brand-coral text-white"
                  : "border-brand-umber/15 bg-brand-jade/40 text-brand-umber/60"
              }`}
            >
              {idx + 1}
            </div>
            <span className={`caps-spacing text-xs mt-2 ${active ? "text-brand-umber" : "text-brand-umber/50"}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
