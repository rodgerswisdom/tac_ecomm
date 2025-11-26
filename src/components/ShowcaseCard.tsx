"use client";

import { memo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye, ImageOff } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ShowcaseProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  gallery: string[];
  description: string;
  materials: string[];
  artisan: {
    name: string;
    region: string;
    regionLabel: string;
    quote: string;
    portrait: string;
  };
}

export interface ShowcaseCardProps {
  product: ShowcaseProduct;
}

const ShowcaseCardComponent = ({ product }: ShowcaseCardProps) => {
  const { addToCart } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [coverError, setCoverError] = useState(false);
  const [galleryErrors, setGalleryErrors] = useState<boolean[]>(
    () => new Array(product.gallery.length).fill(false),
  );

  useEffect(() => {
    if (!isDialogOpen) {
      return;
    }

    const timer = setInterval(
      () =>
        setActiveImage((current) => (current + 1) % product.gallery.length),
      2600,
    );

    return () => clearInterval(timer);
  }, [isDialogOpen, product.gallery.length]);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setActiveImage(0);
      setGalleryErrors((prev) => prev.map(() => false));
    }
  };

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-5 text-center">
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <motion.div
          className="group relative aspect-square w-60 overflow-hidden rounded-full border border-brand-teal/30 shadow-[0_25px_45px_rgba(74,43,40,0.15)]"
          initial="rest"
          animate="rest"
          whileHover="hover"
        >
          {!coverError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="240px"
              className="object-cover"
              priority={product.id < 3}
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-beige">
              <ImageOff className="h-12 w-12 text-brand-umber/50" aria-hidden />
              <span className="sr-only">{product.name}</span>
            </div>
          )}

          <DialogTrigger asChild>
            <motion.button
              type="button"
              variants={{ rest: { opacity: 0, y: 24 }, hover: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-umber/70 text-sm font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm group-hover:pointer-events-auto"
            >
              <Eye className="h-5 w-5" />
              Quick View
            </motion.button>
          </DialogTrigger>
        </motion.div>

        <DialogContent className="bg-white/90">
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
                    onError={() =>
                      setGalleryErrors((prev) => {
                        const next = [...prev];
                        next[activeImage] = true;
                        return next;
                      })
                    }
                  />
                  {galleryErrors[activeImage] && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-beige text-brand-umber/60">
                      <ImageOff className="h-12 w-12" aria-hidden />
                      <span className="text-sm font-semibold">
                        Preview unavailable
                      </span>
                    </div>
                  )}
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

              <Button
                size="lg"
                variant="outline"
                className="w-full border-brand-umber text-brand-umber hover:bg-brand-umber hover:text-white"
                onClick={() =>
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })
                }
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Basket
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        <h3 className="text-lg font-heading text-brand-umber">
          <Link
            className="transition-colors hover:text-brand-teal"
            href={`/products/${product.slug}`}
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-sm font-semibold text-brand-coral">
          KES {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export const ShowcaseCard = memo(ShowcaseCardComponent);
