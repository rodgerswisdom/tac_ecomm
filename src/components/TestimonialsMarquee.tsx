"use client";

import { memo } from "react";
import { motion } from "framer-motion";

const testimonials = [
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
];

export const TestimonialsMarquee = memo(function TestimonialsMarquee() {
  return (
    <section className="section-spacing bg-white text-brand-umber">
      <div className="gallery-container">
        <motion.div
          className="flex flex-col items-center gap-4 text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        >
          <span className="caps-spacing text-xs text-brand-teal">Collector Testimonials</span>
          <h3 className="font-heading text-3xl md:text-4xl text-brand-umber">Voices from the Atelier Trail</h3>
          <p className="text-sm text-brand-umber/70 max-w-2xl">
            Slow, continuous murmurs from the collectors who live with our pieces every day.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-2xl border border-brand-teal/20 bg-gradient-to-br from-white via-brand-beige/40 to-brand-jade/20 px-6 py-5 text-left text-brand-umber shadow-[0_8px_25px_rgba(74,43,40,0.12)] backdrop-blur-sm"
            >
              <p className="text-sm leading-relaxed">{review.quote}</p>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal">
                {review.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});
