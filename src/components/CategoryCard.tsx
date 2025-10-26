"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Globe, ImageOff } from "lucide-react";

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
      className="group relative w-full max-w-sm"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
    >
      <Link href={`/collections/${category.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-brand-teal/20 shadow-[0_25px_45px_rgba(74,43,40,0.15)] transition-all duration-300 group-hover:shadow-[0_35px_60px_rgba(74,43,40,0.25)] group-hover:border-brand-teal/40">
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={category.id < 3}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/60 via-brand-umber/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Hover content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>{category.artisanCount} artisans</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" />
                <span>{category.featuredRegions.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span>{category.itemCount} pieces</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-center">
          <h3 className="text-xl font-heading text-brand-umber transition-colors group-hover:text-brand-teal">
            {category.name}
          </h3>
          <p className="text-sm text-brand-umber/70 leading-relaxed">
            {category.description}
          </p>
          
          {/* Subcategories */}
          <div className="flex flex-wrap justify-center gap-2">
            {category.subcategories.slice(0, 3).map((subcategory) => (
              <span
                key={subcategory}
                className="rounded-full bg-brand-jade/20 px-3 py-1 text-xs text-brand-umber/80 capitalize"
              >
                {subcategory}
              </span>
            ))}
            {category.subcategories.length > 3 && (
              <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs text-brand-umber/80">
                +{category.subcategories.length - 3} more
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const CategoryCard = memo(CategoryCardComponent);
