"use client";

import { useState, memo, type MouseEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/contexts/CartContext";
import { ProductCardData } from "@/types/product";
import { getDiscountPercent, hasValidDiscount } from "@/lib/discount";
import {
  buildCartLineKey,
  formatProductImageLabel,
  getDefaultGalleryImage,
} from "@/lib/product-image-selection";

interface ProductCardProps {
  product: ProductCardData;
}

const ProductCardComponent = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const discountPercent = getDiscountPercent(product.price, product.originalPrice);
  const isDiscounted = hasValidDiscount(product.price, product.originalPrice);
  const isOutOfStock = product.isOutOfStock === true;

  const secondaryImage = product.gallery.length > 1 ? product.gallery[1] : product.image;
  const defaultImage = getDefaultGalleryImage(product.galleryImages);

  const handleOpenProduct = () => {
    router.push(`/products/${product.slug}`);
  };

  const handleQuickAdd = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;

    const imageId = defaultImage.id || undefined;
    addToCart({
      id: product.id,
      productId: product.id,
      cartLineKey: buildCartLineKey(product.id, imageId),
      productImageId: imageId,
      selectedImageLabel: formatProductImageLabel(defaultImage, 0),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: defaultImage.url || product.image,
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  const renderStars = () => {
    if (!product.rating) return null;
    const rating = Math.round(product.rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < rating
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
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenProduct}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenProduct();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Open ${product.name}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="relative h-full overflow-hidden bg-white transition-all duration-300 hover:shadow-[0_8px_24px_rgba(74,43,40,0.12)]">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-brand-beige/30">
          <div className="block h-full w-full">
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
                      : product.gallery[0] || product.image
                  }
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={Boolean(product.isBestSeller)}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
            {isOutOfStock && (
              <span className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
                Out of Stock
              </span>
            )}
            {isDiscounted && (
              <span className="rounded-md bg-brand-coral px-2 py-1 text-xs font-semibold text-white shadow-md">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-2.5 sm:p-4">
          <div className="space-y-1 sm:space-y-2 min-w-0">
            <CardTitle className="line-clamp-2 min-w-0 text-left text-lg font-semibold leading-tight sm:text-xl">
              <span className="transition-colors group-hover:text-brand-teal">
                {product.name}
              </span>
            </CardTitle>

            {renderStars()}

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-lg font-bold text-brand-coral">
                {formatPrice(product.price)}
              </span>
              {isDiscounted && product.originalPrice && (
                <span className="text-xs sm:text-sm text-brand-umber/40 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              variant={isOutOfStock ? "outline" : "default"}
              className="mt-1 w-full"
              disabled={isOutOfStock}
              onClick={handleQuickAdd}
              aria-label={isOutOfStock ? `${product.name} is out of stock` : `Quick add ${product.name} to basket`}
            >
              <ShoppingBag className="mr-1.5 h-4 w-4" />
              {isOutOfStock ? "Out of stock" : justAdded ? "Added" : "Quick add"}
            </Button>

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
