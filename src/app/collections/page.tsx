"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CategoryDropdown, SortDropdown } from "@/components/ui/custom-dropdown";
import { featuredProducts, featuredCollections } from "@/data/content";
import { Filter, Grid, List, X } from "lucide-react";

const capsuleEditions = featuredProducts.slice(0, 3);
const curatedContinuum = featuredProducts.slice(3);
const allProducts = [...featuredProducts];

export default function CollectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Debug logging
  console.log('Collections page state:', { selectedCategory, sortBy, viewMode });

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

  const activeFiltersCount = selectedCategory !== "all" ? 1 : 0;

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      
      {/* Hero Section */}
      <section className="section-spacing pb-0">
        <div className="gallery-container flex flex-col gap-8 text-center">
          <span className="caps-spacing text-xs text-brand-teal">
            TAC Collections
          </span>
          <h1 className="font-heading text-5xl text-brand-umber md:text-6xl">
            Enter the African Gallery Experience
          </h1>
          <p className="mx-auto max-w-3xl text-base text-brand-umber/70">
            Each curated release is treated like an exhibition — narrated with artisan histories, geographic palettes, and sustainable sourcing.
          </p>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="section-spacing bg-white pt-0">
        <div className="gallery-container">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Filter Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 rounded-full bg-brand-teal px-2 py-0.5 text-xs text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <div className="w-full sm:w-64">
                    <CategoryDropdown
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSortBy("featured");
                    }}
                    className="text-brand-umber/60 hover:text-brand-umber"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              <div className="w-48">
                <SortDropdown
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>
              
              <div className="flex rounded-lg border border-brand-umber/20 bg-white p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-brand-umber/70">
              Showing {filteredAndSortedProducts.length} of {allProducts.length} products
              {selectedCategory !== "all" && (
                <span className="ml-2">
                  in <span className="font-semibold text-brand-umber">
                    {selectedCategory === "sets" ? "Sets & Corporate Gifts" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-spacing bg-white pt-0">
        <div className="gallery-container">
          {filteredAndSortedProducts.length > 0 ? (
            <motion.div
              className={`grid gap-8 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}
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
                  className={viewMode === "list" ? "flex" : ""}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto bg-brand-jade/20 rounded-full flex items-center justify-center mb-6">
                  <Filter className="h-8 w-8 text-brand-jade" />
                </div>
                <h3 className="font-heading text-2xl text-brand-umber mb-4">
                  No products found
                </h3>
                <p className="text-brand-umber/70 mb-6">
                  Try adjusting your filters or browse our full collection.
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
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="section-spacing bg-brand-jade/10">
        <div className="gallery-container space-y-12">
          <div className="flex flex-col gap-4 text-left">
            <span className="caps-spacing text-xs text-brand-teal">
              Featured Collections
            </span>
            <h2 className="max-w-2xl font-heading text-4xl text-brand-umber">
              Explore our curated categories
            </h2>
            <p className="max-w-2xl text-brand-umber/70">
              Discover our carefully organized collections, each representing a distinct category of African craftsmanship.
            </p>
          </div>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            {featuredCollections.slice(0, 6).map((collection) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href={`/collections/${collection.slug}`}
                  className="block group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-brand-teal/20 shadow-[0_20px_40px_rgba(74,43,40,0.1)] transition-all duration-300 group-hover:shadow-[0_30px_60px_rgba(74,43,40,0.2)] group-hover:border-brand-teal/40">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/60 via-brand-umber/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <h3 className="font-heading text-xl mb-2">{collection.name}</h3>
                      <p className="text-sm opacity-90">{collection.itemCount} pieces</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="font-heading text-lg text-brand-umber group-hover:text-brand-teal transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-brand-umber/70 mt-1">
                      {collection.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
