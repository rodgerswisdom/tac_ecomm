"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { ChevronDown, Minus, Plus } from "lucide-react"
import { formatProductImageLabel } from "@/lib/product-image-selection"
import type { ProductGalleryImage } from "@/types/product"
import { cn } from "@/lib/utils"

type ProductDesignPickerProps = {
  images: ProductGalleryImage[]
  quantities: Record<string, number>
  onQuantityChange: (imageId: string, quantity: number) => void
  onPreview: (index: number) => void
  className?: string
}

export function ProductDesignPicker({
  images,
  quantities,
  onQuantityChange,
  onPreview,
  className,
}: ProductDesignPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const totalSelected = useMemo(
    () => Object.values(quantities).reduce((total, qty) => total + qty, 0),
    [quantities],
  )

  const selectedDesignCount = useMemo(
    () => Object.values(quantities).filter((qty) => qty > 0).length,
    [quantities],
  )

  if (images.length <= 1) {
    return null
  }

  const summaryLabel =
    totalSelected > 0
      ? `${selectedDesignCount} design${selectedDesignCount === 1 ? "" : "s"} · ${totalSelected} item${totalSelected === 1 ? "" : "s"}`
      : "Choose quantities for each design"

  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded((open) => !open)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-brand-teal/25 bg-white/70 px-4 py-3 text-left transition hover:border-brand-teal/40 sm:hidden"
        aria-expanded={isExpanded}
        aria-controls="product-design-picker-list"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-umber/85">Select designs</p>
          <p className="truncate text-xs text-brand-umber/55">{summaryLabel}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-brand-umber/50 transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </button>

      <h2 className="mb-3 hidden text-sm font-medium text-brand-umber/80 sm:block">
        Select designs
      </h2>

      <div
        id="product-design-picker-list"
        className={cn(
          "max-h-[min(50vh,22rem)] space-y-2 overflow-y-auto overscroll-contain pr-0.5 sm:max-h-none sm:pr-0",
          !isExpanded && "hidden sm:block",
        )}
      >
        {images.map((image, index) => {
          const quantity = quantities[image.id] ?? 0
          const isActive = quantity > 0
          const label = formatProductImageLabel(image, index)

          return (
            <div
              key={image.id}
              className={cn(
                "rounded-2xl border p-3 transition-colors",
                isActive
                  ? "border-brand-teal/40 bg-white/80"
                  : "border-brand-teal/15 bg-white/50",
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onPreview(index)}
                    className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-brand-teal/20 transition hover:border-brand-teal/40 sm:h-12 sm:w-12"
                    aria-label={`Preview ${label}`}
                  >
                    <Image
                      src={image.url}
                      alt={label}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onPreview(index)}
                    className="min-w-0 flex-1 truncate text-left text-sm font-medium text-brand-umber/80 transition hover:text-brand-umber"
                  >
                    {label}
                  </button>
                </div>

                <div className="flex justify-center sm:shrink-0 sm:justify-end">
                  <div className="inline-flex w-full max-w-[11rem] items-center justify-between gap-3 rounded-full border border-brand-teal/25 px-3 py-1.5 text-sm text-brand-umber/70 sm:w-auto sm:max-w-none">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(image.id, Math.max(0, quantity - 1))}
                      disabled={quantity <= 0}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-jade/40 text-brand-umber/70 transition hover:bg-brand-jade/55 disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
                      aria-label={`Decrease ${label} quantity`}
                    >
                      <Minus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-base font-medium tabular-nums sm:text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(image.id, quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-jade/40 text-brand-umber/70 transition hover:bg-brand-jade/55 sm:h-8 sm:w-8"
                      aria-label={`Increase ${label} quantity`}
                    >
                      <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
