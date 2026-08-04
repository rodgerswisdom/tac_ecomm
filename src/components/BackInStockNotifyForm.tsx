"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

interface BackInStockNotifyFormProps {
  productId: string;
  productName: string;
}

export function BackInStockNotifyForm({ productId, productName }: BackInStockNotifyFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/stock-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Could not save your request. Try again.");
        return;
      }

      setStatus("success");
      setMessage(`We’ll email you when ${productName} is back in stock.`);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Could not save your request. Try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-brand-teal/25 bg-brand-teal/8 px-4 py-3 text-sm text-brand-umber">
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-brand-umber/70">
        This piece is currently out of stock. Leave your email and we’ll let you know when it’s available again.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`notify-email-${productId}`}>
          Email for stock notification
        </label>
        <input
          id={`notify-email-${productId}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full flex-1 rounded-lg border border-brand-umber/20 bg-white px-3 py-2.5 text-sm text-brand-umber placeholder:text-brand-umber/40 focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
        />
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "loading"}>
          {status === "loading" ? "Saving…" : "Notify me"}
        </Button>
      </div>
      {message && status === "error" ? (
        <p role="alert" className="text-sm text-red-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}
