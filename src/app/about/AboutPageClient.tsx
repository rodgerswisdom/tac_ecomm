"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Award, HandHeart, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: Award,
    title: "Authentic craft",
    description: "Handmade pieces from artisans using techniques passed down across generations.",
  },
  {
    icon: HandHeart,
    title: "Fair partnerships",
    description: "We work directly with makers and invest in the communities behind each design.",
  },
  {
    icon: Sparkles,
    title: "Living heritage",
    description: "Every collection celebrates African symbolism, materials, and contemporary style.",
  },
] as const;

export function AboutPageClient() {
  return (
    <main className="relative overflow-hidden bg-brand-beige bg-texture-linen">
      <Navbar />

      {/* Section 1 — Intro */}
      <section className="nav-clearance section-spacing pb-12 md:pb-16">
        <div className="gallery-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="caps-spacing text-xs text-brand-teal">About TAC</span>
            <h1 className="mt-3 font-heading text-4xl leading-tight text-brand-umber md:text-5xl">
              Where heritage breathes, and luxury lives.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-brand-umber/75 md:text-lg">
              Tac Accessories is a gallery of African adornment—curated in Nairobi, crafted across the
              continent, and made for collectors who care about story as much as silhouette.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 2 — What we stand for */}
      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="caps-spacing text-xs text-brand-teal">Our promise</span>
            <h2 className="mt-3 font-heading text-3xl text-brand-umber md:text-4xl">
              Craft with intention
            </h2>
            <p className="mt-4 text-sm text-brand-umber/70 md:text-base">
              Three principles guide every piece we offer.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.33, 1, 0.68, 1] }}
                className="rounded-3xl border border-brand-umber/10 bg-brand-beige/40 p-6 shadow-[0_16px_40px_rgba(74,43,40,0.08)]"
              >
                <div className="mb-4 inline-flex rounded-2xl border border-brand-teal/20 bg-brand-teal/10 p-3 text-brand-teal">
                  <pillar.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-heading text-xl text-brand-umber">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-umber/70">{pillar.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-14 flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-brand-teal/20 bg-brand-jade/10 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <div>
              <p className="font-heading text-xl text-brand-umber">Step into the gallery</p>
              <p className="mt-1 text-sm text-brand-umber/70">
                Browse collections or reach out for bespoke and gifting.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-center gap-3">
              <Button asChild className="bg-brand-umber text-white hover:bg-brand-umber/90">
                <Link href="/collections">
                  Shop collections
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-brand-teal/30 text-brand-umber">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
