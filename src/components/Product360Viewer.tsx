"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product360ViewerProps {
  images: string[];
  productName: string;
  fallbackImage?: string;
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Hide the thumbnail strip on small screens (e.g. when a design picker is shown below). */
  hideThumbnailsOnMobile?: boolean;
}

export function Product360Viewer({
  images,
  productName,
  fallbackImage,
  activeIndex,
  onIndexChange,
  hideThumbnailsOnMobile = false,
}: Product360ViewerProps) {
  const [internalIndex, setInternalIndex] = useState(0);

  const isControlled = activeIndex !== undefined;
  const currentIndex = isControlled ? activeIndex : internalIndex;

  const setCurrentIndex = (index: number) => {
    if (!isControlled) {
      setInternalIndex(index);
    }
    onIndexChange?.(index);
  };

  const displayImages = images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];
  const totalImages = displayImages.length;

  if (totalImages <= 1) {
    return (
      <div className="relative isolate w-full max-w-full overflow-hidden rounded-2xl border border-brand-teal/20 bg-white shadow-lg sm:rounded-[2.5rem] sm:shadow-[0_35px_80px_rgba(74,43,40,0.18)]">
        <Image
          src={displayImages[0] || "/placeholder.png"}
          alt={productName}
          width={960}
          height={720}
          className="aspect-[4/5] w-full object-cover sm:aspect-auto sm:h-[420px] lg:h-[520px]"
          priority
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-3 sm:space-y-4">
      <div className="relative isolate w-full max-w-full overflow-hidden rounded-2xl border border-brand-teal/20 bg-white shadow-lg sm:rounded-[2.5rem] sm:shadow-[0_35px_80px_rgba(74,43,40,0.18)]">
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-auto sm:h-[420px] lg:h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={displayImages[currentIndex]}
                alt={`${productName} - View ${currentIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 960px"
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const nextIndex = (currentIndex - 1 + totalImages) % totalImages;
            setCurrentIndex(nextIndex);
          }}
          className="h-10 w-10 rounded-full p-0"
          aria-label="Previous image"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[4rem] text-center text-xs text-brand-umber/60">
          {currentIndex + 1} / {totalImages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const nextIndex = (currentIndex + 1) % totalImages;
            setCurrentIndex(nextIndex);
          }}
          className="h-10 w-10 rounded-full p-0"
          aria-label="Next image"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={`flex gap-2 overflow-x-auto pb-1 sm:gap-4 sm:pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          hideThumbnailsOnMobile ? "hidden sm:flex" : "flex"
        }`}
      >
        {displayImages.map((image, index) => (
          <button
            key={`thumb-${index}`}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition sm:h-24 sm:w-24 sm:rounded-2xl lg:h-28 lg:w-28 ${
              currentIndex === index
                ? "border-brand-gold shadow-[0_12px_30px_rgba(223,160,83,0.28)]"
                : "border-brand-teal/20"
            }`}
          >
            <Image
              src={image}
              alt={`${productName} view ${index + 1}`}
              fill
              sizes="112px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
