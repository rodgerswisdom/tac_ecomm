"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Navbar } from "@/components/Navbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SubcategoryDropdown } from "@/components/ui/custom-dropdown";
import { CategoryCard } from "@/components/CategoryCard";
import type { CollectionSummary } from "@/types/collection";
import { ProductCardData } from "@/types/product";
import { cn } from "@/lib/utils";

interface CollectionPageClientProps {
  collection: CollectionSummary;
  products: ProductCardData[];
  relatedCollections?: CollectionSummary[];
}

export const CollectionPageClient = ({
  collection,
  products,
  relatedCollections = [],
}: CollectionPageClientProps) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");

  const heroTitle = collection.heroTitle ?? collection.name;
  const heroDescription = collection.heroDescription ?? collection.description;
  const heroImage = collection.heroImage ?? collection.image;

  const baseProducts = useMemo(() => {
    if (!collection.featuredProductIds?.length) {
      return products;
    }

    const featuredOrder = new Map<string, number>();
    collection.featuredProductIds.forEach((id, index) => {
      featuredOrder.set(id, index);
    });

    return [...products].sort((a, b) => {
      const orderA = featuredOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const orderB = featuredOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;

      if (orderA === orderB) {
        return a.name.localeCompare(b.name);
      }

      return orderA - orderB;
    });
  }, [collection.featuredProductIds, products]);

  const subcategoryOptions = useMemo(() => {
    const childNames = collection.childCategories?.map((child) => child.name) ?? []
    const productSubcategories = Array.from(
      new Set(
        baseProducts
          .map((product) => product.subcategory)
          .filter(Boolean) as string[]
      )
    )

    const options = Array.from(new Set([...childNames, ...productSubcategories]))
    if (!options.length) {
      return ["all"]
    }

    return ["all", ...options]
  }, [baseProducts, collection.childCategories])

  const filteredProducts = useMemo(() => {
    let nextProducts = baseProducts;

    if (selectedSubcategory !== "all") {
      const childMatch = collection.childCategories?.find(
        (child) => child.name === selectedSubcategory
      )
      nextProducts = nextProducts.filter((product) => {
        if (childMatch) {
          return product.category === childMatch.slug || product.subcategory === selectedSubcategory
        }
        return product.subcategory === selectedSubcategory
      })
    }

    return nextProducts;
  }, [baseProducts, collection.childCategories, selectedSubcategory]);

  const ctas = collection.ctas ?? [
    { label: `Shop ${collection.name}`, href: "#collection-products" },
  ];

  // Generate breadcrumb items
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Collections", url: "/collections" },
    { name: collection.name, url: `/collections/${collection.slug}` },
  ];

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />

      <section className="relative flex max-h-[360px] min-h-[240px] items-center overflow-hidden sm:max-h-[400px] md:max-h-[420px]">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={collection.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/45 to-black/25" />
        </div>

        <div className="relative z-10 w-full">
          <div className="gallery-container flex flex-col gap-4 py-8 sm:gap-5 sm:py-10 md:py-12">
            <div className="flex flex-wrap items-center gap-3 text-sm text-brand-beige/80">
              <Breadcrumb
                items={breadcrumbItems}
                className="text-brand-beige/70 [&_a]:text-brand-beige/90 [&_a:hover]:text-brand-beige [&_span]:text-brand-beige/70 [&_svg]:text-brand-beige/50"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              className="max-w-2xl space-y-3 text-brand-beige sm:space-y-4"
            >
              <span className="caps-spacing text-xs text-brand-beige/70">
                TAC Collection
              </span>
              <h1 className="font-heading text-2xl leading-tight sm:text-4xl md:text-5xl">
                {heroTitle}
              </h1>
              <p className="line-clamp-2 text-sm text-brand-beige/80 sm:line-clamp-3 sm:text-base">
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
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white" id="collection-products">
        <div className="gallery-container space-y-8">
          {subcategoryOptions.length > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-brand-umber/70">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "piece" : "pieces"}
              </p>
              <div className="w-full sm:max-w-xs">
                <SubcategoryDropdown
                  value={selectedSubcategory}
                  onChange={setSelectedSubcategory}
                  options={subcategoryOptions}
                />
              </div>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-brand-umber/15 bg-white p-12 text-center">
              <h3 className="font-heading text-2xl text-brand-umber">
                No pieces match your filters yet
              </h3>
              <p className="mt-3 text-sm text-brand-umber/70">
                Try another subcategory to reveal more artisan work.
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
    </main>
  );
};
