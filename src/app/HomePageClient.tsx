"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { TestimonialsMarquee } from "@/components/TestimonialsMarquee";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import type { CollectionSummary } from "@/types/collection";
import { ProductCardData } from "@/types/product";

interface HomePageClientProps {
  featuredProducts: ProductCardData[];
  collections: CollectionSummary[];
}

export function HomePageClient({ featuredProducts, collections }: HomePageClientProps) {
  const featuredShowcase = featuredProducts.slice(0, 4);

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      <Hero featuredProducts={featuredProducts} />

      <section className="section-spacing" id="collection">
        <div className="gallery-container">
          <motion.div
            className="flex flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className="caps-spacing text-xs text-brand-teal">
              Curated Collections
            </span>
            <h2 className="max-w-3xl font-heading text-4xl leading-tight text-brand-umber md:text-5xl">
              Discover our carefully curated categories of Craftsmanship.
            </h2>
          </motion.div>

          <motion.div
            className="mt-14 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
          >
            {collections.map((collection) => (
              <motion.div
                key={collection.id}
                variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                className="w-full"
              >
                <CategoryCard category={collection} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="gallery-container space-y-12">
          <motion.div
            className="flex flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className="caps-spacing text-xs text-brand-teal">
              Featured Pieces
            </span>
            <h2 className="max-w-3xl font-heading text-4xl leading-tight text-brand-umber md:text-5xl">
              Curated highlights from this month&apos;s gallery drop.
            </h2>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            {featuredShowcase.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-10 py-6"
              asChild
            >
              <Link href="/collections">Shop All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      <TestimonialsMarquee />

      <Footer />
    </main>
  );
}
