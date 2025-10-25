"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArtisanProfile } from "@/data/content";
import { patternAssets, regionPalettes } from "@/lib/patterns";

interface ArtisanGalleryProps {
  artisans: ArtisanProfile[];
}

const heightVariants = ["h-96", "h-72", "h-80", "h-[22rem]"];

const ArtisanGalleryComponent = ({ artisans }: ArtisanGalleryProps) => {
  const cards = useMemo(
    () =>
      artisans.map((artisan, index) => ({
        artisan,
        heightClass: heightVariants[index % heightVariants.length],
      })),
    [artisans],
  );

  return (
    <section
      id="artisans"
      className="section-spacing bg-gradient-to-br from-brand-umber via-brand-umber/95 to-brand-umber/80 text-brand-beige"
    >
      <div className="gallery-container">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="caps-spacing text-xs text-brand-gold">
            Artisan Spotlight
          </span>
          <h2 className="max-w-3xl font-heading text-4xl leading-tight md:text-5xl">
            Stories from the makers who weave Africa&apos;s luminous legacy.
          </h2>
          <p className="max-w-2xl text-base text-brand-beige/75">
            Each creation is an ode to place, people, and time — presented here as an immersive gallery.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ artisan, heightClass }, index) => {
            const theme = regionPalettes[artisan.region] ?? {
              background: "rgba(201,146,51,0.18)",
              text: "#C99233",
            };

            return (
              <motion.article
                key={artisan.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: index * 0.08, ease: [0.33, 1, 0.68, 1] }}
                className={`group relative overflow-hidden rounded-[2.5rem] border border-white/8 bg-white/5 p-6 shadow-[0_35px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl ${heightClass}`}
              >
                <motion.div
                  aria-hidden
                  className="absolute inset-0 opacity-30 transition group-hover:opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${theme.background}, rgba(218,191,143,0.35))`,
                  }}
                />

                <div className="relative flex h-full flex-col justify-between gap-6">
                  <div className="flex items-center justify-between">
                    <span className="caps-spacing inline-flex items-center gap-2 text-xs text-brand-gold/80">
                      <Image
                        src={patternAssets.adinkraGlyph}
                        alt="Glyph"
                        width={20}
                        height={20}
                        className="opacity-80"
                      />
                      {artisan.region.toUpperCase()}
                    </span>
                    <span className="rounded-full border border-brand-gold/60 px-3 py-1 text-[11px] uppercase text-brand-gold">
                      {artisan.craft}
                    </span>
                  </div>

                  <div className="relative h-48 overflow-hidden rounded-[2rem]">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster={artisan.portrait}
                      className="absolute inset-0 h-full w-full object-cover opacity-75 transition group-hover:opacity-100"
                    >
                      <source src={artisan.video} type="video/webm" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/60 via-transparent to-transparent" />
                  </div>

                  <div className="space-y-4 text-left text-brand-beige">
                    <h3 className="font-heading text-3xl">{artisan.name}</h3>
                    <blockquote className="relative text-sm leading-relaxed text-brand-beige/80">
                      <span className="absolute -left-4 top-0 text-4xl text-brand-gold/70">“</span>
                      <span className="pl-4">{artisan.quote}</span>
                    </blockquote>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const ArtisanGallery = memo(ArtisanGalleryComponent);
