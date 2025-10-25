"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CarouselContextValue = {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  slideCount: number;
  registerSlideCount: (count: number) => void;
  orientation: "horizontal" | "vertical";
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

export const useCarousel = () => {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within <Carousel>");
  }
  return context;
};

type CarouselProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  onSlideChange?: (index: number) => void;
};

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      className,
      children,
      orientation = "horizontal",
      onSlideChange,
      ...props
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [slideCount, setSlideCount] = React.useState(0);

    const handleSetActive = React.useCallback(
      (index: number) => {
        const nextIndex = index < 0
          ? slideCount - 1
          : index >= slideCount
            ? 0
            : index;
        setActiveIndex(nextIndex);
        onSlideChange?.(nextIndex);
      },
      [slideCount, onSlideChange],
    );

    const registerSlideCount = React.useCallback((count: number) => {
      setSlideCount(count);
    }, []);

    const value = React.useMemo(
      () => ({
        activeIndex,
        setActiveIndex: handleSetActive,
        slideCount,
        registerSlideCount,
        orientation,
      }),
      [activeIndex, handleSetActive, slideCount, registerSlideCount, orientation],
    );

    return (
      <CarouselContext.Provider value={value}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { activeIndex, registerSlideCount, orientation } = useCarousel();
  const items = React.Children.toArray(children);

  React.useEffect(() => {
    registerSlideCount(items.length);
  }, [items.length, registerSlideCount]);

  return (
    <div className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className,
        )}
        style={{
          transform:
            orientation === "horizontal"
              ? `translateX(-${activeIndex * 100}%)`
              : `translateY(-${activeIndex * 100}%)`,
        }}
        {...props}
      >
        {items}
      </div>
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "min-w-0 shrink-0 grow-0 basis-full px-4",
      className,
    )}
    {...props}
  />
));
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { setActiveIndex, activeIndex } = useCarousel();

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setActiveIndex(activeIndex - 1)}
      className={cn(
        "absolute left-0 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-teal/25 bg-white text-brand-umber shadow-[0_12px_30px_rgba(74,43,40,0.14)] transition hover:-translate-y-[calc(50%+2px)] hover:bg-brand-jade/25",
        className,
      )}
      aria-label="Previous slide"
      {...props}
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { setActiveIndex, activeIndex } = useCarousel();

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setActiveIndex(activeIndex + 1)}
      className={cn(
        "absolute right-0 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-teal/25 bg-white text-brand-umber shadow-[0_12px_30px_rgba(74,43,40,0.14)] transition hover:-translate-y-[calc(50%+2px)] hover:bg-brand-jade/25",
        className,
      )}
      aria-label="Next slide"
      {...props}
    >
      <ChevronRight className="h-5 w-5" />
    </button>
  );
});
CarouselNext.displayName = "CarouselNext";

const CarouselIndicators = ({ className }: { className?: string }) => {
  const { slideCount, activeIndex, setActiveIndex } = useCarousel();
  return (
    <div className={cn("mt-8 flex items-center justify-center gap-3", className)}>
      {Array.from({ length: slideCount }).map((_, index) => (
        <button
          key={`indicator-${index}`}
          type="button"
          onClick={() => setActiveIndex(index)}
          className={cn(
            "h-2.5 rounded-full bg-brand-umber/20 transition",
            index === activeIndex ? "w-6 bg-brand-gold" : "w-2.5",
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
};
