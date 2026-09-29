"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Retries/resumes payment for the same order via a new Paystack attempt. */
export function RetryPaystackPaymentButton({
  orderId,
  label,
  variant = "default",
}: {
  orderId: string;
  label: string;
  variant?: "default" | "outline";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  async function handleClick() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/payment/paystack/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.redirectUrl) {
        window.location.assign(data.redirectUrl);
        return;
      }
      setExpired(Boolean(data.expired));
      setError(data.error || "We could not start the payment. Please try again.");
    } catch {
      setError("We could not start the payment. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant={variant}
        onClick={handleClick}
        disabled={busy}
        className={variant === "outline" ? "border-brand-teal/40 text-brand-umber" : undefined}
      >
        {busy ? "Opening Paystack…" : label}
      </Button>
      {error ? (
        <p role="alert" className="max-w-sm text-sm text-red-700">
          {error}{" "}
          {expired ? (
            <Link href="/cart" className="underline">
              Back to cart
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
