"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

type PaymentStatusWatcherClientProps = {
  enabled: boolean;
  orderId?: string;
  orderNumber?: string;
  trackingId?: string;
};

export function PaymentStatusWatcherClient({
  enabled,
  orderId,
  orderNumber,
  trackingId,
}: PaymentStatusWatcherClientProps) {
  const router = useRouter();
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
        if (data?.isComplete || data?.paymentStatus === "COMPLETED") {
          clearCart();
          const thankYou = new URL("/checkout/thank-you", window.location.origin);
          thankYou.searchParams.set("orderId", orderId);
          thankYou.searchParams.set("status", "success");
          if (data.orderNumber ?? orderNumber) {
            thankYou.searchParams.set("orderNumber", data.orderNumber ?? orderNumber ?? "");
          }
          router.replace(`${thankYou.pathname}${thankYou.search}`);
          return;
        }
      } catch {
        // ignore polling failures and retry
      }

      if (!cancelled) {
        setTimeout(poll, 1500);
      }
    };

    const timer = setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, orderId, orderNumber, trackingId, clearCart, router]);

  return null;
}
