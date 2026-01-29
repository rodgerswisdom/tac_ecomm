'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  size?: string
  color?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  isInCart: (id: number) => boolean
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
  const { data: session } = useSession()
  const user = session?.user

  // Fetch user's server cart (production-ready)
  const fetchUserCart = async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' })
      if (!res.ok) return []
      const data = await res.json()
      // API returns { cart: [...] }
      if (Array.isArray(data.cart)) {
        // Map API cart items to CartItem shape if needed
        return data.cart.map((item: Partial<CartItem> & { product?: Partial<CartItem>; productId?: number; }) => ({
          id: item.productId || item.id,
          name: item.product?.name || item.name,
          price: item.product?.price || item.price,
          originalPrice: item.product?.originalPrice,
          image: item.product?.image || item.image,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        }))
      }
      return []
    } catch {
      return []
    }
  }

  // Save merged cart to server (production-ready)
  const saveUserCart = async (mergedCart: CartItem[]) => {
    try {
      // API expects { cartItems: [...] }
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cartItems: mergedCart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            variantId: null // Add variantId if your model supports it
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

  // On login, merge local cart with server cart
  useEffect(() => {
    if (user && isLoaded) {
      (async () => {
        const serverCart = await fetchUserCart()
        // Merge logic: combine items, sum quantities for same id
        const merged: CartItem[] = [...cart]
        serverCart.forEach((item: CartItem) => {
          const existing = merged.find(i => i.id === item.id)
          if (existing) {
            existing.quantity += item.quantity
          } else {
            merged.push(item)
          }
        })
        setCart(merged)
        await saveUserCart(merged)
        localStorage.removeItem('tac-cart')
      })()
    }
  }, [user, isLoaded, cart])

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
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const isInCart = (id: number) => {
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

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
