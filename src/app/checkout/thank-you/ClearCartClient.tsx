"use client"

import { useEffect } from "react"
import { useCart } from "@/contexts/CartContext"

type ClearCartClientProps = {
  active: boolean
}

export function ClearCartClient({ active }: ClearCartClientProps) {
  const { clearCart } = useCart()

  useEffect(() => {
    if (active) {
      clearCart()
    }
  }, [active, clearCart])

  return null
}
