import React from "react";

const steps = [
  "Shipping & delivery",
  "Review"
];

export function CheckoutStepper({ currentStep }: { currentStep: number }) {
  const activeStepLabel = steps[Math.max(0, Math.min(steps.length - 1, currentStep - 1))];

  return (
    <div className="mb-8">
      <div className="sm:hidden flex flex-col items-center gap-2">
        <div className="rounded-full w-10 h-10 flex items-center justify-center font-semibold border-2 border-brand-teal bg-gradient-to-r from-brand-teal to-brand-coral text-white">
          {currentStep}
        </div>
        <span className="caps-spacing text-xs text-brand-umber text-center">
          {activeStepLabel}
        </span>
      </div>

      <div className="hidden sm:flex items-center justify-between">
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
    </div>
  );
}
