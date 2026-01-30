import React from "react";

const steps = [
  "Cart",
  "Shipping",
  "Delivery",
  "Payment",
  "Review"
];

export function CheckoutStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, idx) => (
        <div key={step} className="flex-1 flex flex-col items-center">
          <div
            className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 ${
              idx + 1 <= currentStep ? "bg-primary text-white border-primary" : "bg-gray-200 text-gray-500 border-gray-300"
            }`}
          >
            {idx + 1}
          </div>
          <span className="text-xs mt-2">{step}</span>
        </div>
      ))}
    </div>
  );
}
