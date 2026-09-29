"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { patternAssets } from "@/lib/patterns";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { ProductCardData } from "@/types/product";

interface CartPageClientProps {
  recommendations: ProductCardData[];
}

export function CartPageClient({ recommendations }: CartPageClientProps) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    addToCart,
  } = useCart();
  const { formatPrice } = useCurrency();

  const subtotal = getCartTotal();
  const total = subtotal;

  const hasItems = cart.length > 0;

  const cartItems = useMemo(() => cart.map((item) => ({ ...item })), [cart]);
  const fallbackProductImage = patternAssets.kubaGrid;

  const handleAddRecommendation = (product: ProductCardData) => {
    if (product.isOutOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden page-surface">
      <Navbar />
      <section className={`nav-clearance section-spacing ${hasItems ? "pb-28 lg:pb-0" : "pb-0"}`}>
        <div className="gallery-container flex flex-col gap-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-3">
                <span className="caps-spacing text-xs text-brand-teal">
                  Your Gallery Tray
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl text-brand-umber md:text-5xl lg:text-6xl">
                  Cart — curated with intention
                </h1>
              </div>
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/collections">Continue Browsing</Link>
                </Button>
                {hasItems && (
                  <Button
                    variant="ghost"
                    onClick={clearCart}
                    className="w-full text-brand-coral hover:text-brand-coral/90 sm:w-auto"
                  >
                    Clear Tray
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {hasItems ? (
            <div className="rounded-[2.5rem] border border-brand-teal/20 bg-white p-4 sm:p-7 lg:p-10 shadow-[0_35px_80px_rgba(74,43,40,0.14)] backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
                className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-10"
              >
                <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <h2 className="font-heading text-3xl text-brand-umber">
                    Your Items
                  </h2>
                  <p className="text-sm text-brand-umber/65">
                    {cart.length} piece{cart.length === 1 ? "" : "s"} in your cart
                  </p>
                </div>
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={`cart-${item.cartLineKey}`}
                      className="grid grid-cols-[96px_1fr] gap-4 rounded-2xl border border-brand-teal/20 bg-white p-4 shadow-[0_12px_32px_rgba(74,43,40,0.08)]"
                    >
                      <div className="relative h-24 w-24 overflow-hidden rounded-2xl">
                        <Image
                          src={item.image || fallbackProductImage}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col justify-between">
                        <div>
                          <p className="font-heading text-lg text-brand-umber line-clamp-2 break-words">{item.name}</p>
                          {item.selectedImageLabel ? (
                            <p className="text-xs text-brand-umber/55">{item.selectedImageLabel}</p>
                          ) : null}
                          <span className="text-sm text-brand-coral">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center sm:justify-between">
                          <div className="inline-flex items-center gap-3 rounded-full border border-brand-teal/25 px-3 py-1 text-sm text-brand-umber/70">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartLineKey, item.quantity - 1)}
                              className="rounded-full bg-brand-jade/40 p-1 text-brand-umber/70 transition hover:bg-brand-jade/55"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartLineKey, item.quantity + 1)}
                              className="rounded-full bg-brand-jade/40 p-1 text-brand-umber/70 transition hover:bg-brand-jade/55"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.cartLineKey)}
                            className="self-end rounded-full bg-brand-coral/10 p-2 text-brand-coral transition hover:bg-brand-coral/20 sm:self-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </div>

                {/* Summary sits beside the items on desktop so checkout is always in view. */}
                <aside
                  aria-labelledby="cart-summary-heading"
                  className="space-y-5 rounded-2xl border border-brand-teal/20 bg-brand-beige/40 p-5 lg:sticky lg:top-24 lg:p-6"
                >
                  <h2 id="cart-summary-heading" className="font-heading text-2xl text-brand-umber">
                    Order Summary
                  </h2>
                  <div className="space-y-3 text-sm text-brand-umber/70">
                    <Row label="Subtotal" value={formatPrice(subtotal)} />
                    <Row label="Shipping" value="Calculated at checkout" />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-brand-gold/40 bg-white/95 px-5 py-4">
                    <span className="caps-spacing text-sm text-brand-umber/60">
                      Total
                    </span>
                    <span className="text-2xl font-heading text-brand-coral">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button size="lg" className="w-full" asChild>
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                    <p className="caps-spacing text-center text-xs text-brand-umber/55">
                      Secure payment · Artisan thank-you awaits
                    </p>
                  </div>
                </aside>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-16"
              >
                <div className="text-center mb-8">
                  <h3 className="font-heading text-2xl text-brand-umber mb-2">
                    Complete Your Look
                  </h3>
                  <p className="text-brand-umber/70">
                    Discover pieces that complement your selection
                  </p>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((product) => (
                    <div key={product.id} className="group">
                      <div className="relative aspect-square overflow-hidden rounded-2xl mb-4">
                        <Image
                          src={product.image || fallbackProductImage}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {product.isOutOfStock && (
                          <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading text-lg text-brand-umber mb-2">
                        {product.name}
                      </h4>
                      <p className="text-sm text-brand-umber/70 mb-3">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-brand-umber">
                          {formatPrice(product.price)}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleAddRecommendation(product)} disabled={product.isOutOfStock}>
                          {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Button variant="outline" asChild>
                    <Link href="/collections">View All Collections</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
              className="rounded-[2.5rem] border border-brand-teal/20 bg-white p-8 sm:p-16 text-center shadow-[0_35px_80px_rgba(74,43,40,0.12)] backdrop-blur-sm"
            >
              <ShoppingBag className="mx-auto h-20 w-20 text-brand-gold" />
              <h2 className="mt-6 font-heading text-4xl text-brand-umber">
                Your tray is waiting.
              </h2>
              <p className="mt-4 text-sm text-brand-umber/75">
                Browse the gallery to add Maasai shukas, bronze jewellery, and modern heirlooms.
              </p>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/collections">Explore Collections</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {hasItems && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-umber/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(74,43,40,0.1)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-brand-umber/60">Total</p>
              <p className="truncate font-heading text-xl text-brand-coral">{formatPrice(total)}</p>
            </div>
            <Button size="lg" asChild className="shrink-0">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm text-brand-umber/70">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
