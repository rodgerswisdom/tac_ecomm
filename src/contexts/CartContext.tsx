'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface CartItem {
  /** Product id (string cuid from DB); used as key and for API sync */
  id: number | string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  size?: string
  color?: string
  /** Preserved from API so we always send valid productId when saving */
  productId?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: number | string) => void
  updateQuantity: (id: number | string, quantity: number) => void
  clearCart: () => void
  isInCart: (id: number | string) => boolean
  getCartTotal: () => number
  getCartItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasSyncedServerCart, setHasSyncedServerCart] = useState(false)
  const { data: session } = useSession()
  const user = session?.user
  const userEmail = user?.email ?? null

  // Fetch user's server cart (production-ready)
  const fetchUserCart = async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' })
      if (!res.ok) return []
      const data = await res.json()
      // API returns { cart: [...] }
      if (Array.isArray(data.cart)) {
        // Map API cart items; keep productId (string) as id so we send valid FK when saving
        return data.cart.map((item: Partial<CartItem> & { product?: Partial<CartItem>; productId?: string | number }) => {
          const productId = item.productId != null ? String(item.productId) : (item.id != null ? String(item.id) : '')
          return {
            id: productId,
            productId,
            name: item.product?.name ?? item.name ?? '',
            price: Number(item.product?.price ?? item.price) ?? 0,
            originalPrice: item.product?.originalPrice ?? item.originalPrice,
            image: item.product?.image ?? item.image ?? '',
            quantity: Number(item.quantity) || 1,
            size: item.size,
            color: item.color
          }
        })
      }
      return []
    } catch {
      return []
    }
  }

  // Save merged cart to server (production-ready)
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
            variantId: null
          }))
        })
      })
    } catch {
      // Optionally handle error
    }
  }

  // Load cart from localStorage on mount (for guests)
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      try {
        const savedCart = localStorage.getItem('tac-cart')
        if (savedCart) {
          setCart(JSON.parse(savedCart))
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      } finally {
        setIsLoaded(true)
      }
    }
  }, [user])

  // Reset sync flag whenever the authenticated user changes
  useEffect(() => {
    setHasSyncedServerCart(false)
  }, [userEmail])

  // On login only: merge local cart with server cart and save (not on every cart change — avoids blink)
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

  // Save cart to localStorage whenever it changes (for guests)
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined' && !user) {
      try {
        localStorage.setItem('tac-cart', JSON.stringify(cart))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [cart, isLoaded, user])

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      const next = existingItem
        ? prevCart.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        : [...prevCart, { ...item, quantity: 1 }]
      if (user) queueMicrotask(() => saveUserCart(next))
      return next
    })
    toast.success('Added to cart', {
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

  const removeFromCart = (id: number | string) => {
    setCart(prevCart => {
      const next = prevCart.filter(item => item.id !== id)
      if (user) queueMicrotask(() => saveUserCart(next))
      return next
    })
  }

  const updateQuantity = (id: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prevCart => {
      const next = prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      if (user) queueMicrotask(() => saveUserCart(next))
      return next
    })
  }

  const clearCart = () => {
    setCart([])
    if (user) queueMicrotask(() => saveUserCart([]))
  }

  const isInCart = (id: number | string) => {
    return cart.some(item => item.id === id)
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
  const mergedMap = new Map<CartItem['id'], CartItem>()
  serverCart.forEach(item => {
    mergedMap.set(item.id, { ...item })
  })

  let needsSync = false

  localCart.forEach(item => {
    const existing = mergedMap.get(item.id)
    if (!existing) {
      mergedMap.set(item.id, { ...item })
      needsSync = true
      return
    }

    if (item.quantity > existing.quantity) {
      mergedMap.set(item.id, { ...existing, quantity: item.quantity })
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