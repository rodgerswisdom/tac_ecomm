"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { patternAssets } from "@/lib/patterns";
import { cn } from "@/lib/utils";
import { TestimonialsMarquee } from "@/components/TestimonialsMarquee";

export interface LegacyMilestone {
  id: number;
  year: string;
  region: string;
  title: string;
  description: string;
  image: string;
  pattern?: keyof typeof patternAssets;
}

interface LegacyTimelineProps {
  milestones: LegacyMilestone[];
}

const LegacyTimelineComponent = ({ milestones }: LegacyTimelineProps) => {
  return (
    <section className="section-spacing bg-gradient-to-b from-brand-beige via-brand-jade/10 to-brand-beige" id="legacy">
      <div className="gallery-container">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="caps-spacing text-xs text-brand-teal">
            Our Legacy
          </span>
          <h2 className="max-w-3xl font-heading text-4xl leading-tight text-brand-umber md:text-5xl">
            A golden thread through time: Africa&apos;s craftsmanship in motion.
          </h2>
          <div className="mt-4 h-0.5 w-10 rounded-full bg-brand-gold" />
          <p className="max-w-2xl text-base text-brand-umber/75">
            Journey across generations of artisans whose touch shapes every TAC piece — from woven textiles to molten bronze.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-0 hidden h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-brand-gold to-brand-coral/80 lg:block" />
          <div className="space-y-16">
            {milestones.map((milestone, index) => {
              const isLeft = index % 2 === 0;
              const patternSrc = milestone.pattern
                ? patternAssets[milestone.pattern]
                : patternAssets.kubaGrid;

              const imageWrapperClass = cn(
                "order-2 relative",
                isLeft ? "lg:order-2" : "lg:order-1",
              );

              const contentClass = cn(
                "order-1 space-y-5 rounded-3xl border border-brand-teal/20 bg-brand-beige/85 p-8 backdrop-blur-sm shadow-[0_20px_50px_rgba(74,43,40,0.14)]",
                isLeft ? "lg:order-1" : "lg:order-2",
              );

              const patternPositionClass = isLeft
                ? "-left-10 -top-10"
                : "-right-10 -top-10";

              return (
                <motion.article
                  key={milestone.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  className="grid gap-10 lg:grid-cols-2 lg:items-center"
                >
                  <div className={imageWrapperClass}>
                    <Image
                      src={milestone.image}
                      alt={milestone.title}
                      width={540}
                      height={400}
                      className="h-80 w-full rounded-3xl object-cover shadow-[0_25px_60px_rgba(74,43,40,0.22)]"
                    />
                    <Image
                      src={patternSrc}
                      alt="Pattern overlay"
                      width={180}
                      height={180}
                      className={cn(
                        "absolute hidden opacity-60 lg:block",
                        patternPositionClass,
                      )}
                    />
                  </div>

                  <div className={contentClass}>
                    <span className="caps-spacing inline-flex items-center gap-3 text-xs text-brand-umber/60">
                      <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-brand-gold/90 px-3 font-semibold text-brand-umber">
                        {milestone.year}
                      </span>
                      {milestone.region}
                    </span>
                    <h3 className="font-heading text-3xl text-brand-umber">
                      {milestone.title}
                    </h3>
                    <p className="text-base leading-relaxed text-brand-umber/75">
                      {milestone.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="mt-20">
          <TestimonialsMarquee />
        </div>

        <div className="mt-20 rounded-3xl border border-brand-teal/25 bg-brand-jade/25 p-10 text-center shadow-[0_25px_60px_rgba(74,43,40,0.14)] backdrop-blur-md">
          <h3 className="font-heading text-3xl text-brand-umber">
            Join the Legacy
          </h3>
          <p className="mt-4 text-base text-brand-umber/75">
            Enter the atelier. Receive curated drops, artisan stories, and invitations to private showings.
          </p>
          <form className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Input
              type="email"
              placeholder="Your email"
              className="h-12 w-full sm:w-80"
              required
            />
            <Button
              size="lg"
              className="bg-brand-umber px-10 text-white shadow-[0_18px_36px_rgba(74,43,40,0.25)] transition hover:bg-brand-umber/90"
              type="submit"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export const LegacyTimeline = memo(LegacyTimelineComponent);
