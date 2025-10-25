"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { featuredProducts } from "@/data/content";

const capsuleEditions = featuredProducts.slice(0, 3);
const curatedContinuum = featuredProducts.slice(3);

export default function CollectionsPage() {
  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
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

      <section className="section-spacing bg-white pt-10">
        <div className="gallery-container space-y-10">
          <div className="flex flex-col gap-4 text-left">
            <span className="caps-spacing text-xs text-brand-teal">
              Capsule Editions
            </span>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 className="max-w-2xl font-heading text-4xl text-brand-umber">
                Limited heirlooms poured in bronze, gold, and hand-loomed fibres.
              </h2>
              <Button asChild variant="outline">
                <Link href="/cart">Reserve a Private Viewing</Link>
              </Button>
            </div>
          </div>

          <motion.div
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            {capsuleEditions.map((product) => (
              <ProductCard key={`capsule-${product.id}`} product={product} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-spacing bg-brand-jade/10">
        <div className="gallery-container space-y-12">
          <div className="flex flex-col gap-4 text-left">
            <span className="caps-spacing text-xs text-brand-teal">
              Curated Continuum
            </span>
            <h2 className="max-w-2xl font-heading text-4xl text-brand-umber">
              Collectables that honour region, ritual, and modern silhouettes.
            </h2>
          </div>

          <motion.div
            className="grid gap-12 lg:grid-cols-[1fr_1fr]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
          >
            {curatedContinuum.map((product) => (
              <div key={`continuum-${product.id}`} className="flex flex-col gap-6">
                <ProductCard product={product} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
