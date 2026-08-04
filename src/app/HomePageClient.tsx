"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import type { HomePageCategoryCard } from "@/server/storefront/collections";
import type { HeroContent } from "@/server/storefront/settings";
import type { OfferOfTheMonth } from "@/types/offer";

interface HomePageClientProps {
  mainCategories: HomePageCategoryCard[];
  hero: HeroContent;
  offerOfTheMonth?: OfferOfTheMonth | null;
}

export function HomePageClient({
  mainCategories,
  hero,
  offerOfTheMonth = null,
}: HomePageClientProps) {
  const firstCategoryRow = mainCategories.slice(0, 3);
  const secondCategoryRow = mainCategories.slice(3, 6);

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      <Hero hero={hero} offerOfTheMonth={offerOfTheMonth} />

      {mainCategories.length > 0 ? (
        <section className="section-spacing bg-white" id="collection">
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
              <h2 className="max-w-3xl font-heading text-4xl leading-tight text-brand-umber sm:text-4xl md:text-5xl">
                Discover our carefully curated categories of Craftsmanship.
              </h2>
            </motion.div>

            <div className="mt-14 space-y-16 sm:mt-16 sm:space-y-20">
              {firstCategoryRow.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8"
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
                  {firstCategoryRow.map((category) => (
                    <motion.div
                      key={category.slug}
                      variants={{
                        hidden: { opacity: 0, y: 32 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                      className="w-full"
                    >
                      <CategoryCard category={category} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : null}

              {secondCategoryRow.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8"
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
                  {secondCategoryRow.map((category) => (
                    <motion.div
                      key={category.slug}
                      variants={{
                        hidden: { opacity: 0, y: 32 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                      className="w-full"
                    >
                      <CategoryCard category={category} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
