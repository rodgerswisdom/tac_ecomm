"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { convertToBase, type CurrencyCode } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/types/product";

export interface FilterState {
  category: string;
  priceRange: [number, number] | null;
  materials: string[];
}

export interface CategoryOption {
  slug: string;
  name: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableMaterials: string[];
  categories: CategoryOption[];
  collections: CategoryOption[];
  products: ProductCardData[];
}

/** Distinct, non-overlapping price tiers in display-currency units. */
export const PRICE_RANGES = [
  { label: "Under 500", min: 0, max: 500 },
  { label: "500–1,000", min: 500, max: 1000 },
  { label: "1,000–2,000", min: 1000, max: 2000 },
  { label: "2,000–5,000", min: 2000, max: 5000 },
  { label: "Over 5,000", min: 5000, max: Infinity },
] as const;

export function getPriceRangeLabel(
  range: [number, number] | null,
  _currency: CurrencyCode,
  formatPrice: (amountBase: number) => string,
): string {
  if (!range) return "";
  return formatPriceRangeLabel(range, formatPrice);
}

export function formatPriceRangeLabel(
  [min, max]: [number, number],
  formatPrice: (amountBase: number) => string,
): string {
  if (max === Infinity) {
    return `Over ${formatPrice(min)}`;
  }
  if (min === 0) {
    return `Under ${formatPrice(max)}`;
  }
  return `${formatPrice(min)}–${formatPrice(max)}`;
}

function matchesCategory(product: ProductCardData, categorySlug: string) {
  if (categorySlug === "all") return true;
  if (categorySlug === "corporate-gifts") return Boolean(product.isCorporateGift);
  return product.category === categorySlug;
}

