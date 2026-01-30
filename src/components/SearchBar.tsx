"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { featuredProducts } from "@/data/content";
import { ProductCardData } from "@/components/ProductCard";
import { useCurrency } from "@/contexts/CurrencyContext";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const { formatPrice } = useCurrency();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const searchTerm = query.toLowerCase().trim();
      const filtered = featuredProducts.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const descMatch = product.description.toLowerCase().includes(searchTerm);
        const categoryMatch = product.category?.toLowerCase().includes(searchTerm) ?? false;
        const materialsMatch = product.materials.some((m) =>
          m.toLowerCase().includes(searchTerm)
        );
        return nameMatch || descMatch || categoryMatch || materialsMatch;
      });

      setResults(filtered.slice(0, 6));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + K)
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

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md mx-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-umber/50" />
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
          placeholder="Search products..."
          className={cn(
            "w-full pl-10 pr-10 py-2 rounded-full border border-brand-umber/20 bg-white/90 backdrop-blur-sm",
            "text-sm text-brand-umber placeholder:text-brand-umber/50",
            "focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal",
            "transition-all duration-200",
            isFocused && "ring-2 ring-brand-teal/30 border-brand-teal"
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-umber/50 hover:text-brand-umber transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-brand-umber/40 pointer-events-none">
          <kbd className="px-1.5 py-0.5 rounded bg-brand-umber/5 border border-brand-umber/10">
            ⌘
          </kbd>
          <span className="text-brand-umber/30">K</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl rounded-2xl border border-brand-umber/20 shadow-[0_20px_48px_rgba(74,43,40,0.15)] z-50 max-h-[400px] overflow-y-auto"
          >
            <div className="p-2">
              {results.map((product) => (
                <motion.button
                  key={product.id}
                  onClick={() => handleResultClick(product.slug)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-brand-jade/10 transition-colors text-left group"
                  whileHover={{ x: 2 }}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-brand-umber/10">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-umber truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-brand-umber/60 truncate">
                      {product.category}
                    </p>
                    <p className="text-xs font-semibold text-brand-coral mt-0.5">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </motion.button>
              ))}
              {results.length >= 6 && (
                <button
                  onClick={handleViewAll}
                  className="w-full mt-2 p-3 rounded-xl bg-brand-teal/10 hover:bg-brand-teal/20 text-sm font-medium text-brand-teal transition-colors"
                >
                  View all results for "{query}"
                </button>
              )}
            </div>
          </motion.div>
        )}
        {isOpen && query.trim() && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl rounded-2xl border border-brand-umber/20 shadow-[0_20px_48px_rgba(74,43,40,0.15)] z-50 p-4 text-center"
          >
            <p className="text-sm text-brand-umber/60">
              No products found for "{query}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

