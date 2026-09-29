import Link from "next/link";
import { signOut } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckoutCard, CheckoutField, CheckoutSectionHeading } from "./CheckoutField";
import type { CheckoutField as FieldName, CheckoutFieldErrors, CheckoutFormData } from "./checkout-form";

type ContactSectionProps = {
  form: CheckoutFormData;
  errors: CheckoutFieldErrors;
  signedInEmail?: string | null;
  disabled?: boolean;
  onChange: (patch: Partial<CheckoutFormData>) => void;
  onBlur: (field: FieldName) => void;
};

export function ContactSection({ form, errors, signedInEmail, disabled, onChange, onBlur }: ContactSectionProps) {
  return (
    <CheckoutCard labelledBy="checkout-contact">
      <div className="flex items-baseline justify-between gap-3">
        <div id="checkout-contact">
          <CheckoutSectionHeading>Contact</CheckoutSectionHeading>
        </div>
        {!signedInEmail ? (
          <Link
            href="/auth/signin?callbackUrl=%2Fcheckout"
            className="text-sm font-medium text-brand-teal underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        ) : null}
      </div>

      {signedInEmail ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-umber/15 bg-white px-4 py-3 text-sm">
          <span className="text-brand-umber">
            <span className="text-brand-umber/60">Signed in as </span>
            {signedInEmail}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/checkout" })}
            className="font-medium text-brand-teal underline-offset-4 hover:underline"
          >
            Log out
          </button>
        </div>
      ) : (
        <CheckoutField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          error={errors.email}
          disabled={disabled}
          onChange={(e) => onChange({ email: e.target.value })}
          onBlur={() => onBlur("email")}
          aria-describedby={errors.email ? "email-error" : "email-hint"}
        />
      )}
      {!signedInEmail ? (
        <p id="email-hint" className="-mt-2 text-xs text-brand-umber/60">
          Used for your order confirmation
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Checkbox
          id="marketing-opt-in"
          checked={form.marketingOptIn}
          onCheckedChange={(checked) => onChange({ marketingOptIn: checked === true })}
          disabled={disabled}
        />
        <label htmlFor="marketing-opt-in" className="cursor-pointer text-sm text-brand-umber/80">
          Email me with news and offers
        </label>
      </div>
    </CheckoutCard>
  );
}
