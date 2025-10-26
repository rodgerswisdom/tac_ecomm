"use client";

import { memo } from "react";
import { motion } from "framer-motion";

const reviewRows = [
  [
    {
      name: "Amara · Lagos",
      quote:
        "Feels like curating my own gallery. The textures, the finish—absolutely exquisite.",
    },
    {
      name: "Kwame · Accra",
      quote: "The Sankofa signet arrived glowing. Heritage wrapped in luxury.",
    },
    {
      name: "Zuri · Nairobi",
      quote: "From packaging to storytelling, TAC made the experience ceremonial.",
    },
    {
      name: "Thandi · Johannesburg",
      quote: "The cuff mirrors the murals of home. Art you can wear.",
    },
  ],
  [
    {
      name: "Yasmin · Marrakech",
      quote: "I can almost hear the looms. The shawl is sun and saffron combined.",
    },
    {
      name: "Elijah · Kampala",
      quote: "Quick view let me inspect every facet. What arrived surpassed expectations.",
    },
    {
      name: "Ayo · Abuja",
      quote: "The brass bangles carry constellations—literally. Craftsmanship is unmatched.",
    },
    {
      name: "Nala · Cape Town",
      quote: "From the embossed box to the final shine, TAC honours every tradition.",
    },
  ],
];

export const TestimonialsMarquee = memo(function TestimonialsMarquee() {
  // Flatten all testimonials into a single array for horizontal scrolling
  const allTestimonials = reviewRows.flat();

  return (
    <section className="relative overflow-hidden py-16 text-brand-umber">
      <div className="relative mx-auto flex max-w-5xl flex-col gap-4 text-center">
        <span className="caps-spacing text-xs text-brand-teal">Collector Testimonials</span>
        <h3 className="font-heading text-3xl">Voices from the Atelier Trail</h3>
        <p className="text-sm text-brand-umber/70">
          Slow, continuous murmurs from the collectors who live with our pieces every day.
        </p>
      </div>

      <div className="relative mt-12 overflow-hidden">
        <motion.div
          className="flex gap-6"
          initial={{ x: 0 }}
          animate={{ x: -640 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          {[...allTestimonials, ...allTestimonials].map((review, index) => (
            <div
              key={`${review.name}-${index}`}
              className="min-w-[280px] rounded-2xl border border-brand-teal/20 bg-gradient-to-br from-white via-brand-beige/40 to-brand-jade/20 px-6 py-5 text-left text-brand-umber shadow-[0_8px_25px_rgba(74,43,40,0.12)] backdrop-blur-sm"
            >
              <p className="text-sm leading-relaxed">{review.quote}</p>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal">
                {review.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});
