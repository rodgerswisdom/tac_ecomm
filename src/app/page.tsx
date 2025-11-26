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
import {
  featuredCollections,
  featuredProducts,
} from "@/data/content";

const featuredShowcase = featuredProducts.slice(0, 4);

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      <Hero />

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
              Discover our carefully curated categories of African craftsmanship.
            </h2>
            <p className="max-w-2xl text-base text-brand-umber/70">
              Each collection represents a distinct category of jewelry and accessories, showcasing the diversity and artistry of African craftsmanship across different regions and traditions.
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center"
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
            {featuredCollections.map((collection) => (
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

          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-brand-umber text-brand-umber"
              asChild
            >
              <Link href="/collections">View the Full Collection</Link>
            </Button>
            <span className="text-xs uppercase tracking-[0.4em] text-brand-umber/50">
              6 curated collections • 100+ artisan pieces
            </span>
          </div>
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
            <p className="max-w-2xl text-base text-brand-umber/70">
              Discover the limited-run adornments our stylists are pairing for celebrations, gifting suites, and gallery openings.
            </p>
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

          <div className="flex flex-col items-center gap-3 text-center">
            <Button
              size="lg"
              className="px-8 py-6"
              asChild
            >
              <Link href="/collections">Browse the full gallery</Link>
            </Button>
            <span className="text-xs uppercase tracking-[0.4em] text-brand-umber/50">
              Updated weekly with new artisan arrivals
            </span>
          </div>
        </div>
      </section>

      <TestimonialsMarquee />

      <Footer />
    </main>
  );
}
