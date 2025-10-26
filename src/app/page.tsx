"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { InteractiveRing } from "@/components/InteractiveRing";
import { ArtisanGallery } from "@/components/ArtisanGallery";
import { LegacyTimeline } from "@/components/LegacyTimeline";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  featuredCollections,
  featuredProducts,
  artisanSpotlight,
  legacyMilestones,
} from "@/data/content";

const showcaseFeatures = [
  {
    title: "Gallery-grade lighting",
    description:
      "Soft gold gradients and linen textures showcase every facet as if displayed within a Nairobi atelier.",
  },
  {
    title: "Artisan-first storytelling",
    description:
      "Every product is paired with the hands that shaped it, honoring lineage, ritual, and community impact.",
  },
  {
    title: "Framer Motion microinteractions",
    description:
      "Parallax, molten ripples, and bead cues enrich each interaction without sacrificing performance.",
  },
];

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

      <motion.section
        className="section-spacing relative overflow-hidden bg-gradient-to-br from-brand-beige via-white to-brand-jade/30"
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-160px" }}
        transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[url('https://images.unsplash.com/photo-1653227907864-560dce4c252d?auto=format&fit=crop&q=60&w=900')] bg-cover bg-center opacity-15 mix-blend-multiply" />
        <div className="gallery-container">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-10">
              <span className="caps-spacing text-xs text-brand-teal">
                Experience TAC
              </span>
              <h2 className="font-heading text-4xl leading-tight text-brand-umber md:text-5xl">
                Designed as a luminous African gallery, crafted to feel like a whispered secret.
              </h2>
              <div className="grid gap-8 md:grid-cols-2">
                {showcaseFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-3xl border border-brand-umber/15 bg-white/85 p-8 shadow-[0_20px_50px_rgba(74,43,40,0.15)] backdrop-blur-sm"
                  >
                    <h3 className="font-heading text-2xl text-brand-umber">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm text-brand-umber/75">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex">
              <InteractiveRing />
            </div>
          </div>
        </div>
      </motion.section>

      <ArtisanGallery artisans={artisanSpotlight} />

      <LegacyTimeline milestones={legacyMilestones} />

      <Footer />
    </main>
  );
}
