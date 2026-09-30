import type { ReactNode } from "react";
import { Building2, CreditCard, ExternalLink, Lock, Smartphone } from "lucide-react";
import { MANUAL_PAYMENT } from "@/lib/manual-payment";
import { cn } from "@/lib/utils";
import { CheckoutCard, CheckoutSectionHeading } from "./CheckoutField";

export type CheckoutPaymentMethod = "paystack" | "mpesa_paybill";

type PaymentSectionProps = {
  value: CheckoutPaymentMethod;
  onChange: (method: CheckoutPaymentMethod) => void;
  /** Paybill is Kenya-only; elsewhere Paystack is the only option. */
  paybillAvailable: boolean;
  disabled?: boolean;
};

export function PaymentSection({ value, onChange, paybillAvailable, disabled }: PaymentSectionProps) {
  const selected = paybillAvailable ? value : "paystack";
  const options: { id: CheckoutPaymentMethod; label: string; badges: ReactNode; details: ReactNode }[] = [
    {
      id: "paystack",
      label: "Paystack",
      badges: (
        <>
          <Badge icon={<CreditCard className="h-3.5 w-3.5" aria-hidden />}>Card</Badge>
          <Badge icon={<Smartphone className="h-3.5 w-3.5" aria-hidden />}>M-Pesa</Badge>
        </>
      ),
      details: (
        <div className="flex items-start gap-3">
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-brand-umber/50" aria-hidden />
          <p>You&apos;ll be redirected to Paystack to complete your purchase. Payments are charged in KES.</p>
        </div>
      ),
    },
    {
      id: "mpesa_paybill",
      label: "M-Pesa Paybill (pay TAC directly)",
      badges: <Badge icon={<Building2 className="h-3.5 w-3.5" aria-hidden />}>Paybill {MANUAL_PAYMENT.paybillNumber}</Badge>,
      details: (
        <div className="space-y-1.5">
          <p>
            After you place your order we&apos;ll show you how to pay: M-Pesa → Paybill{" "}
            <strong className="tabular-nums text-brand-umber">{MANUAL_PAYMENT.paybillNumber}</strong> → account{" "}
            <strong className="tabular-nums text-brand-umber">{MANUAL_PAYMENT.accountNumber}</strong>.
          </p>
          <p>
            Then enter the confirmation code from your M-Pesa message. Your items are held while our team checks the
            payment, and your order is confirmed once it clears, usually within one working day.
          </p>
        </div>
      ),
    },
  ];
  const visible = paybillAvailable ? options : options.slice(0, 1);

  return (
    <CheckoutCard labelledBy="checkout-payment" className="space-y-3">
      <div id="checkout-payment">
        <CheckoutSectionHeading>Payment</CheckoutSectionHeading>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-brand-umber/60">
        <Lock className="h-3.5 w-3.5" aria-hidden />
        All transactions are secure and encrypted.
      </p>
      <fieldset disabled={disabled} className="overflow-hidden rounded-xl border border-brand-umber/20 bg-white">
        <legend className="sr-only">Choose a payment method</legend>
        {visible.map((option, index) => {
          const checked = selected === option.id;
          return (
            <div key={option.id} className={cn(index > 0 && "border-t border-brand-umber/15")}>
              <label
                className={cn(
                  "flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3.5",
                  checked ? "bg-brand-teal/5" : "hover:bg-brand-beige/40",
                )}
              >
                {visible.length > 1 ? (
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={checked}
                    onChange={() => onChange(option.id)}
                    className="h-4 w-4 border-brand-teal text-brand-teal focus:ring-brand-teal"
                  />
                ) : null}
                <span className="font-semibold text-brand-umber">{option.label}</span>
                <span className="ml-auto flex items-center gap-2 text-xs font-medium text-brand-umber/70">
                  {option.badges}
                </span>
              </label>
              {checked ? (
                <div className="border-t border-brand-teal/20 bg-brand-teal/5 px-4 py-4 text-sm text-brand-umber/75">
                  {option.details}
                </div>
              ) : null}
            </div>
          );
        })}
      </fieldset>
    </CheckoutCard>
  );
}

function Badge({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-brand-umber/15 bg-white px-2 py-1">
      {icon}
      {children}
    </span>
  );
}
