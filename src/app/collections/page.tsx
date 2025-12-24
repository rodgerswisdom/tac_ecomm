"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductFilters, FilterState } from "@/components/ProductFilters";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { QuickViewModal } from "@/components/QuickViewModal";
import { ProductComparison } from "@/components/ProductComparison";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ProductCardData } from "@/components/ProductCard";
import { featuredProducts } from "@/data/content";

const allProducts: ProductCardData[] = [...featuredProducts];
const PRODUCTS_PER_PAGE = 12;

export default function CollectionsPage() {
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    priceRange: null,
    materials: [],
    origin: [],
    sortBy: "newest",
  });

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardData | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  // Get available filter options
  const availableMaterials = useMemo(() => {
    const materials = new Set<string>();
    allProducts.forEach((product) => {
      product.materials.forEach((material) => materials.add(material));
    });
    return Array.from(materials).sort();
  }, []);

  const availableOrigins = useMemo(() => {
    const origins = new Set<string>();
    allProducts.forEach((product) => {
      if (product.origin) origins.add(product.origin);
    });
    return Array.from(origins).sort();
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by category
    if (filters.category !== "all") {
      filtered = filtered.filter((product) => {
        switch (filters.category) {
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

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter((product) => {
        if (max === Infinity) {
          return product.price >= min;
        }
        return product.price >= min && product.price <= max;
      });
    }

    // Filter by materials
    if (filters.materials.length > 0) {
      filtered = filtered.filter((product) =>
        filters.materials.some((material) =>
          product.materials.some((m) =>
            m.toLowerCase().includes(material.toLowerCase())
          )
        )
      );
    }

    // Filter by origin
    if (filters.origin.length > 0) {
      filtered = filtered.filter((product) =>
        filters.origin.includes(product.origin)
      );
    }

    // Sort products
    let sorted = [...filtered];
    switch (filters.sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.sort((a, b) => b.id - a.id);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Default to newest if unknown sort option
        sorted.sort((a, b) => b.id - a.id);
        break;
    }

    return sorted;
  }, [filters]);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(PRODUCTS_PER_PAGE);
  }, [filters]);

  // Products to display (paginated)
  const displayedProducts = useMemo(
    () => filteredAndSortedProducts.slice(0, displayedCount),
    [filteredAndSortedProducts, displayedCount]
  );

  const hasMore = displayedCount < filteredAndSortedProducts.length;

  // Load more products
  const loadMore = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayedCount((prev) => prev + PRODUCTS_PER_PAGE);
      setIsLoading(false);
    }, 300);
  }, []);


  // Handle comparison toggle
  const handleComparisonToggle = useCallback((productId: number, isSelected: boolean) => {
    setSelectedProducts((prev) => {
      if (isSelected) {
        return prev.includes(productId) ? prev : [...prev, productId];
      }
      return prev.filter((id) => id !== productId);
    });
  }, []);

  const handleRemoveFromComparison = useCallback((productId: number) => {
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
  }, []);

  const handleClearComparison = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  // Handle quick view
  const handleQuickView = useCallback((product: ProductCardData) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);

  // Get selected products data
  const selectedProductsData = useMemo(
    () =>
      allProducts.filter((product) => selectedProducts.includes(product.id)),
    [selectedProducts]
  );

  // Handle filter removal
  const handleRemoveFilter = useCallback(
    (type: keyof FilterState, value?: any) => {
      setFilters((prev) => {
        const newFilters = { ...prev };
        if (type === "materials" || type === "origin") {
          (newFilters[type] as string[]) = value || [];
        } else {
          (newFilters[type] as any) = value;
        }
        return newFilters;
      });
    },
    []
  );

  const handleClearAllFilters = useCallback(() => {
    setFilters({
      category: "all",
      priceRange: null,
      materials: [],
      origin: [],
      sortBy: "newest",
    });
  }, []);

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

      {/* Filters and Controls Section */}
      <section className="section-spacing bg-white pt-0">
        <div className="gallery-container">
          {/* Desktop: Filters on Left, Products on Right */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Filters Sidebar - Left Side */}
            <aside className="w-full lg:w-64 lg:flex-shrink-0">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableMaterials={availableMaterials}
                availableOrigins={availableOrigins}
                resultsCount={filteredAndSortedProducts.length}
                totalCount={allProducts.length}
              />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Results Count and Sort */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-brand-umber/70">
                    Showing <span className="font-semibold text-brand-umber">{displayedProducts.length}</span> of{" "}
                    <span className="font-semibold text-brand-umber">{filteredAndSortedProducts.length}</span> products
                  </p>
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
                    }
                    className="w-full rounded-lg border border-brand-teal/20 bg-white px-4 py-2 text-sm text-brand-umber focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
                  >
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              <ActiveFilterChips
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />

              {/* Products Grid - 3 columns desktop, 2 columns mobile */}
              {displayedProducts.length > 0 ? (
                <>
                  <motion.div
                    className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnimatePresence mode="popLayout">
                      {displayedProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          layout
                        >
                          <ProductCard
                            product={product}
                            isSelectedForComparison={selectedProducts.includes(
                              product.id
                            )}
                            onComparisonToggle={handleComparisonToggle}
                            onQuickView={handleQuickView}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-12 flex justify-center">
                      <Button
                        onClick={loadMore}
                        disabled={isLoading}
                        variant="outline"
                        size="lg"
                        className="min-w-[200px]"
                      >
                        {isLoading ? "Loading..." : "Load More Products"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-16 text-center">
                  <h3 className="mb-4 font-heading text-2xl text-brand-umber">
                    No products found
                  </h3>
                  <p className="mb-6 text-brand-umber/70">
                    Try adjusting your filters.
                  </p>
                  <Button onClick={handleClearAllFilters}>Clear All Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />

      {/* Product Comparison Bar */}
      <ProductComparison
        selectedProducts={selectedProductsData}
        onRemove={handleRemoveFromComparison}
        onClear={handleClearComparison}
      />

      {/* Add bottom padding when comparison bar is visible */}
      {selectedProducts.length > 0 && <div className="h-24" />}

      <Footer />
    </main>
  );
}
