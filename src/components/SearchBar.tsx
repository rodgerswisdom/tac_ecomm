"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { ProductCardData } from "@/types/product";
import { useCurrency } from "@/contexts/CurrencyContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { trackSearch } from "@/lib/analytics";

const SEARCH_LIMIT = 6;

type DropdownRect = {
  top: number;
  left: number;
  width: number;
};

export function SearchBar({ className }: { className?: string }) {
  const { formatPrice } = useCurrency();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DropdownRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const updateDropdownRect = useCallback(() => {
    const anchor = searchRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setDropdownRect({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}&limit=${SEARCH_LIMIT}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Failed to search products");
        }
        const data = await response.json();
        const products = Array.isArray(data.products) ? data.products : [];
        setResults(products);
        trackSearch(query, products.length);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query]);

  const shouldShowDropdown = isOpen && Boolean(query.trim());

  useEffect(() => {
    if (!shouldShowDropdown) {
      setDropdownRect(null);
      return;
    }

    updateDropdownRect();
    window.addEventListener("scroll", updateDropdownRect, true);
    window.addEventListener("resize", updateDropdownRect);

    return () => {
      window.removeEventListener("scroll", updateDropdownRect, true);
      window.removeEventListener("resize", updateDropdownRect);
    };
  }, [shouldShowDropdown, updateDropdownRect, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
      setIsFocused(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        setIsFocused(true);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsFocused(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setIsOpen(false);
    setIsFocused(false);
    setQuery("");
  };

  const handleViewAll = () => {
    router.push(`/collections?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
    setIsFocused(false);
    setQuery("");
  };

  const dropdownPanel =
    shouldShowDropdown && dropdownRect ? (
      <motion.div
        key="site-search-results"
        ref={dropdownRef}
        role="listbox"
        aria-label="Search results"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "fixed",
          top: dropdownRect.top,
          left: dropdownRect.left,
          width: dropdownRect.width,
          zIndex: 9999,
        }}
        className="max-h-[min(400px,70vh)] overflow-y-auto rounded-2xl border border-brand-umber/15 bg-white shadow-[0_24px_56px_rgba(74,43,40,0.18)]"
      >
        {isLoading ? (
          <div className="bg-white p-4 text-center text-sm text-brand-umber/60">
            Searching for &ldquo;{query}&rdquo;&hellip;
          </div>
        ) : results.length > 0 ? (
          <div className="bg-white p-2">
            {results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleResultClick(product.slug)}
                className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-brand-jade/10"
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-brand-umber/10">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-umber">{product.name}</p>
                  <p className="truncate text-xs text-brand-umber/60">{product.category}</p>
                  <p className="mt-0.5 text-xs font-semibold text-brand-coral">{formatPrice(product.price)}</p>
                </div>
              </button>
            ))}
            {results.length >= SEARCH_LIMIT && (
              <button
                type="button"
                onClick={handleViewAll}
                className="mt-2 w-full rounded-xl bg-brand-teal/10 p-3 text-sm font-medium text-brand-teal transition-colors hover:bg-brand-teal/20"
              >
                View all results for &ldquo;{query}&rdquo;
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white p-4 text-center text-sm text-brand-umber/60">
            No products found for &ldquo;{query}&rdquo;
          </div>
        )}
      </motion.div>
    ) : null;

  return (
    <>
      <div
        ref={searchRef}
        className={cn("relative mx-4 w-full max-w-md flex-1", className)}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-umber/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (query.trim()) setIsOpen(true);
            }}
            placeholder="Search..."
            className={cn(
              "w-full rounded-full border border-brand-umber/20 bg-white py-1.5 pl-8 pr-8 text-sm text-brand-umber placeholder:text-brand-umber/50",
              "focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30",
              "transition-all duration-200",
              isFocused && "border-brand-teal ring-2 ring-brand-teal/30",
            )}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-umber/50 transition-colors hover:text-brand-umber"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 text-[10px] text-brand-umber/40 xl:flex">
              <kbd className="rounded border border-brand-umber/10 bg-brand-umber/5 px-1 py-0.5">⌘</kbd>
              <span className="text-brand-umber/30">K</span>
            </div>
          )}
        </div>
      </div>

      {mounted
        ? createPortal(
            <AnimatePresence mode="wait">{dropdownPanel}</AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
