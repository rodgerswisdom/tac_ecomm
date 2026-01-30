"use client";

import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { patternDividerIcon } from "@/lib/patterns";
import { featuredProducts } from "@/data/content";
import { ProductCardData } from "@/components/ProductCard";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Sparkles, ArrowRight, ShoppingBag } from "lucide-react";

const floatingParticles = [
  { top: "15%", left: "18%", delay: 0 },
  { top: "28%", left: "72%", delay: 0.6 },
  { top: "65%", left: "24%", delay: 1.1 },
  { top: "72%", left: "68%", delay: 1.6 },
];

const heroImages = [
  {
    type: "hero" as const,
    src: "https://plus.unsplash.com/premium_photo-1666789257989-f2a5e8a2b972?auto=format&fit=crop&q=60&w=900",
    alt: "Portrait of an African model adorned with artisan jewelry in warm beige tones",
    title: "Heritage Atelier Spotlight",
    subtitle: "Crafted by Heritage, Worn with Pride",
    description: "Discover limited-edition adornments curated from Nairobi to Accra.",
    cta: { label: "Shop Collections", href: "/collections" },
  },
  {
    type: "hero" as const,
    src: "https://images.unsplash.com/photo-1701884314987-09fb749e023b?auto=format&fit=crop&q=60&w=900",
    alt: "Half-body shot of an African muse wrapped in artisan textiles and gold accessories",
    title: "Limited Edition",
    subtitle: "Exclusive Gallery Drops",
    description: "Every Thursday at 6pm EAT, new pieces join our curated collection.",
    cta: { label: "View Latest Drops", href: "/collections" },
  },
];

type SlideType = "hero" | "product";

interface Slide {
  type: SlideType;
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  description: string;
  cta: { label: string; href: string; variant?: "primary" | "secondary" };
  product?: ProductCardData;
  badge?: string;
}

