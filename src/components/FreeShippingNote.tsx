"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { formatFreeShippingThreshold } from "@/lib/delivery";

type FreeShippingNoteProps = {
  className?: string;
};

export function FreeShippingNote({ className }: FreeShippingNoteProps) {
  const { formatPrice } = useCurrency();

  return (
    <p className={className}>
      Free shipping applies to orders within Kenya worth{" "}
      {formatFreeShippingThreshold(formatPrice)} or more.
    </p>
  );
}
