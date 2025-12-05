"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { patternAssets } from "@/lib/patterns";

const footerLinks = [
  {
    title: "Collections",
    items: [
      { label: "Maasai Shukas", href: "/collections#shukas" },
      { label: "Bronze Jewelry", href: "/collections#bronze" },
      { label: "Heritage Home", href: "/collections#home" },
    ],
  },
  {
    title: "Discover",
    items: [
      { label: "About TAC", href: "/about" },
      { label: "Artisan Stories", href: "/stories" },
      { label: "Our Legacy", href: "#legacy" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Contact", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-brand-umber/50 bg-brand-umber text-white/85">
      <Image
        src={patternAssets.mudclothWeave}
        alt="Mudcloth pattern"
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(26,17,15,0.95),rgba(26,17,15,0.9)_40%,transparent)]" />

      <div className="relative gallery-container py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <span className="caps-spacing text-xs text-brand-gold">
            Tac Accessories
          </span>
          <h3 className="font-heading text-3xl leading-tight text-brand-gold">
            Where heritage breathes, and luxury lives.
          </h3>
          <p className="max-w-sm text-sm text-white/70">
            Inspired by sun-drenched ateliers across Nairobi, Accra, and Bamako,
            we curate Africa&apos;s finest craftsmanship for contemporary collectors.
            </p>
          </motion.div>

          {footerLinks.map((group) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h4 className="font-heading text-xl text-brand-gold">
            {group.title}
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            {group.items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="group relative inline-flex items-center gap-2 transition-colors hover:text-brand-teal"
                >
                  <span className="absolute -left-4 h-1 w-1 rounded-full bg-brand-gold opacity-0 transition group-hover:opacity-100" />
                  {item.label}
                </Link>
              </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/20 pt-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <span className="caps-spacing">
            © {new Date().getFullYear()} Tac Accessories. All Rights Reserved.
          </span>
          <span className="caps-spacing">
            Crafted with honor across the African continent.
          </span>
        </div>
      </div>
    </footer>
  );
};
