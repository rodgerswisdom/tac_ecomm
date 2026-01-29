import React from "react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

export function CartStep() {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();

  if (cart.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Your cart is empty.</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Cart Review</h2>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Product</th>
            <th className="py-2 text-left">Price</th>
            <th className="py-2 text-left">Quantity</th>
            <th className="py-2 text-left">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id} className="border-b last:border-b-0">
              <td className="py-2 flex items-center gap-3">
                <Image src={item.image} alt={item.name} width={48} height={48} className="rounded" />
                <span>{item.name}</span>
              </td>
              <td className="py-2">${item.price.toFixed(2)}</td>
              <td className="py-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateQuantity(item.id, Number(e.target.value))}
                  className="w-16 border rounded px-2 py-1"
                />
              </td>
              <td className="py-2">${(item.price * item.quantity).toFixed(2)}</td>
              <td className="py-2">
                <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right font-semibold text-lg">
        Subtotal: ${getCartTotal().toFixed(2)}
      </div>
    </div>
  );
}
