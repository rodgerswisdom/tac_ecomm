"use client";

import React, { useEffect, useState } from "react";
import { ProductCard, ProductCardData } from "@/components/ProductCard";
import { useSession } from "next-auth/react";

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
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {loading ? (
        <div>Loading...</div>
      ) : wishlist.length === 0 ? (
        <div className="text-muted-foreground">Your wishlist is empty.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
