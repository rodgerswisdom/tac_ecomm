"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Image from "next/image"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { searchOfferProductsAction, type OfferProductOption } from "@/server/admin/settings"
import { cn } from "@/lib/utils"

type OfferProductPickerProps = {
  initialProduct?: OfferProductOption | null
}

export function OfferProductPicker({ initialProduct = null }: OfferProductPickerProps) {
  const [selected, setSelected] = useState<OfferProductOption | null>(initialProduct)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<OfferProductOption[]>([])
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSelected(initialProduct)
  }, [initialProduct])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const next = await searchOfferProductsAction(trimmed)
        setResults(next)
        setOpen(true)
      })
    }, 250)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  return (
    <div ref={containerRef} className="space-y-4 md:col-span-2">
      <input type="hidden" name="offerProductId" value={selected?.id ?? ""} />

      {selected ? (
        <div className="flex items-center gap-4 rounded-2xl border border-[#2d3b34]/10 bg-white p-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#b8d3c2]/20">
            {selected.image ? (
              <Image
                src={selected.image}
                alt={selected.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[#2d3b34]">{selected.name}</p>
            <p className="text-sm text-muted-foreground">SKU {selected.sku}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelected(null)
              setQuery("")
              setResults([])
            }}
            aria-label="Clear selected product"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (results.length > 0) setOpen(true)
            }}
            placeholder="Search products by name or SKU…"
            className="rounded-xl border-[#2d3b34]/10 bg-white pl-10"
            autoComplete="off"
          />
          {isPending ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}

          {open && (results.length > 0 || query.trim().length >= 2) ? (
            <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-[#2d3b34]/10 bg-white shadow-lg">
              {results.length === 0 && !isPending ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No products found for “{query.trim()}”
                </p>
              ) : (
                results.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#b8d3c2]/20"
                    )}
                    onClick={() => {
                      setSelected(product)
                      setQuery("")
                      setResults([])
                      setOpen(false)
                    }}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#b8d3c2]/20">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#2d3b34]">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU {product.sku}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