const HeroComponent = () => {
  const { formatPrice } = useCurrency();
  // Get featured products (first 3)
  const featuredProductSlides: Slide[] = featuredProducts.slice(0, 3).map((product) => ({
    type: "product" as const,
    id: `product-${product.id}`,
    image: product.image,
    title: product.name,
    subtitle: `From ${product.origin}`,
    description: product.description,
    cta: {
      label: product.originalPrice ? "Limited Edition" : "Shop Now",
      href: `/products/${product.slug}`,
      variant: "primary" as const,
    },
    product,
    badge: product.originalPrice ? "On Sale" : "New Arrival",
  }));

  // Combine hero images and product slides
  const allSlides: Slide[] = [
    ...heroImages.map((hero, idx) => ({
      type: "hero" as const,
      id: `hero-${idx}`,
      image: hero.src,
      title: hero.title,
      subtitle: hero.subtitle,
      description: hero.description,
      cta: hero.cta,
    })),
    ...featuredProductSlides,
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = allSlides[activeIndex];

  useEffect(() => {
    const interval = setInterval(
      () => setActiveIndex((prev) => (prev + 1) % allSlides.length),
      5000, // Faster transition for more dynamic feel
    );
    return () => clearInterval(interval);
  }, [allSlides.length]);

  return (
    <section
      className="relative overflow-hidden pt-16 pb-12 text-brand-umber md:pt-20 md:pb-16"
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(255, 255, 255, 0.92), rgba(218, 191, 143, 0.55))`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />
      <div className="absolute inset-0 bg-texture-linen opacity-35" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${activeSlide.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {floatingParticles.map((particle, index) => (
        <motion.span
          key={`particle-${index}`}
          className="pointer-events-none absolute h-32 w-32 rounded-full bg-gradient-to-br from-brand-gold/45 to-brand-coral/25 blur-3xl"
          style={{ top: particle.top, left: particle.left }}
          initial={{ opacity: 0.1, scale: 0.8 }}
          animate={{ opacity: [0.15, 0.35, 0.15], scale: [0.8, 1.12, 0.8] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
          aria-hidden
        />
      ))}

      <div className="relative z-10 gallery-container">
        <div className="grid items-start gap-16 pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-8 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <motion.span
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 }}
                  className="caps-spacing inline-flex items-center gap-3 text-xs text-brand-umber/80 lg:gap-4"
                >
                  <span className="inline-block h-[3px] w-10 rounded-full bg-brand-gold/70 lg:w-14" />
                  {activeSlide.title}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
                  className="font-heading text-4xl leading-tight text-brand-umber md:text-6xl"
                >
                  {activeSlide.subtitle ? (
                    <>
                      {activeSlide.subtitle.split(",")[0]},&nbsp;
                      <span className="bg-gradient-to-r from-brand-gold to-brand-teal bg-clip-text text-transparent">
                        {activeSlide.subtitle.split(",")[1]?.trim() || activeSlide.subtitle}
                      </span>
                    </>
                  ) : (
                    <>
                      Crafted by Heritage,&nbsp;
                      <span className="bg-gradient-to-r from-brand-gold to-brand-teal bg-clip-text text-transparent">
                        Worn with Pride
                      </span>
                    </>
                  )}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="mx-auto max-w-xl text-base text-brand-umber/80 lg:mx-0 lg:text-lg"
                >
                  {activeSlide.description}
                </motion.p>

                {activeSlide.type === "product" && activeSlide.product && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap items-center gap-4 justify-center lg:justify-start"
                  >
                    <div className="text-left">
                      <p className="caps-spacing text-xs text-brand-umber/50">Price</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-heading text-brand-coral">
                          {formatPrice(activeSlide.product.price)}
                        </p>
                        {activeSlide.product.originalPrice && (
                          <span className="text-sm text-brand-umber/40 line-through">
                            {formatPrice(activeSlide.product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    {activeSlide.product.materials.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {activeSlide.product.materials.slice(0, 2).map((material, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-3 py-1 rounded-full bg-brand-jade/20 text-brand-umber/70"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                >
                  <Button
                    size="lg"
                    className="px-10 py-6 shadow-[0_18px_36px_rgba(74,43,40,0.18)] transition"
                    asChild
                  >
                    <Link href={activeSlide.cta.href}>
                      {activeSlide.cta.label}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  {activeSlide.type === "product" && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-10 py-6"
                      asChild
                    >
                      <Link href={`/products/${activeSlide.product?.slug}`}>
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Quick View
                      </Link>
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="hidden items-center gap-3 text-sm text-brand-umber/70 sm:flex"
            >
              <div className="pattern-divider">
                <Image
                  src={patternDividerIcon}
                  alt="Adinkra Divider"
                  width={40}
                  height={40}
                  priority
                />
              </div>
              <p>
                Complimentary global delivery &mdash; curated with care from the
                atelier to your sanctuary.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
            className="relative mx-auto w-full max-w-[520px]"
          >
            <div className="group relative overflow-hidden rounded-[3rem] border border-brand-teal/20 bg-brand-beige/60 shadow-[0_30px_70px_rgba(74,43,40,0.18)]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-umber/30 via-transparent to-transparent mix-blend-multiply z-10" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
                  className="relative aspect-[5/6] w-full overflow-hidden"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${activeSlide.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <span className="sr-only">{activeSlide.title}</span>
                  
                  {activeSlide.badge && (
                    <div className="absolute top-6 left-6 z-20">
                      <span className="inline-flex items-center gap-2 rounded-full bg-brand-coral px-4 py-2 text-xs font-semibold text-white shadow-lg">
                        <Sparkles className="h-3 w-3" />
                        {activeSlide.badge}
                      </span>
                    </div>
                  )}
                  
                  {activeSlide.type === "product" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="absolute left-6 bottom-6 flex items-center gap-3 rounded-full bg-white/85 px-5 py-3 shadow-[0_18px_45px_rgba(74,43,40,0.18)] backdrop-blur z-20">
                <span className="caps-spacing text-[11px] text-brand-umber/70">
                  {activeSlide.type === "product" ? "Featured Product" : "Featured Look"}
                </span>
                <span className="text-sm font-semibold text-brand-umber">
                  {activeIndex + 1} / {allSlides.length}
                </span>
              </div>
            </div>

            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-3 sm:right-6 lg:right-[-3.5rem] z-20">
              {allSlides.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                  <motion.button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border transition-all ${
                      isActive
                        ? "border-brand-teal shadow-[0_18px_45px_rgba(74,43,40,0.18)]"
                        : "border-brand-umber/20 hover:border-brand-umber/40"
                    }`}
                    aria-label={`Show slide ${index + 1}`}
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span
                      className={`absolute inset-0 bg-brand-umber/60 transition-opacity ${
                        isActive ? "opacity-30" : "opacity-60"
                      }`}
                      aria-hidden
                    />
                    <span className="relative text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    {slide.type === "product" && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand-coral border-2 border-white" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-24 flex flex-col items-center gap-4 text-center text-sm text-brand-umber/70 sm:flex-row sm:justify-between"
        >
          <span className="caps-spacing text-xs">
            Scroll to enter the gallery
          </span>
          <motion.svg
            width="40"
            height="72"
            viewBox="0 0 40 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-brand-gold"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <rect
              x="1.5"
              y="1.5"
              width="37"
              height="69"
              rx="18.5"
              stroke="currentColor"
              strokeWidth="3"
            />
            <motion.circle
              cx="20"
              cy="24"
              r="6"
              fill="currentColor"
              animate={{ cy: [24, 34, 24] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.svg>
          <p className="caps-spacing text-xs text-brand-umber/55">
            Exclusive releases drop every Thursday at 6pm EAT
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export const Hero = memo(HeroComponent);
