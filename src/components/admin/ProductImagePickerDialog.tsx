"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Image from "next/image"
import { ArrowLeft, Images, Loader2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  getProductImagesForCategoryAction,
  searchProductsForCategoryImageAction,
  type CategoryImageOption,
  type CategoryImageProductOption,
} from "@/server/admin/categories"
import { cn } from "@/lib/utils"

type ProductImagePickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

export function ProductImagePickerDialog({
  open,
  onOpenChange,
  onSelect,
}: ProductImagePickerDialogProps) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<CategoryImageProductOption[]>([])
  const [selectedProduct, setSelectedProduct] = useState<CategoryImageProductOption | null>(null)
  const [images, setImages] = useState<CategoryImageOption[]>([])
  const [isPending, startTransition] = useTransition()
  const [isLoadingImages, startImageTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setProducts([])
      setSelectedProduct(null)
      setImages([])
    }
  }, [open])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setProducts([])
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const results = await searchProductsForCategoryImageAction(trimmed)
        setProducts(results)
      })
    }, 250)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleSelectProduct = (product: CategoryImageProductOption) => {
    if (product.imageCount === 0) {
      return
    }

    setSelectedProduct(product)
    startImageTransition(async () => {
      const nextImages = await getProductImagesForCategoryAction(product.id)
      setImages(nextImages)
    })
  }

  const handleSelectImage = (url: string) => {
    onSelect(url)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a product image</DialogTitle>
          <DialogDescription>
            Search for a product, then pick one of its gallery images for this category.
          </DialogDescription>
        </DialogHeader>

        {selectedProduct ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setSelectedProduct(null)
                  setImages([])
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to products
              </Button>
              <p className="truncate text-sm text-muted-foreground">{selectedProduct.name}</p>
            </div>

            {isLoadingImages ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading images…
              </div>
            ) : images.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                This product has no images yet.
              </p>
            ) : (
              <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => handleSelectImage(image.url)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-brand-teal/20 transition hover:border-brand-teal hover:shadow-md"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt ?? `${image.productName} image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover transition group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-brand-umber/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      Use this image
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products by name or SKU…"
                className="pl-10"
                autoComplete="off"
              />
              {isPending ? (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : null}
            </div>

            {query.trim().length < 2 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search products.
              </p>
            ) : products.length === 0 && !isPending ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No products found for “{query.trim()}”.
              </p>
            ) : (
              <div className="max-h-[50vh] space-y-2 overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    disabled={product.imageCount === 0}
                    onClick={() => handleSelectProduct(product)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border border-brand-teal/15 bg-white px-3 py-3 text-left transition",
                      product.imageCount === 0
                        ? "cursor-not-allowed opacity-50"
                        : "hover:border-brand-teal/40 hover:bg-brand-jade/10",
                    )}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-beige/60">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-brand-umber/40">
                          <Images className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-brand-umber">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU {product.sku}
                        {product.imageCount > 0
                          ? ` · ${product.imageCount} image${product.imageCount === 1 ? "" : "s"}`
                          : " · No images"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
