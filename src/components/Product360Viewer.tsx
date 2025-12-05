"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product360ViewerProps {
  images: string[];
  productName: string;
  fallbackImage?: string;
}

export function Product360Viewer({
  images,
  productName,
  fallbackImage,
}: Product360ViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const autoRotateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use gallery images if available, otherwise fallback
  const displayImages = images.length > 0 ? images : fallbackImage ? [fallbackImage] : [];

  // Calculate rotation based on image index
  const totalImages = displayImages.length;
  const anglePerImage = totalImages > 1 ? 360 / totalImages : 0;

  // Handle mouse/touch drag
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setIsAutoRotating(false);
    if (autoRotateIntervalRef.current) {
      clearInterval(autoRotateIntervalRef.current);
      autoRotateIntervalRef.current = null;
    }
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || totalImages <= 1) return;

    const deltaX = clientX - startX;
    const sensitivity = 2; // Adjust rotation sensitivity
    const containerWidth = containerRef.current?.offsetWidth ?? 1;
    const deltaRotation = (deltaX / containerWidth) * 360 * sensitivity;

    let newRotation = rotation + deltaRotation;
    newRotation = ((newRotation % 360) + 360) % 360; // Normalize to 0-360

    // Calculate which image to show based on rotation
    const imageIndex = Math.round((newRotation / 360) * totalImages) % totalImages;
    setCurrentIndex(imageIndex);
    setRotation(newRotation);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
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

  // Touch events
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

  // Auto-rotate functionality
  const toggleAutoRotate = () => {
    if (isAutoRotating) {
      setIsAutoRotating(false);
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
        autoRotateIntervalRef.current = null;
      }
    } else {
      setIsAutoRotating(true);
      autoRotateIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalImages);
        setRotation((prev) => (prev + anglePerImage) % 360);
      }, 100); // Rotate every 100ms
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
      }
    };
  }, []);

  // If we don't have enough images for 360 view, show static image
  if (totalImages <= 1) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] border border-brand-teal/20 bg-white shadow-[0_35px_80px_rgba(74,43,40,0.18)]">
        <Image
          src={displayImages[0] || "/placeholder.png"}
          alt={productName}
          width={960}
          height={720}
          className="h-[520px] w-full rounded-[2.5rem] object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-[2.5rem] border border-brand-teal/20 bg-white shadow-[0_35px_80px_rgba(74,43,40,0.18)] cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative h-[520px] w-full overflow-hidden">
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

        {/* Rotation controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
              setRotation((prev) => (prev - anglePerImage + 360) % 360);
            }}
            className="h-8 w-8 p-0"
            aria-label="Rotate left"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleAutoRotate}
            className={`h-8 px-3 ${isAutoRotating ? "bg-brand-teal/20" : ""}`}
            aria-label={isAutoRotating ? "Stop auto-rotate" : "Start auto-rotate"}
          >
            {isAutoRotating ? "Stop" : "Auto"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentIndex((prev) => (prev + 1) % totalImages);
              setRotation((prev) => (prev + anglePerImage) % 360);
            }}
            className="h-8 w-8 p-0"
            aria-label="Rotate right"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Drag hint */}
        {!isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 bg-brand-umber/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm"
          >
            Drag to rotate
          </motion.div>
        )}
      </div>

      {/* Thumbnail navigation */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {displayImages.map((image, index) => (
          <button
            key={`thumb-${index}`}
            type="button"
            onClick={() => {
              setCurrentIndex(index);
              setRotation((index / totalImages) * 360);
            }}
            className={`relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border transition ${
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