function FilterGroup({
  id,
  title,
  defaultOpen,
  activeCount,
  children,
}: {
  id: string;
  title: string;
  defaultOpen: boolean;
  activeCount?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-brand-umber/10 pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        id={`${id}-heading`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 py-1 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-umber">
          {title}
          {activeCount && activeCount > 0 ? (
            <span className="rounded-full bg-brand-teal/15 px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-brand-teal">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-brand-umber/50 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-heading`} className="mt-3 space-y-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function OptionCount({ count }: { count: number }) {
  return (
    <span className="ml-auto shrink-0 text-xs tabular-nums text-brand-umber/45">{count}</span>
  );
}

export function ProductFilters({
  filters,
  onFiltersChange,
  availableMaterials,
  categories,
  collections,
  products,
}: ProductFiltersProps) {
  const { currency } = useCurrency();

  const productsForSecondary = useMemo(
    () => products.filter((product) => matchesCategory(product, filters.category)),
    [filters.category, products],
  );

  const categoryOptions = useMemo(() => {
    const options = [
      { value: "all", label: "All", count: products.length },
      ...categories.map((category) => ({
        value: category.slug,
        label: category.name,
        count: products.filter((product) => product.category === category.slug).length,
      })),
    ];
    return options.filter(
      (option) => option.value === "all" || option.count > 0 || filters.category === option.value,
    );
  }, [categories, filters.category, products]);

  const collectionOptions = useMemo(() => {
    return collections
      .map((collection) => ({
        value: collection.slug,
        label: collection.name,
        count:
          collection.slug === "corporate-gifts"
            ? products.filter((product) => product.isCorporateGift).length
            : products.filter((product) => product.category === collection.slug).length,
      }))
      .filter((option) => option.count > 0 || filters.category === option.value);
  }, [collections, filters.category, products]);

  const materialOptions = useMemo(() => {
    return availableMaterials
      .map((material) => ({
        value: material,
        count: productsForSecondary.filter((product) =>
          product.materials.some((entry) => entry.toLowerCase() === material.toLowerCase()),
        ).length,
      }))
      .filter((option) => option.count > 0 || filters.materials.includes(option.value));
  }, [availableMaterials, filters.materials, productsForSecondary]);

  const priceOptions = useMemo(() => {
    const ranges = PRICE_RANGES.map((range) => ({
      label: range.label,
      value: [
        range.min > 0 ? convertToBase(range.min, currency) : 0,
        range.max === Infinity ? Infinity : convertToBase(range.max, currency),
      ] as [number, number],
    }));

    return ranges.map((range) => ({
      ...range,
      count: productsForSecondary.filter((product) => {
        if (range.value[1] === Infinity) return product.price >= range.value[0];
        return product.price >= range.value[0] && product.price < range.value[1];
      }).length,
    }));
  }, [currency, productsForSecondary]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: "all",
      priceRange: null,
      materials: [],
    });
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.priceRange !== null ||
    filters.materials.length > 0;

  return (
    <div className="sticky top-24 space-y-5 rounded-2xl border border-brand-teal/20 bg-white p-5 shadow-[0_12px_32px_rgba(74,43,40,0.06)] lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-brand-umber">Filters</h2>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-medium text-brand-teal hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="space-y-4">
        <FilterGroup id="filter-categories" title="Categories" defaultOpen>
          <div className="space-y-1.5">
            {categoryOptions.map((cat) => (
              <label
                key={cat.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-brand-jade/10",
                  filters.category === cat.value
                    ? "bg-brand-jade/10 font-medium text-brand-umber"
                    : "text-brand-umber/80",
                )}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={filters.category === cat.value}
                  onChange={(e) => updateFilter("category", e.target.value)}
                  className="h-4 w-4 border-brand-teal text-brand-teal focus:ring-brand-teal"
                />
                <span className="min-w-0 flex-1 truncate">{cat.label}</span>
                <OptionCount count={cat.count} />
              </label>
            ))}
          </div>

          {collectionOptions.length > 0 ? (
            <div className="mt-3 rounded-xl border border-brand-teal/15 bg-brand-teal/5 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-brand-teal">
                Curated
              </p>
              <div className="space-y-1.5">
                {collectionOptions.map((collection) => (
                  <label
                    key={collection.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-white/70",
                      filters.category === collection.value
                        ? "bg-white/80 font-medium text-brand-umber"
                        : "text-brand-umber/80",
                    )}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={collection.value}
                      checked={filters.category === collection.value}
                      onChange={(e) => updateFilter("category", e.target.value)}
                      className="h-4 w-4 border-brand-teal text-brand-teal focus:ring-brand-teal"
                    />
                    <span className="min-w-0 flex-1 truncate">{collection.label}</span>
                    <OptionCount count={collection.count} />
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </FilterGroup>

        <FilterGroup
          id="filter-price"
          title="Price"
          defaultOpen={Boolean(filters.priceRange)}
          activeCount={filters.priceRange ? 1 : 0}
        >
          {priceOptions.map((range, index) => (
            <label
              key={index}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-brand-jade/10",
                filters.priceRange?.[0] === range.value[0] &&
                  filters.priceRange?.[1] === range.value[1]
                  ? "bg-brand-jade/10 font-medium text-brand-umber"
                  : "text-brand-umber/80",
              )}
            >
              <input
                type="radio"
                name="priceRange"
                checked={
                  filters.priceRange?.[0] === range.value[0] &&
                  filters.priceRange?.[1] === range.value[1]
                }
                onChange={() => updateFilter("priceRange", range.value)}
                className="h-4 w-4 border-brand-teal text-brand-teal focus:ring-brand-teal"
              />
              <span className="min-w-0 flex-1">{range.label}</span>
              <OptionCount count={range.count} />
            </label>
          ))}
          {filters.priceRange ? (
            <button
              type="button"
              onClick={() => updateFilter("priceRange", null)}
              className="mt-1 text-xs text-brand-teal hover:underline"
            >
              Clear price
            </button>
          ) : null}
        </FilterGroup>

        {materialOptions.length > 0 ? (
          <FilterGroup
            id="filter-materials"
            title="Materials"
            defaultOpen={filters.materials.length > 0}
            activeCount={filters.materials.length}
          >
            <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
              {materialOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-brand-jade/10",
                    filters.materials.includes(option.value)
                      ? "bg-brand-jade/10 font-medium text-brand-umber"
                      : "text-brand-umber/80",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={filters.materials.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilter("materials", [...filters.materials, option.value]);
                      } else {
                        updateFilter(
                          "materials",
                          filters.materials.filter((material) => material !== option.value),
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-brand-teal text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="min-w-0 flex-1 truncate">{option.value}</span>
                  <OptionCount count={option.count} />
                </label>
              ))}
            </div>
          </FilterGroup>
        ) : null}
      </div>

      {hasActiveFilters ? (
        <Button onClick={clearAllFilters} variant="outline" className="w-full lg:hidden">
          Clear all filters
        </Button>
      ) : null}
    </div>
  );
}
