"use client"

import { useEffect } from "react"
import { useRef } from "react"
import { useCart } from "@/contexts/CartContext"

type ClearCartClientProps = {
  active: boolean
}

export function ClearCartClient({ active }: ClearCartClientProps) {
  const { clearCart } = useCart()
  const hasClearedRef = useRef(false)

  useEffect(() => {
    if (!active) {
      hasClearedRef.current = false
      return
    }

    if (hasClearedRef.current) return

    hasClearedRef.current = true
    clearCart()
  }, [active, clearCart])

  return null
}
