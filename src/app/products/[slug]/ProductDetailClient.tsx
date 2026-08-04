"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdditionalInfo } from "@/components/AdditionalInfo";
import { BackInStockNotifyForm } from "@/components/BackInStockNotifyForm";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Product360Viewer } from "@/components/Product360Viewer";
import { ProductDesignPicker } from "@/components/ProductDesignPicker";
import { ProductCardData } from "@/types/product";
import { getDiscountPercent, hasValidDiscount } from "@/lib/discount";
import { trackViewItem } from "@/lib/analytics";
import { getCollectionsHref } from "@/lib/collections-url";
import {
  buildCartLineKey,
  formatProductImageLabel,
  getDefaultGalleryImage,
  resolveDesignDescription,
} from "@/lib/product-image-selection";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface ProductDetailClientProps {
  product: ProductCardData;
  related: ProductCardData[];
}

function createEmptyQuantities(images: ProductCardData["galleryImages"]): Record<string, number> {
  return Object.fromEntries(images.map((image) => [image.id, 0]));
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const { addToCart, addItemsToCart } = useCart();
  const { formatPrice } = useCurrency();
  const defaultImage = useMemo(() => getDefaultGalleryImage(product.galleryImages), [product.galleryImages]);
  const [selectedImageId, setSelectedImageId] = useState(defaultImage.id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [designQuantities, setDesignQuantities] = useState<Record<string, number>>(() =>
    createEmptyQuantities(product.galleryImages),
  );

  const hasMultipleDesigns = product.galleryImages.length > 1;
  const totalSelectedQty = useMemo(
    () => Object.values(designQuantities).reduce((total, qty) => total + qty, 0),
    [designQuantities],
  );

  const selectedImage = useMemo(() => {
    const match = product.galleryImages.find((image) => image.id === selectedImageId);
    return match ?? defaultImage;
  }, [defaultImage, product.galleryImages, selectedImageId]);

  const activeDescription = useMemo(
    () => resolveDesignDescription(selectedImage, product.description),
    [product.description, selectedImage],
  );

  const discountPercent = getDiscountPercent(product.price, product.originalPrice);
  const isDiscounted = hasValidDiscount(product.price, product.originalPrice);
  const isOutOfStock = product.isOutOfStock === true;

  useEffect(() => {
    setSelectedImageId(defaultImage.id);
    setSelectedImageIndex(0);
    setDesignQuantities(createEmptyQuantities(product.galleryImages));
  }, [defaultImage.id, product.id, product.galleryImages]);

  // Track product view when component mounts
  useEffect(() => {
    trackViewItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      slug: product.slug,
    });
  }, [product.id, product.name, product.price, product.originalPrice, product.category, product.slug]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (hasMultipleDesigns) {
      const itemsToAdd = product.galleryImages
        .map((image, index) => ({
          image,
          index,
          quantity: designQuantities[image.id] ?? 0,
        }))
        .filter((entry) => entry.quantity > 0)
        .map(({ image, index, quantity }) => ({
          id: product.id,
          productId: product.id,
          cartLineKey: buildCartLineKey(product.id, image.id),
          productImageId: image.id,
          selectedImageLabel: formatProductImageLabel(image, index),
          name: product.name,
          price: product.price,
          image: image.url || product.image,
          quantity,
        }));

      if (itemsToAdd.length === 0) return;

      addItemsToCart(itemsToAdd);
      setDesignQuantities(createEmptyQuantities(product.galleryImages));
      return;
    }

    const imageId = selectedImage.id || defaultImage.id;
    addToCart({
      id: product.id,
      productId: product.id,
      cartLineKey: buildCartLineKey(product.id, imageId),
      productImageId: imageId || undefined,
      selectedImageLabel: formatProductImageLabel(selectedImage, selectedImageIndex),
      name: product.name,
      price: product.price,
      image: selectedImage.url || product.image,
    });
  };

  const addButtonLabel = hasMultipleDesigns
    ? totalSelectedQty > 0
      ? `Add ${totalSelectedQty} to Basket`
      : "Add to Basket"
    : "Add to Basket";
  const isAddDisabled = isOutOfStock || (hasMultipleDesigns && totalSelectedQty === 0);

  // Generate breadcrumb items
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Collections", url: "/collections" },
  ];

  if (product.category) {
    breadcrumbItems.push({
      name: product.category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      url: getCollectionsHref(product.category),
    });
  }

  breadcrumbItems.push({
    name: product.name,
    url: `/products/${product.slug}`,
  });

  return (
    <ErrorBoundary>
    <main className="relative overflow-x-hidden bg-brand-beige">
      <Navbar />
      <section className="nav-clearance section-spacing pb-8 sm:pb-0">
        <div className="gallery-container">
          <div className="mb-4 sm:mb-6">
            <Breadcrumb items={breadcrumbItems} className="hidden sm:flex" />
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <motion.div
              className="relative z-0 min-w-0 w-full"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            >
              <Product360Viewer
                images={product.gallery}
                productName={product.name}
                fallbackImage={product.image}
                activeIndex={selectedImageIndex}
                hideThumbnailsOnMobile={hasMultipleDesigns}
                onIndexChange={(index) => {
                  setSelectedImageIndex(index);
                  const image = product.galleryImages[index];
                  if (image) {
                    setSelectedImageId(image.id);
                  }
                }}
              />
            </motion.div>

            <motion.div
              className="relative z-10 min-w-0 w-full space-y-6 rounded-2xl border border-brand-teal/20 bg-brand-beige/85 p-4 shadow-[0_18px_40px_rgba(74,43,40,0.12)] backdrop-blur-sm sm:space-y-8 sm:rounded-[2.5rem] sm:p-8 sm:shadow-[0_28px_70px_rgba(74,43,40,0.16)] lg:p-10"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
            >
              <div className="space-y-3 sm:space-y-4">
                <h1 className="font-heading text-2xl text-brand-umber sm:text-4xl md:text-5xl">{product.name}</h1>
                <p className="text-sm leading-relaxed text-brand-umber/75 sm:text-base">{activeDescription}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-y border-brand-umber/15 py-4 sm:gap-6 sm:py-6">
                <p className="text-2xl font-heading text-brand-coral sm:text-3xl">{formatPrice(product.price)}</p>
                {isDiscounted && product.originalPrice && (
                  <span className="text-sm text-brand-umber/40 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="rounded-full bg-brand-coral/20 px-3 py-1 text-sm font-semibold text-brand-coral">
                    {discountPercent}% off
                  </span>
                )}
                {isOutOfStock && (
                  <div className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    Out of stock
                  </div>
                )}
              </div>

              <AdditionalInfo product={product} />

              {hasMultipleDesigns ? (
                <ProductDesignPicker
                  images={product.galleryImages}
                  quantities={designQuantities}
                  onQuantityChange={(imageId, quantity) => {
                    setDesignQuantities((prev) => ({ ...prev, [imageId]: quantity }));
                  }}
                  onPreview={(index) => {
                    setSelectedImageIndex(index);
                    const image = product.galleryImages[index];
                    if (image) {
                      setSelectedImageId(image.id);
                    }
                  }}
                />
              ) : null}

              <p className="text-xs leading-relaxed text-brand-umber/65">
                Handmade pieces may vary slightly in colour and finish.{" "}
                <Link href="/shipping" className="font-medium text-brand-teal hover:underline">
                  Shipping
                </Link>
                {" · "}
                <Link href="/returns" className="font-medium text-brand-teal hover:underline">
                  Returns
                </Link>
              </p>

              {isOutOfStock ? (
                <BackInStockNotifyForm productId={product.id} productName={product.name} />
              ) : (
                <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isAddDisabled}>
                  <ShoppingBag className="mr-2 h-5 w-5" /> {addButtonLabel}
                </Button>
              )}
            </motion.div>
          </div>

          {related.length > 0 && (
            <section className="mt-24 space-y-10">
              <div className="flex flex-col gap-4 text-left">
                <span className="caps-spacing text-xs text-brand-teal">You May Also Like</span>
                <h2 className="font-heading text-3xl text-brand-umber">
                  Discover more luminous pieces from this gallery.
                </h2>
                <p className="text-base text-brand-umber/70 max-w-2xl">
                  Handpicked selections that complement this piece, curated by our styling team.
                </p>
              </div>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ProductSummary key={`related-${item.id}`} product={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
    </ErrorBoundary>
  );
}

function ProductSummary({ product }: { product: ProductCardData }) {
  const { formatPrice } = useCurrency();
  const discountPercent = getDiscountPercent(product.price, product.originalPrice);
  const isDiscounted = hasValidDiscount(product.price, product.originalPrice);
  const isOutOfStock = product.isOutOfStock === true;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group block rounded-3xl border border-brand-teal/20 bg-white overflow-hidden shadow-[0_20px_50px_rgba(74,43,40,0.14)] transition-all duration-300 hover:border-brand-teal/35 hover:shadow-[0_26px_60px_rgba(74,43,40,0.16)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          {isDiscounted ? (
            <div className="absolute top-3 left-3 rounded-full bg-brand-coral px-2 py-1 text-xs font-semibold text-white">
              -{discountPercent}%
            </div>
          ) : null}
          {isOutOfStock ? (
            <div className="absolute top-3 right-3 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold uppercase text-white">
              Out of stock
            </div>
          ) : null}
        </div>
        <div className="space-y-3 p-6">
          <h3 className="font-heading text-xl text-brand-umber transition-colors group-hover:text-brand-teal">
            {product.name}
          </h3>
          {product.origin ? (
            <p className="text-xs text-brand-umber/60">From {product.origin}</p>
          ) : null}
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-lg font-semibold text-brand-coral">{formatPrice(product.price)}</p>
              {isDiscounted && product.originalPrice ? (
                <p className="text-sm text-brand-umber/40 line-through">{formatPrice(product.originalPrice)}</p>
              ) : null}
            </div>
            {product.materials.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {product.materials.slice(0, 2).map((material, idx) => (
                  <span
                    key={`${product.id}-material-${idx}`}
                    className="rounded-full bg-brand-jade/20 px-2 py-1 text-xs text-brand-umber/70"
                  >
                    {material.split(" ")[0]}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
