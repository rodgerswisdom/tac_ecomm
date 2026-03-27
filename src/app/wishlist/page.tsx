"use client";

import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardData } from "@/types/product";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";

export default function WishlistPage() {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      setLoading(true);
      if (session?.user) {
        // Logged-in: fetch from API
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        setWishlist(data.wishlist?.map((w: { product: ProductCardData }) => w.product) || []);
      } else {
        // Guest: fetch from localStorage
        const ids = JSON.parse(localStorage.getItem("tac-wishlist") || "[]");
        if (ids.length) {
          const res = await fetch(`/api/products?ids=${ids.join(",")}`);
          const data = await res.json();
          setWishlist(data.products || []);
        } else {
          setWishlist([]);
        }
      }
      setLoading(false);
    }
    fetchWishlist();
  }, [session]);

  return (
    <main className="min-h-screen bg-brand-beige bg-texture-linen">
      <Navbar />
      <section className="nav-clearance section-spacing">
        <div className="gallery-container max-w-5xl">
          <h1 className="mobile-page-title font-heading text-brand-umber mb-6">My Wishlist</h1>
          {loading ? (
            <div className="text-brand-umber/70">Loading...</div>
          ) : wishlist.length === 0 ? (
            <div className="text-brand-umber/70">Your wishlist is empty.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
