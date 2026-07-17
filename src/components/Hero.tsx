"use client";

import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { patternDividerIcon } from "@/lib/patterns";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatFreeShippingThreshold } from "@/lib/delivery";
import { ArrowRight } from "lucide-react";
import type { OfferOfTheMonth } from "@/types/offer";

const heritageSlide = {
  id: "hero-heritage",
  image:
    "https://plus.unsplash.com/premium_photo-1666789257989-f2a5e8a2b972?auto=format&fit=crop&q=60&w=900",
  title: "Heritage Atelier Spotlight",
  subtitle: "Crafted by Heritage, Worn with Pride",
  description:
    "From the soil of Africa to the hands of its artisans, our jewellery is a symphony of earth and soul. Every design is a poetic expression of culture, artistry, and authenticity. These treasures are more than adornments — they are the heartbeat of Africa, worn close to yours.",
  cta: { label: "Shop Collections", href: "/collections" },
};

interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  cta: { label: string; href: string };
}

interface HeroProps {
  offerOfTheMonth?: OfferOfTheMonth | null;
}

const DEFAULT_SLIDE_DURATION_MS = 5000;
const FIRST_SLIDE_DURATION_MS = 10000;

const HeroComponent = ({ offerOfTheMonth }: HeroProps) => {
  const { formatPrice } = useCurrency();

  const allSlides: Slide[] = [
    heritageSlide,
    ...(offerOfTheMonth
      ? [
          {
            id: "hero-offer",
            image: offerOfTheMonth.image,
            title: offerOfTheMonth.title,
            subtitle: offerOfTheMonth.headline,
            description: offerOfTheMonth.description,
            cta: {
              label: offerOfTheMonth.ctaLabel,
              href: offerOfTheMonth.ctaHref,
            },
          },
        ]
      : []),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = allSlides[activeIndex] ?? heritageSlide;

  useEffect(() => {
    if (allSlides.length <= 1) {
      return;
    }

    const duration =
      activeIndex === 0 ? FIRST_SLIDE_DURATION_MS : DEFAULT_SLIDE_DURATION_MS;
    const timer = setTimeout(
      () => setActiveIndex((prev) => (prev + 1) % allSlides.length),
      duration
    );
    return () => clearTimeout(timer);
  }, [activeIndex, allSlides.length]);

  return (
    <section className="nav-clearance relative overflow-hidden bg-brand-beige pb-10 text-brand-umber md:pb-16">
      <div className="relative z-10 gallery-container">
        <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6 text-center lg:text-left sm:space-y-8">
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
                  className="caps-spacing inline-flex items-center gap-3 text-sm text-brand-umber lg:gap-4"
                >
                  <span className="inline-block h-[3px] w-10 rounded-full bg-brand-umber/40 lg:w-14" />
                  {activeSlide.title}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
                  className="font-heading text-4xl leading-tight text-brand-umber sm:text-5xl md:text-6xl lg:text-7xl"
                >
                  {activeSlide.subtitle}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  className="mx-auto max-w-xl text-lg text-brand-umber lg:mx-0 lg:text-xl"
                >
                  {activeSlide.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col xs:flex-row gap-3 justify-center lg:justify-start"
                >
                  <Button
                    size="lg"
                    className="px-6 py-4 sm:px-10 sm:py-6 shadow-[0_18px_36px_rgba(74,43,40,0.18)] transition"
                    asChild
                  >
                    <Link href={activeSlide.cta.href}>
                      {activeSlide.cta.label}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="hidden items-center gap-3 text-sm text-brand-umber sm:flex"
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
                Free shipping on Kenya orders over{" "}
                {formatFreeShippingThreshold(formatPrice)} &mdash; delivered with
                care from our atelier to you.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
            className="relative mx-auto w-full max-w-[400px] sm:max-w-[520px]"
          >
            <div className="group relative overflow-hidden rounded-[3rem] border border-brand-teal/20 bg-brand-beige/60 shadow-[0_30px_70px_rgba(74,43,40,0.18)]">
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-brand-umber/30 via-transparent to-transparent mix-blend-multiply" />
              <AnimatePresence mode="wait">
                <Link
                  href={activeSlide.cta.href}
                  aria-label={`Open ${activeSlide.title}`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/60"
                >
                  <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
                    className="relative aspect-[4/4.5] w-full cursor-pointer overflow-hidden"
                  >
                    <Image
                      src={activeSlide.image}
                      alt={activeSlide.title}
                      fill
                      sizes="(max-width: 640px) 320px, (max-width: 1024px) 420px, 520px"
                      quality={70}
                      priority={activeIndex === 0}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <span className="sr-only">{activeSlide.title}</span>
                  </motion.div>
                </Link>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 sm:mt-24 flex flex-col items-center gap-4 text-center text-sm text-brand-umber sm:flex-row sm:justify-between"
        >
          <span className="caps-spacing text-xs text-brand-umber">
            Scroll to enter the gallery
          </span>
          <motion.svg
            width="40"
            height="72"
            viewBox="0 0 40 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-brand-umber"
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
          <p className="caps-spacing text-xs text-brand-umber">
            Exclusive releases drop every Thursday at 6pm EAT
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export const Hero = memo(HeroComponent);
