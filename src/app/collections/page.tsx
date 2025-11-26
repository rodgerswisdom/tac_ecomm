"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CategoryDropdown, SortDropdown } from "@/components/ui/custom-dropdown";
import { featuredProducts } from "@/data/content";

const allProducts = [...featuredProducts];

export default function CollectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => {
        switch (selectedCategory) {
          case "necklaces":
            return product.category === "necklaces";
          case "rings":
            return product.category === "rings";
          case "bracelets":
            return product.category === "bracelets";
          case "earrings":
            return product.category === "earrings";
          case "sets":
            return product.productType === "matching-sets" || product.isCorporateGift;
          default:
            return true;
        }
      });
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "newest":
        return [...filtered].sort((a, b) => b.id - a.id);
      case "rating":
        // For now, just return as-is since we don't have ratings
        return filtered;
      default:
        return filtered;
    }
  }, [selectedCategory, sortBy]);


  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      
      {/* Hero Section */}
      <section className="section-spacing pb-0">
        <div className="gallery-container text-center">
          <h1 className="font-heading text-4xl text-brand-umber md:text-5xl">
            Shop Collections
          </h1>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="section-spacing bg-white pt-0">
        <div className="gallery-container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Filter */}
            <div className="w-full sm:w-64">
              <CategoryDropdown
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>

            {/* Sort Control */}
            <div className="w-full sm:w-48">
              <SortDropdown
                value={sortBy}
                onChange={setSortBy}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-spacing bg-white pt-0">
        <div className="gallery-container">
          {filteredAndSortedProducts.length > 0 ? (
            <motion.div
              className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {filteredAndSortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <h3 className="font-heading text-2xl text-brand-umber mb-4">
                No products found
              </h3>
              <p className="text-brand-umber/70 mb-6">
                Try adjusting your filters.
              </p>
              <Button
                onClick={() => {
                  setSelectedCategory("all");
                  setSortBy("featured");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
