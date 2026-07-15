"use client";

import { useEffect, useRef, useState } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = activeIndex !== undefined;
  const currentIndex = isControlled ? activeIndex : internalIndex;

  const setCurrentIndex = (index: number) => {
    if (!isControlled) {
      setInternalIndex(index);
    }
    onIndexChange?.(index);
  };

  // Use gallery images if available, otherwise fallback
  const displayImages = images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

  // Calculate rotation based on image index
  const totalImages = displayImages.length;
  const anglePerImage = totalImages > 1 ? 360 / totalImages : 0;

  useEffect(() => {
    if (!isControlled || totalImages <= 1) return;
    const normalized = ((activeIndex % totalImages) + totalImages) % totalImages;
    setRotation((normalized / totalImages) * 360);
  }, [activeIndex, isControlled, totalImages]);

  // Handle mouse/touch drag
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || totalImages <= 1) return;

    const deltaX = clientX - startX;
    const sensitivity = 2;
    const containerWidth = containerRef.current?.offsetWidth ?? 1;
    const deltaRotation = (deltaX / containerWidth) * 360 * sensitivity;

    let newRotation = rotation + deltaRotation;
    newRotation = ((newRotation % 360) + 360) % 360;

    const imageIndex = Math.round((newRotation / 360) * totalImages) % totalImages;
    setCurrentIndex(imageIndex);
    setRotation(newRotation);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

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
      <div
        ref={containerRef}
        className="relative isolate w-full max-w-full overflow-hidden rounded-2xl border border-brand-teal/20 bg-white shadow-lg sm:rounded-[2.5rem] sm:shadow-[0_35px_80px_rgba(74,43,40,0.18)] cursor-grab active:cursor-grabbing select-none touch-pan-y"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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

        {!isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-3 top-3 bg-brand-umber/80 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm sm:right-4 sm:top-4 sm:text-xs sm:px-3 sm:py-1.5"
          >
            Swipe to rotate
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const nextIndex = (currentIndex - 1 + totalImages) % totalImages;
            setCurrentIndex(nextIndex);
            setRotation((prev) => (prev - anglePerImage + 360) % 360);
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
            setRotation((prev) => (prev + anglePerImage) % 360);
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
            onClick={() => {
              setCurrentIndex(index);
              setRotation((index / totalImages) * 360);
            }}
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
