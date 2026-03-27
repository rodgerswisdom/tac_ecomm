import React from "react";

const steps = [
  { full: "Shipping & delivery", short: "Details" },
  { full: "Review", short: "Review" },
];

export function CheckoutStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 hidden items-center justify-between md:flex">
      {steps.map((step, idx) => {
        const active = idx + 1 <= currentStep;
        return (
          <div key={step.full} className="flex flex-1 flex-col items-center px-2 text-center">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition sm:h-10 sm:w-10 ${
                active
                  ? "border-brand-teal bg-gradient-to-r from-brand-teal to-brand-coral text-white"
                  : "border-brand-umber/15 bg-brand-jade/40 text-brand-umber/60"
              }`}
            >
              {idx + 1}
            </div>
            <span className={`mt-2 text-[10px] uppercase tracking-[0.2em] sm:text-xs ${active ? "text-brand-umber" : "text-brand-umber/50"}`}>
              <span className="sm:hidden">{step.short}</span>
              <span className="hidden sm:inline">{step.full}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
