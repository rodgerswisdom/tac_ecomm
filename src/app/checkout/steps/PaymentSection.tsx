import { CreditCard, ExternalLink, Lock, Smartphone } from "lucide-react";
import { CheckoutCard, CheckoutSectionHeading } from "./CheckoutField";

/** Paystack is the only payment option, so this is a card to read rather than a choice to make. */
export function PaymentSection() {
  return (
    <CheckoutCard labelledBy="checkout-payment" className="space-y-3">
      <div id="checkout-payment">
        <CheckoutSectionHeading>Payment</CheckoutSectionHeading>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-brand-umber/60">
        <Lock className="h-3.5 w-3.5" aria-hidden />
        All transactions are secure and encrypted.
      </p>
      <div className="overflow-hidden rounded-xl border border-brand-teal bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-teal/5 px-4 py-3.5">
          <span className="font-semibold text-brand-umber">Paystack</span>
          <span className="flex items-center gap-2 text-xs font-medium text-brand-umber/70">
            <span className="inline-flex items-center gap-1 rounded-md border border-brand-umber/15 bg-white px-2 py-1">
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
              Card
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-brand-umber/15 bg-white px-2 py-1">
              <Smartphone className="h-3.5 w-3.5" aria-hidden />
              M-Pesa
            </span>
          </span>
        </div>
        <div className="flex items-start gap-3 border-t border-brand-teal/20 px-4 py-4 text-sm text-brand-umber/75">
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-brand-umber/50" aria-hidden />
          <p>You&apos;ll be redirected to Paystack to complete your purchase. Payments are charged in KES.</p>
        </div>
      </div>
    </CheckoutCard>
  );
}
