"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Filter } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SortDropdown } from "@/components/ui/custom-dropdown";
import { CategoryCard } from "@/components/CategoryCard";
import {
  featuredCollections,
  featuredProducts,
  type CollectionCategory,
} from "@/data/content";
import { cn } from "@/lib/utils";

interface CollectionPageClientProps {
  collection: CollectionCategory;
}

type SortOption = "featured" | "price-low" | "price-high" | "newest" | "rating";

const EXCLUDED_RELATED_SLUGS = new Set(["matching-sets", "corporate-gifts"]);

export const CollectionPageClient = ({
  collection,
}: CollectionPageClientProps) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  const heroTitle = collection.heroTitle ?? collection.name;
  const heroDescription = collection.heroDescription ?? collection.description;
  const heroImage = collection.heroImage ?? collection.image;
  const longDescription = collection.longDescription ?? collection.description;
  const availableHighlights = collection.highlights ?? [];

  const baseProducts = useMemo(() => {
    const matchesCategory = featuredProducts.filter((product) => {
      if (collection.category === "sets") {
        return (
          product.productType === "matching-sets" || product.isCorporateGift
        );
      }

      return product.category === collection.category;
    });

    if (!collection.featuredProductIds?.length) {
      return matchesCategory;
    }

    const featuredOrder = new Map<number, number>();
    collection.featuredProductIds.forEach((id, index) => {
      featuredOrder.set(id, index);
    });

    return [...matchesCategory].sort((a, b) => {
      const orderA = featuredOrder.has(a.id)
        ? featuredOrder.get(a.id)!
        : Number.MAX_SAFE_INTEGER;
      const orderB = featuredOrder.has(b.id)
        ? featuredOrder.get(b.id)!
        : Number.MAX_SAFE_INTEGER;

      if (orderA === orderB) {
        return a.name.localeCompare(b.name);
      }

      return orderA - orderB;
    });
  }, [collection]);

  const subcategoryOptions = useMemo(() => {
    const productSubcategories = Array.from(
      new Set(
        baseProducts
          .map((product) => product.subcategory)
          .filter(Boolean) as string[]
      )
    );

    if (!productSubcategories.length) {
      return ["all"];
    }

    return ["all", ...productSubcategories];
  }, [baseProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let products = baseProducts;

    if (selectedSubcategory !== "all") {
      products = products.filter(
        (product) => product.subcategory === selectedSubcategory
      );
    }

    switch (sortBy) {
      case "price-low":
        return [...products].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...products].sort((a, b) => b.price - a.price);
      case "newest":
        return [...products].sort((a, b) => b.id - a.id);
      case "rating":
        return products;
      default:
        return products;
    }
  }, [baseProducts, selectedSubcategory, sortBy]);

  const relatedCollections = useMemo(() => {
    return featuredCollections
      .filter(
        (item) =>
          item.slug !== collection.slug &&
          !EXCLUDED_RELATED_SLUGS.has(item.slug)
      )
      .slice(0, 3);
  }, [collection.slug]);

  const spotlight = collection.spotlight;
  const ctas = collection.ctas ?? [
    { label: `Shop ${collection.name}`, href: "#collection-products" },
  ];

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={collection.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/20" />
        </div>

        <div className="relative z-10">
          <div className="gallery-container flex flex-col gap-8 py-28 sm:py-32">
            <div className="flex flex-wrap items-center gap-3 text-sm text-brand-beige/80">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-beige/70 transition-colors hover:text-brand-beige"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Shop
              </Link>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-beige/50">
                {collection.featuredRegions.join(" • ")}
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              className="max-w-3xl space-y-6 text-brand-beige"
            >
              <span className="caps-spacing text-xs text-brand-beige/70">
                TAC Collection
              </span>
              <h1 className="font-heading text-5xl leading-tight sm:text-6xl">
                {heroTitle}
              </h1>
              <p className="text-base text-brand-beige/80 sm:text-lg">
                {heroDescription}
              </p>
            </motion.div>

            <div className="flex flex-wrap gap-4">
              {ctas.map((cta) => (
                <Button
                  key={cta.label}
                  asChild
                  variant={cta.variant === "secondary" ? "outline" : "default"}
                  className={cn(
                    "px-6 py-3 text-sm uppercase tracking-[0.25em]",
                    cta.variant === "secondary"
                      ? "border-brand-beige/60 bg-transparent text-brand-beige hover:bg-brand-beige hover:text-brand-umber"
                      : "bg-brand-beige text-brand-umber hover:bg-brand-beige/90"
                  )}
                >
                  <Link href={cta.href}>{cta.label}</Link>
                </Button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 text-brand-beige/80">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/60">
                  Artisan Circle
                </p>
                <p className="mt-2 text-2xl font-semibold text-brand-beige">
                  {collection.artisanCount.toString().padStart(2, "0")} Makers
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/60">
                  Pieces Curated
                </p>
                <p className="mt-2 text-2xl font-semibold text-brand-beige">
                  {collection.itemCount.toString().padStart(2, "0")} Designs
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/60">
                  Regions Featured
                </p>
                <p className="mt-2 text-2xl font-semibold text-brand-beige">
                  {collection.featuredRegions.length} Territories
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white" id="collection-products">
        <div className="gallery-container space-y-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <h2 className="font-heading text-3xl text-brand-umber">
                {collection.name}
              </h2>
              <p className="max-w-2xl text-base text-brand-umber/70">
                {longDescription}
              </p>

              {availableHighlights.length > 0 && (
                <div className="grid gap-4 rounded-3xl border border-brand-umber/15 bg-brand-beige/60 p-6 sm:grid-cols-3">
                  {availableHighlights.map((highlight) => (
                    <div key={highlight.title} className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-brand-umber/50">
                        {highlight.title}
                      </p>
                      <p className="text-sm text-brand-umber/70">
                        {highlight.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {spotlight && (
              <div className="relative overflow-hidden rounded-3xl border border-brand-umber/15 bg-brand-umber text-brand-beige shadow-[0_20px_48px_rgba(74,43,40,0.2)]">
                <div className="absolute inset-0">
                  <Image
                    src={spotlight.image}
                    alt={spotlight.name}
                    fill
                    className="object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-umber via-brand-umber/90 to-brand-umber/70" />
                </div>
                <div className="relative z-10 space-y-6 p-8">
                  <span className="caps-spacing text-xs text-brand-beige/60">
                    Artisan Spotlight
                  </span>
                  <p className="text-lg italic leading-relaxed text-brand-beige/90">
                    “{spotlight.quote}”
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-brand-beige">
                      {spotlight.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.25em] text-brand-beige/60">
                      {spotlight.role}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-brand-umber/10 bg-brand-beige/50 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-brand-umber/70">
              <span className="flex items-center gap-2 uppercase tracking-[0.3em]">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              {subcategoryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedSubcategory(option)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs uppercase tracking-[0.25em] transition-colors",
                    selectedSubcategory === option
                      ? "bg-brand-umber text-brand-beige"
                      : "bg-white text-brand-umber/70 hover:bg-brand-umber/10"
                  )}
                >
                  {option === "all"
                    ? "All designs"
                    : option.replace(/-/g, " ")}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.3em] text-brand-umber/50">
                Sort
              </span>
              <SortDropdown
                value={sortBy}
                onChange={(value) => setSortBy(value as SortOption)}
              />
            </div>
          </div>

          {filteredAndSortedProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-brand-umber/15 bg-white p-12 text-center">
              <h3 className="font-heading text-2xl text-brand-umber">
                No pieces match your filters yet
              </h3>
              <p className="mt-3 text-sm text-brand-umber/70">
                Adjust your subcategory or sorting options to reveal more artisan work.
              </p>
            </div>
          )}
        </div>
      </section>

      {relatedCollections.length > 0 && (
        <section className="section-spacing bg-brand-beige">
          <div className="gallery-container space-y-10">
            <div className="space-y-3 text-center">
              <span className="caps-spacing text-xs text-brand-teal">
                Continue Exploring
              </span>
              <h2 className="font-heading text-3xl text-brand-umber">
                Complementary Collections
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedCollections.map((related) => (
                <CategoryCard key={related.slug} category={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
};
