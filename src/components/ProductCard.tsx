"use client";

import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { regionPalettes } from "@/lib/patterns";

export interface ProductCardData {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  gallery: string[];
  description: string;
  origin: string;
  materials: string[];
  category?: string;
  subcategory?: string;
  productType?: string;
  isCorporateGift?: boolean;
  communityImpact?: string;
  sourcingStory?: string;
  artisan: {
    name: string;
    region: keyof typeof regionPalettes;
    regionLabel: string;
    quote: string;
    portrait: string;
  };
}

interface ProductCardProps {
  product: ProductCardData;
}

const ProductCardComponent = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [showRipple, setShowRipple] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const regionTheme = regionPalettes[product.artisan.region] ?? {
    background: "rgba(201,146,51,0.12)",
    text: "#C99233",
  };

  useEffect(() => {
    if (!isDialogOpen) {
      setActiveImage(0);
      return;
    }

    const timer = setInterval(() => {
      setActiveImage((current) => (current + 1) % product.gallery.length);
    }, 2600);

    return () => clearInterval(timer);
  }, [isDialogOpen, product.gallery.length]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 650);
  };

  return (
    <motion.div
      whileHover={{ y: -8, rotateX: 1.8 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="group"
    >
      <Card className="mx-auto w-full max-w-sm overflow-hidden text-center transition-all group-hover:border-brand-teal/35 group-hover:shadow-[0_28px_58px_rgba(74,43,40,0.18)]">
        <CardHeader className="flex flex-col items-center gap-3 bg-transparent p-6 pb-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <motion.div
              className="group/image relative aspect-square w-56 overflow-hidden rounded-full border border-brand-teal/25 shadow-[0_25px_45px_rgba(74,43,40,0.12)]"
              initial="rest"
              animate="rest"
              whileHover="hover"
              variants={{ rest: { rotate: 0 }, hover: { rotate: 0 } }}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 16rem, 60vw"
                className="object-cover"
                priority={product.id < 3}
              />
              <DialogTrigger asChild>
                <motion.button
                  type="button"
                  variants={{ rest: { opacity: 0, y: 20 }, hover: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-umber/70 text-sm font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm pointer-events-none group-hover/image:pointer-events-auto"
                >
                  <Eye className="h-5 w-5" />
                  Quick View
                </motion.button>
              </DialogTrigger>
            </motion.div>

            <DialogContent>
              <DialogHeader className="items-start gap-6 sm:flex sm:flex-row">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-jade/30 sm:w-1/2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${product.id}-${activeImage}`}
                      initial={{ opacity: 0.1, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={product.gallery[activeImage]}
                        alt={`${product.name} angle ${activeImage + 1}`}
                        fill
                        sizes="100%"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="flex flex-1 flex-col gap-6">
                  <DialogTitle>{product.name}</DialogTitle>
                  <DialogDescription>{product.description}</DialogDescription>

                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-3xl font-heading text-brand-coral">
                      KES {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-brand-umber/40 line-through">
                        KES {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="caps-spacing text-xs text-brand-umber/55">
                      Materials
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.materials.map((material) => (
                        <span
                          key={material}
                          className="rounded-full bg-brand-jade/40 px-4 py-1 text-sm text-brand-umber/80"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border border-brand-gold/45 bg-white/85 p-4"
                    style={{
                      background: `linear-gradient(135deg, ${regionTheme.background}, rgba(218,191,143,0.75))`,
                    }}
                  >
                    <p className="caps-spacing text-xs text-brand-umber/60">
                      Artisan
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border border-brand-gold/60">
                        <Image
                          src={product.artisan.portrait}
                          alt={product.artisan.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-heading text-lg text-brand-umber">
                          {product.artisan.name}
                        </p>
                        <p className="text-sm" style={{ color: regionTheme.text }}>
                          {product.artisan.regionLabel}
                        </p>
                      </div>
                    </div>
                    <blockquote className="mt-4 border-l-2 border-brand-gold/45 pl-4 text-sm text-brand-umber/70">
                      “{product.artisan.quote}”
                    </blockquote>
                  </div>

                  <Button size="lg" onClick={handleAddToCart}>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Add to Basket
                  </Button>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <span className="caps-spacing text-xs text-brand-umber/60">
            {product.origin}
          </span>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4 px-6 pb-8 text-center">
          <CardTitle className="text-center">
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-brand-teal"
            >
              {product.name}
            </Link>
          </CardTitle>

          <CardDescription className="flex items-center justify-center gap-2 text-sm text-brand-coral">
            <span>KES {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-brand-umber/40 line-through">
                KES {product.originalPrice.toLocaleString()}
              </span>
            )}
          </CardDescription>

          <p className="text-sm leading-relaxed text-brand-umber/75">
            {product.description}
          </p>

          <div className="relative w-full">
            <Button size="lg" className="w-full" onClick={handleAddToCart}>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Basket
              <AnimatePresence>
                {showRipple && (
                  <motion.span
                    className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-brand-teal/60 to-brand-coral/45"
                    initial={{ scale: 0, opacity: 0.75 }}
                    animate={{ scale: 1.15, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ProductCard = memo(ProductCardComponent);
