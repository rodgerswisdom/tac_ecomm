import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CheckoutFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
  className?: string;
};

/** A labelled checkout input with an inline, screen-reader-announced error. */
export function CheckoutField({ id, label, error, className, ...inputProps }: CheckoutFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="text-sm font-medium text-brand-umber/80">
        {label}
      </label>
      <Input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-12 rounded-xl border-brand-umber/20 bg-white text-base",
          error && "border-red-500 focus-visible:ring-red-500",
        )}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutSectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-brand-umber">{children}</h2>;
}

/** Each checkout section sits on its own card. */
export function CheckoutCard({
  labelledBy,
  className,
  children,
}: {
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(
        "space-y-4 rounded-2xl border border-brand-teal/20 bg-white p-5 shadow-[0_18px_40px_rgba(74,43,40,0.08)] sm:p-7",
        className,
      )}
    >
      {children}
    </section>
  );
}
