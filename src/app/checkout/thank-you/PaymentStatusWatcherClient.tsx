"use client";

import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";

type PaymentStatusWatcherClientProps = {
  enabled: boolean;
  orderId?: string;
  trackingId?: string;
};

export function PaymentStatusWatcherClient({
  enabled,
  orderId,
  trackingId,
}: PaymentStatusWatcherClientProps) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (!enabled || !orderId) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 150;

    const poll = async () => {
      if (cancelled || attempts >= maxAttempts) return;
      attempts += 1;

      try {
        const query = new URLSearchParams({ orderId });
        if (trackingId) query.set("trackingId", trackingId);

        const res = await fetch(`/api/order/payment-status?${query.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        if (
          data?.paymentStatus === "COMPLETED" ||
          data?.payment?.status === "COMPLETED"
        ) {
          clearCart();
          window.location.reload();
          return;
        }
      } catch {
        // ignore polling failures and retry
      }

      if (!cancelled) {
        setTimeout(poll, 4000);
      }
    };

    const timer = setTimeout(poll, 4000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, orderId, trackingId, clearCart]);

  return null;
}
