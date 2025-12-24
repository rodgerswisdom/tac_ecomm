"use client";

import { useState, memo } from "react";
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
import { ShoppingBag, Heart, Star, Plus, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

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
    region: string;
    regionLabel: string;
    quote: string;
    portrait: string;
  };
  // New optional fields for enhanced product cards
  brand?: string;
  rating?: number;
  reviewCount?: number;
  isBestSeller?: boolean;
  colors?: string[];
  sizes?: string[];
}

interface ProductCardProps {
  product: ProductCardData;
  isSelectedForComparison?: boolean;
  onComparisonToggle?: (productId: number, isSelected: boolean) => void;
  onQuickView?: (product: ProductCardData) => void;
}

const ProductCardComponent = ({
  product,
  isSelectedForComparison = false,
  onComparisonToggle,
  onQuickView,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Calculate discount percentage
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Get secondary image for hover swap (use second gallery image or first if only one)
  const secondaryImage = product.gallery.length > 1 ? product.gallery[1] : product.image;

  // Handle image navigation
  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
  };

  // Handle quick add to cart
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  // Render star rating
  const renderStars = () => {
    if (!product.rating) return null;
    const rating = Math.round(product.rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < rating
                ? "fill-brand-gold text-brand-gold"
                : "fill-none text-brand-umber/20"
            }`}
          />
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
    <motion.div
      className="group relative"
      onMouseEnter={() => {
        setIsHovered(true);
        setShowQuickAdd(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="relative h-full overflow-hidden bg-white transition-all duration-300 hover:shadow-[0_8px_24px_rgba(74,43,40,0.12)]">
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-brand-beige/30">
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={isHovered && secondaryImage !== product.image ? "secondary" : "primary"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative h-full w-full"
              >
                <Image
                  src={
                    isHovered && secondaryImage !== product.image
                      ? secondaryImage
                      : product.gallery[activeImageIndex] || product.image
                  }
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={product.id < 3}
                />
              </motion.div>
            </AnimatePresence>
          </Link>

          {/* Sale Badge - Top Left */}
          {product.originalPrice && discountPercent > 0 && (
            <div className="absolute left-3 top-3 z-10">
              <span className="rounded-md bg-brand-coral px-2 py-1 text-xs font-semibold text-white shadow-md">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Best Seller Badge */}
          {product.isBestSeller && (
            <div className="absolute left-3 top-3 z-10">
              <span className="rounded-md bg-brand-teal px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
                Best Seller
              </span>
            </div>
          )}

          {/* Comparison Checkbox - Bottom Left */}
          {onComparisonToggle && (
            <div className="absolute bottom-3 left-3 z-10">
              <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm transition-all hover:bg-white">
                <input
                  type="checkbox"
                  checked={isSelectedForComparison}
                  onChange={(e) => {
                    e.stopPropagation();
                    onComparisonToggle(product.id, e.target.checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-brand-teal text-brand-teal focus:ring-brand-teal"
                />
                <span className="text-xs font-medium text-brand-umber">Compare</span>
              </label>
            </div>
          )}

          {/* Wishlist Heart - Top Right */}
          <button
            onClick={handleWishlistToggle}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted
                  ? "fill-brand-coral text-brand-coral"
                  : "text-brand-umber/60 hover:text-brand-coral"
              }`}
            />
          </button>

          {/* Quick View Button - Appears on Hover */}
          {onQuickView && (
            <AnimatePresence>
              {isHovered && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(product);
                  }}
                  className="absolute right-3 bottom-3 z-10 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-brand-umber shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-105"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Quick View
                </motion.button>
              )}
            </AnimatePresence>
          )}

          {/* Quick Add Button - Appears on Hover */}
          <AnimatePresence>
            {showQuickAdd && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2"
              >
                <Button
                  onClick={handleQuickAdd}
                  size="sm"
                  className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-brand-umber shadow-lg backdrop-blur-sm hover:bg-white hover:scale-105"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Quick Add
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Pagination Dots - Bottom Center */}
          {product.gallery.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {product.gallery.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageClick(index);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImageIndex === index
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`View angle ${index + 1}`}
                />
              ))}
            </div>
          )}

        </div>

        {/* Product Information */}
        <CardContent className="p-4">
          <div className="space-y-2">
            {/* Brand Name - Subtle */}
            {product.brand && (
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-umber/50">
                {product.brand}
              </p>
            )}

            {/* Product Name - Prominent */}
            <CardTitle className="line-clamp-2 text-left text-base font-semibold leading-tight">
              <Link
                href={`/products/${product.slug}`}
                className="transition-colors hover:text-brand-teal"
              >
                {product.name}
              </Link>
            </CardTitle>

            {/* Rating Stars */}
            {renderStars()}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-brand-coral">
                KES {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-brand-umber/40 line-through">
                  KES {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-brand-umber/60">Colors:</span>
                <div className="flex gap-1.5">
                  {product.colors.slice(0, 4).map((color, index) => (
                    <div
                      key={index}
                      className="h-5 w-5 rounded-full border border-brand-umber/20"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-xs text-brand-umber/50">
                      +{product.colors.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Size Swatches */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-brand-umber/60">Sizes:</span>
                <div className="flex gap-1">
                  {product.sizes.slice(0, 5).map((size, index) => (
                    <span
                      key={index}
                      className="rounded border border-brand-umber/20 px-2 py-0.5 text-xs text-brand-umber/70"
                    >
                      {size}
                    </span>
                  ))}
                  {product.sizes.length > 5 && (
                    <span className="text-xs text-brand-umber/50">
                      +{product.sizes.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ProductCard = memo(ProductCardComponent);
