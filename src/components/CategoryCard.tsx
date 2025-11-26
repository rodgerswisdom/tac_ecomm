"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    itemCount: number;
    featuredRegions: string[];
    artisanCount: number;
    category: string;
    subcategories: string[];
  };
}

const CategoryCardComponent = ({ category }: CategoryCardProps) => {
  return (
    <motion.div
      className="group flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
    >
      <Link
        href={`/collections/${category.slug}`}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative h-40 w-40 overflow-hidden rounded-full border border-brand-teal/30 bg-brand-beige shadow-[0_18px_36px_rgba(74,43,40,0.16)] transition-all duration-300 group-hover:shadow-[0_26px_50px_rgba(74,43,40,0.24)] sm:h-48 sm:w-48">
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 50vw, 16rem"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={category.id < 3}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-umber/20 via-transparent to-brand-teal/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-heading text-brand-umber transition-colors group-hover:text-brand-teal">
            {category.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

export const CategoryCard = memo(CategoryCardComponent);
