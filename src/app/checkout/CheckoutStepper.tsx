import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Cart", href: "/cart" },
  { label: "Details", href: "/checkout" },
  { label: "Confirmation", href: null },
] as const;

/** Shared Cart → Details → Confirmation progress indicator. `currentStep` is 1-based. */
export function CheckoutStepper({
  currentStep,
  className,
}: {
  currentStep: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <nav aria-label="Checkout progress" className={className}>
      <ol className="flex items-center gap-2 rounded-full border border-brand-teal/30 bg-white/85 px-2 py-2 text-brand-umber/60 sm:gap-4 sm:px-4">
        {STEPS.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCurrent = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;
          // Only let people step back, and never back out of a finished order.
          const href = isComplete && currentStep < 3 ? step.href : null;

          const content = (
            <>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm",
                  isCurrent && "bg-gradient-to-r from-brand-teal to-brand-coral text-white",
                  isComplete && "bg-brand-teal/15 text-brand-teal",
                  !isCurrent && !isComplete && "bg-brand-jade/40 text-brand-umber/60",
                )}
                aria-hidden
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
              </span>
              <span className="caps-spacing truncate text-[10px] sm:text-xs">
                {step.label}
                {isComplete ? <span className="sr-only"> (completed)</span> : null}
              </span>
            </>
          );

          const pillClassName = cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-full border px-2 py-1.5 transition sm:flex-none sm:gap-3 sm:px-4 sm:py-2",
            isCurrent ? "border-brand-teal bg-white text-brand-umber" : "border-transparent",
            isComplete && "text-brand-umber/80",
          );

          return (
            <li key={step.label} className="flex min-w-0 flex-1 sm:flex-none">
              {href ? (
                <Link href={href} className={cn(pillClassName, "hover:border-brand-teal/40")}>
                  {content}
                </Link>
              ) : (
                <div className={pillClassName} aria-current={isCurrent ? "step" : undefined}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
