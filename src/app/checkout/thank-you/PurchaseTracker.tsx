'use client';

import { useEffect } from 'react';
import { trackPurchase } from '@/lib/analytics';

interface PurchaseTrackerProps {
  orderId: string;
  orderTotal: number;
  orderTax?: number;
  orderShipping?: number;
  orderCurrency?: string;
  orderItems: Array<{
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    originalPrice?: number;
    category?: string;
  }>;
  couponCode?: string;
}

/**
 * Client component to track purchase completion in Google Analytics
 * Only fires once when the component mounts with a successful order
 */
export function PurchaseTracker({
  orderId,
  orderTotal,
  orderTax,
  orderShipping,
  orderCurrency,
  orderItems,
  couponCode,
}: PurchaseTrackerProps) {
  useEffect(() => {
    // Track the purchase event
    trackPurchase({
      id: orderId,
      total: orderTotal,
      tax: orderTax,
      shipping: orderShipping,
      currency: orderCurrency,
      items: orderItems,
      coupon: couponCode,
    });
  }, []); // Only fire once on mount

  return null; // This component doesn't render anything
}

