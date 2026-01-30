import React from "react";
import { useCart } from "@/contexts/CartContext";

export function OrderSummarySidebar() {
  const { cart, getCartTotal, getCartItemCount } = useCart();

  return (
    <aside className="w-full md:w-80 bg-muted p-4 rounded-lg shadow-md">
      <h3 className="font-semibold mb-4">Order Summary</h3>
      <ul className="mb-4 text-sm">
        {cart.map(item => (
          <li key={item.id} className="flex justify-between">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-semibold">
        <span>Subtotal</span>
        <span>${getCartTotal().toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs mt-2 text-muted-foreground">
        <span>Items</span>
        <span>{getCartItemCount()}</span>
      </div>
    </aside>
  );
}
