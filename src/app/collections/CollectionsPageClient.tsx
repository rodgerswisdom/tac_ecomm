"use client";

import { useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ProductFilters, FilterState } from "@/components/ProductFilters";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { ProductCardData } from "@/types/product";
import type { CategoryOption } from "@/components/ProductFilters";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const PRODUCTS_PER_PAGE = 12;

function matchesCollection(
  product: ProductCardData,
  categorySlug: string,
) {
  if (categorySlug === "corporate-gifts") {
    return Boolean(product.isCorporateGift);
  }

  return product.category === categorySlug;
}

function resolveInitialCategory(
  slug: string | undefined,
  categories: CategoryOption[],
  collections: CategoryOption[],
) {
  if (!slug) return "all";
  const options = [...categories, ...collections];
  return options.some((option) => option.slug === slug) ? slug : "all";
}

function buildShopUrl(basePath: string, filters: FilterState, searchQuery: string) {
  const params = new URLSearchParams();
  if (filters.category !== "all") params.set("category", filters.category);
  if (searchQuery.trim()) params.set("q", searchQuery.trim());
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

interface CollectionsPageClientProps {
  initialProducts: ProductCardData[];
  categories: CategoryOption[];
  collections: CategoryOption[];
  initialCategory?: string;
  initialSearch?: string;
  basePath?: string;
  pageTitle?: string;
  pageDescription?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  footer?: ReactNode;
}

export function CollectionsPageClient({
  initialProducts,
  categories,
  collections,
  initialCategory,
  initialSearch,
  basePath = "/collections",
  pageTitle = "Shop Collections",
  pageDescription,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your filters.",
  footer,
}: CollectionsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allProducts = useMemo(() => initialProducts, [initialProducts]);

  const [searchQuery, setSearchQuery] = useState(initialSearch ?? "");
  const [filters, setFilters] = useState<FilterState>(() => ({
    category: resolveInitialCategory(initialCategory, categories, collections),
    priceRange: null,
    materials: [],
  }));

  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "newest" | "price-asc" | "price-desc">("featured");

  const syncUrl = useCallback(
    (nextFilters: FilterState, nextSearch: string) => {
      router.replace(buildShopUrl(basePath, nextFilters, nextSearch), { scroll: false });
    },
    [basePath, router],
  );

  useEffect(() => {
    const categoryParam = searchParams.get("category") ?? undefined;
    const searchParam = searchParams.get("q") ?? "";
    const nextCategory = resolveInitialCategory(categoryParam, categories, collections);

    setSearchQuery(searchParam);
    setFilters((prev) => ({ ...prev, category: nextCategory }));
    setDisplayedCount(PRODUCTS_PER_PAGE);
  }, [searchParams, categories, collections]);

  const availableMaterials = useMemo(() => {
    const materials = new Set<string>();
    allProducts.forEach((product) => {
      product.materials.forEach((material) => materials.add(material));
    });
    return Array.from(materials).sort();
  }, [allProducts]);

  const handleFiltersChange = useCallback(
    (nextFilters: FilterState) => {
      setFilters(nextFilters);
      setDisplayedCount(PRODUCTS_PER_PAGE);
      syncUrl(nextFilters, searchQuery);
    },
    [searchQuery, syncUrl],
  );

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    if (filters.category !== "all") {
      filtered = filtered.filter((product) =>
        matchesCollection(product, filters.category),
      );
    }

    if (searchQuery.trim()) {
      const term = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.materials.some((material) => material.toLowerCase().includes(term)) ||
          (product.origin?.toLowerCase().includes(term) ?? false),
      );
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter((product) => {
        if (max === Infinity) {
          return product.price >= min;
        }
        return product.price >= min && product.price <= max;
      });
    }

    if (filters.materials.length > 0) {
      filtered = filtered.filter((product) =>
        filters.materials.some((material) =>
          product.materials.some((m) =>
            m.toLowerCase().includes(material.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }, [allProducts, filters, searchQuery]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    }
    // "featured" keeps original order
    return sorted;
  }, [filteredProducts, sortBy]);

  const displayedProducts = useMemo(
    () => sortedProducts.slice(0, displayedCount),
    [sortedProducts, displayedCount]
  );

  const hasMore = displayedCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayedCount((prev) => prev + PRODUCTS_PER_PAGE);
      setIsLoading(false);
    }, 300);
  }, []);

  const handleRemoveFilter = useCallback(
    (type: keyof FilterState, value?: FilterState[keyof FilterState]) => {
      setFilters((prev) => {
        let next: FilterState = prev;

        if (type === "materials") {
          next = {
            ...prev,
            materials: (value ?? []) as string[],
          };
        } else if (type === "priceRange") {
          next = {
            ...prev,
            priceRange: (value ?? null) as [number, number] | null,
          };
        } else if (type === "category") {
          next = {
            ...prev,
            category: (value ?? "all") as string,
          };
        }

        setDisplayedCount(PRODUCTS_PER_PAGE);
        syncUrl(next, searchQuery);
        return next;
      });
    },
    [searchQuery, syncUrl],
  );

  const handleClearAllFilters = useCallback(() => {
    setDisplayedCount(PRODUCTS_PER_PAGE);
    setSearchQuery("");
    const cleared: FilterState = {
      category: "all",
      priceRange: null,
      materials: [],
    };
    setFilters(cleared);
    syncUrl(cleared, "");
  }, [syncUrl]);

  return (
    <ErrorBoundary>
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />

      <section className="nav-clearance section-spacing">
        <div className="gallery-container text-center">
          <h1 className="font-heading text-3xl sm:text-4xl text-brand-umber md:text-5xl">
            {pageTitle}
          </h1>
          {pageDescription ? (
            <p className="mx-auto mt-3 max-w-2xl text-sm text-brand-umber/70 sm:text-base">
              {pageDescription}
            </p>
          ) : null}
        </div>
      </section>

      <section className="section-spacing bg-white pt-0">
        <div className="gallery-container">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            {/* Mobile filters toggle */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-brand-teal/30 bg-white px-4 py-2 text-sm font-medium text-brand-umber shadow-sm transition hover:border-brand-teal/60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                {filtersOpen ? "Hide Filters" : "Show Filters"}
              </button>
              <span aria-live="polite" className="text-xs text-brand-umber/60">{filteredProducts.length} products</span>
            </div>
            <aside className={`w-full lg:w-72 lg:flex-shrink-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
              <ProductFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableMaterials={availableMaterials}
                categories={categories}
                collections={collections}
                products={allProducts}
              />
            </aside>

            <div className="flex-1">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p role="status" aria-live="polite" className="text-sm text-brand-umber/70">
                  Showing <span className="font-semibold text-brand-umber">1–{displayedProducts.length}</span> of{" "}
                  <span className="font-semibold text-brand-umber">{filteredProducts.length}</span> products
                </p>
                <label className="flex items-center gap-2 text-sm text-brand-umber/70">
                  <span className="shrink-0">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as typeof sortBy);
                      setDisplayedCount(PRODUCTS_PER_PAGE);
                    }}
                    className="rounded-lg border border-brand-teal/25 bg-white px-3 py-1.5 text-sm text-brand-umber focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </label>
              </div>

              <ActiveFilterChips
                filters={filters}
                categories={categories}
                collections={collections}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />

              {displayedProducts.length > 0 ? (
                <>
                  <motion.div
                    className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-2"
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
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

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
                    {emptyTitle}
                  </h3>
                  <p className="mb-6 text-brand-umber/70">
                    {emptyDescription}
                  </p>
                  <Button onClick={handleClearAllFilters}>Clear All Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {footer}

    </main>
    </ErrorBoundary>
  );
}
