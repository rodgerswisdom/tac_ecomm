'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { trackAddToCart, trackRemoveFromCart, trackBeginCheckout } from '@/lib/analytics'
import { buildCartLineKey, formatProductImageLabel } from '@/lib/product-image-selection'

export interface CartItem {
  /** Product id (string cuid from DB) */
  id: number | string
  /** Stable line identity for merge/remove/qty */
  cartLineKey: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  size?: string
  color?: string
  productId?: string
  productImageId?: string
  selectedImageLabel?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity' | 'cartLineKey'> & { cartLineKey?: string }) => void
  addItemsToCart: (items: Array<Omit<CartItem, 'quantity' | 'cartLineKey'> & { cartLineKey?: string; quantity: number }>) => void
  removeFromCart: (cartLineKey: string) => void
  updateQuantity: (cartLineKey: string, quantity: number) => void
  clearCart: () => void
  isInCart: (cartLineKey: string) => boolean
  getCartTotal: () => number
  getCartItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

function normalizeCartItem(item: Omit<CartItem, 'quantity' | 'cartLineKey'> & { cartLineKey?: string }): Omit<CartItem, 'quantity'> {
  const productId = item.productId ?? String(item.id)
  const cartLineKey = item.cartLineKey ?? buildCartLineKey(productId, item.productImageId)
  return {
    ...item,
    id: productId,
    productId,
    cartLineKey,
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasSyncedServerCart, setHasSyncedServerCart] = useState(false)
  const hasClearedGuestCartRef = useRef(false)
  const isHydratingGuestCartRef = useRef(false)
  const { data: session } = useSession()
  const user = session?.user
  const userEmail = user?.email ?? null

  const fetchUserCart = async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' })
      if (!res.ok) return []
      const data = await res.json()
      if (Array.isArray(data.cart)) {
        return data.cart.map((item: {
          productId?: string | number
          quantity?: number
          productImageId?: string | null
          product?: {
            name?: string
            price?: number
            comparePrice?: number | null
            images?: Array<{ id: string; url: string; order: number }>
          }
          productImage?: { id: string; url: string; alt?: string | null; order: number } | null
          selectedImageLabel?: string
        }) => {
          const productId = item.productId != null ? String(item.productId) : ''
          const productImageId = item.productImageId ?? undefined
          const sortedImages = [...(item.product?.images ?? [])].sort((a, b) => a.order - b.order)
          const fallbackImage = sortedImages[0]?.url ?? ''
          const imageUrl = item.productImage?.url ?? fallbackImage
          const imageIndex = productImageId
            ? sortedImages.findIndex((image) => image.id === productImageId)
            : -1
          const selectedImageLabel =
            item.selectedImageLabel ??
            (imageIndex >= 0
              ? formatProductImageLabel(
                  {
                    id: sortedImages[imageIndex].id,
                    url: sortedImages[imageIndex].url,
                    order: sortedImages[imageIndex].order,
                  },
                  imageIndex,
                )
              : undefined)

          return {
            id: productId,
            productId,
            cartLineKey: buildCartLineKey(productId, productImageId),
            productImageId,
            selectedImageLabel,
            name: item.product?.name ?? '',
            price: Number(item.product?.price) || 0,
            originalPrice: item.product?.comparePrice ?? undefined,
            image: imageUrl,
            quantity: Number(item.quantity) || 1,
          }
        })
      }
      return []
    } catch {
      return []
    }
  }

  const saveUserCart = async (mergedCart: CartItem[]) => {
    try {
      const productId = (item: CartItem) => item.productId ?? (typeof item.id === 'string' ? item.id : null)
      const validItems = mergedCart.filter(item => productId(item) && String(productId(item)).length > 1)
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cartItems: validItems.map(item => ({
            productId: productId(item),
            quantity: item.quantity,
            variantId: null,
            productImageId: item.productImageId ?? null,
          }))
        })
      })
    } catch {
      // Optionally handle error
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      if (hasClearedGuestCartRef.current) {
        setCart([])
        setIsLoaded(true)
        return
      }

      isHydratingGuestCartRef.current = true
      try {
        const savedCart = localStorage.getItem('tac-cart')
        if (savedCart && !hasClearedGuestCartRef.current) {
          const parsed = JSON.parse(savedCart) as Array<Partial<CartItem>>
          setCart(
            parsed.map((item) => {
              const normalized = normalizeCartItem({
                id: item.id ?? item.productId ?? '',
                productId: item.productId ?? (item.id != null ? String(item.id) : undefined),
                cartLineKey: item.cartLineKey,
                productImageId: item.productImageId,
                selectedImageLabel: item.selectedImageLabel,
                name: item.name ?? '',
                price: Number(item.price) || 0,
                originalPrice: item.originalPrice,
                image: item.image ?? '',
                size: item.size,
                color: item.color,
              })
              return { ...normalized, quantity: Number(item.quantity) || 1 }
            }),
          )
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      } finally {
        isHydratingGuestCartRef.current = false
        setIsLoaded(true)
      }
    }
  }, [user])

  useEffect(() => {
    setHasSyncedServerCart(false)
  }, [userEmail])

  useEffect(() => {
    if (!userEmail || !isLoaded || hasSyncedServerCart) return
    let cancelled = false
    ;(async () => {
      const serverCart = await fetchUserCart()
      if (cancelled) return

      let mergedSnapshot: CartItem[] = serverCart
      let needsSync = false

      setCart(prev => {
        const result = mergeServerAndLocalCarts(serverCart, prev)
        mergedSnapshot = result.merged
        needsSync = result.needsSync
        return result.merged
      })

      if (cancelled) return

      if (needsSync) {
        queueMicrotask(() => saveUserCart(mergedSnapshot))
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('tac-cart')
      }

      setHasSyncedServerCart(true)
    })()

    return () => {
      cancelled = true
    }
  }, [userEmail, isLoaded, hasSyncedServerCart])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined' && !user) {
      if (isHydratingGuestCartRef.current) return

      if (hasClearedGuestCartRef.current && cart.length === 0) {
        localStorage.removeItem('tac-cart')
        return
      }

      try {
        localStorage.setItem('tac-cart', JSON.stringify(cart))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [cart, isLoaded, user])

  const showAddToCartToast = (designCount: number, itemCount: number) => {
    const message =
      designCount > 1
        ? `Added ${designCount} designs (${itemCount} items)`
        : itemCount > 1
          ? `Added ${itemCount} items to cart`
          : 'Added to cart'

    toast.success(message, {
      action: {
        label: 'Checkout',
        onClick: () => { window.location.href = '/checkout' }
      },
      cancel: {
        label: 'View cart',
        onClick: () => { window.location.href = '/cart' }
      }
    })
  }

  const addItemsToCart = (
    items: Array<Omit<CartItem, 'quantity' | 'cartLineKey'> & { cartLineKey?: string; quantity: number }>,
  ) => {
    const validItems = items.filter((item) => item.quantity > 0)
    if (validItems.length === 0) return

    if (!user) {
      hasClearedGuestCartRef.current = false
    }

    const normalizedItems = validItems.map((item) => ({
      normalized: normalizeCartItem(item),
      quantity: item.quantity,
    }))

    setCart((prevCart) => {
      const next = [...prevCart]

      normalizedItems.forEach(({ normalized, quantity }) => {
        const existingIndex = next.findIndex(
          (cartItem) => cartItem.cartLineKey === normalized.cartLineKey,
        )

        if (existingIndex >= 0) {
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + quantity,
          }
        } else {
          next.push({ ...normalized, quantity })
        }
      })

      if (user) queueMicrotask(() => saveUserCart(next))

      normalizedItems.forEach(({ normalized, quantity }) => {
        trackAddToCart(
          {
            id: normalized.id,
            name: normalized.name,
            price: normalized.price,
            originalPrice: normalized.originalPrice,
          },
          quantity,
        )
      })

      return next
    })

    const itemCount = normalizedItems.reduce((total, item) => total + item.quantity, 0)
    showAddToCartToast(normalizedItems.length, itemCount)
  }

  const addToCart = (item: Omit<CartItem, 'quantity' | 'cartLineKey'> & { cartLineKey?: string }) => {
    addItemsToCart([{ ...item, quantity: 1 }])
  }

  const removeFromCart = (cartLineKey: string) => {
    setCart(prevCart => {
      const itemToRemove = prevCart.find(item => item.cartLineKey === cartLineKey)

      const next = prevCart.filter(item => item.cartLineKey !== cartLineKey)
      if (user) queueMicrotask(() => saveUserCart(next))

      if (itemToRemove) {
        trackRemoveFromCart(itemToRemove, itemToRemove.quantity)
      }

      return next
    })
  }

  const updateQuantity = (cartLineKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartLineKey)
      return
    }
    setCart(prevCart => {
      const next = prevCart.map(item =>
        item.cartLineKey === cartLineKey ? { ...item, quantity } : item
      )
      if (user) queueMicrotask(() => saveUserCart(next))
      return next
    })
  }

  const clearCart = () => {
    if (typeof window !== 'undefined') {
      hasClearedGuestCartRef.current = true
      localStorage.removeItem('tac-cart')
    }

    setCart([])
    queueMicrotask(() => saveUserCart([]))
  }

  const isInCart = (cartLineKey: string) => {
    return cart.some(item => item.cartLineKey === cartLineKey)
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const value: CartContextType = {
    cart,
    addToCart,
    addItemsToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartTotal,
    getCartItemCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function mergeServerAndLocalCarts(serverCart: CartItem[], localCart: CartItem[]) {
  const mergedMap = new Map<string, CartItem>()
  serverCart.forEach(item => {
    mergedMap.set(item.cartLineKey, { ...item })
  })

  let needsSync = false

  localCart.forEach(item => {
    const lineKey = item.cartLineKey ?? buildCartLineKey(String(item.productId ?? item.id), item.productImageId)
    const normalized = { ...item, cartLineKey: lineKey }
    const existing = mergedMap.get(lineKey)
    if (!existing) {
      mergedMap.set(lineKey, normalized)
      needsSync = true
      return
    }

    if (normalized.quantity > existing.quantity) {
      mergedMap.set(lineKey, { ...existing, quantity: normalized.quantity })
      needsSync = true
    }
  })

  return { merged: Array.from(mergedMap.values()), needsSync }
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
