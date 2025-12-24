"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductCardData } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";

interface QuickViewModalProps {
  product: ProductCardData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const images = product.gallery.length > 0 ? product.gallery : [product.image];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const renderStars = () => {
    if (!product.rating) return null;
    const rating = Math.round(product.rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < rating ? "text-brand-gold" : "text-brand-umber/20"
            }`}
          >
            ★
          </span>
        ))}
        {product.reviewCount && (
          <span className="ml-1 text-xs text-brand-umber/60">
            ({product.reviewCount})
          </span>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-brand-umber" />
        </button>

        <div className="grid gap-0 sm:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative aspect-square bg-brand-beige/30 sm:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[activeImageIndex]}
                  alt={`${product.name} - View ${activeImageIndex + 1}`}
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-brand-umber" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-brand-umber" />
                </button>
              </>
            )}

            {/* Image Dots */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeImageIndex === index
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6 p-6 sm:p-8 sm:order-2">
            <DialogHeader className="items-start gap-2 text-left">
              {product.brand && (
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-umber/50">
                  {product.brand}
                </p>
              )}
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              {renderStars()}
            </DialogHeader>

            <DialogDescription className="text-left text-base text-brand-umber/80">
              {product.description}
            </DialogDescription>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-heading font-bold text-brand-coral">
                KES {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-brand-umber/40 line-through">
                  KES {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Materials */}
            {product.materials.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-umber/60">
                  Materials
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material) => (
                    <span
                      key={material}
                      className="rounded-full bg-brand-jade/40 px-3 py-1 text-sm text-brand-umber/80"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Origin */}
            {product.origin && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-umber/60">
                  Origin
                </p>
                <p className="text-sm text-brand-umber/80">{product.origin}</p>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button size="lg" onClick={handleAddToCart} className="w-full">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Basket
            </Button>

            {/* View Full Details Link */}
            <a
              href={`/products/${product.slug}`}
              className="text-center text-sm font-medium text-brand-teal hover:underline"
            >
              View Full Details →
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

