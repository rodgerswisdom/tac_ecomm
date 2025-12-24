"use client";

import { useState } from "react";
import { X, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FilterState {
  category: string;
  priceRange: [number, number] | null;
  materials: string[];
  origin: string[];
  sortBy: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableMaterials: string[];
  availableOrigins: string[];
  resultsCount: number;
  totalCount: number;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  availableMaterials,
  availableOrigins,
  resultsCount,
  totalCount,
}: ProductFiltersProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const priceRanges = [
    { label: "Under KES 20,000", value: [0, 20000] as [number, number] },
    { label: "KES 20,000 - 40,000", value: [20000, 40000] as [number, number] },
    { label: "KES 40,000 - 60,000", value: [40000, 60000] as [number, number] },
    { label: "Over KES 60,000", value: [60000, Infinity] as [number, number] },
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "necklaces", label: "Necklaces" },
    { value: "rings", label: "Rings" },
    { value: "bracelets", label: "Bracelets" },
    { value: "earrings", label: "Earrings" },
    { value: "sets", label: "Sets" },
  ];

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest Arrivals" },
    { value: "rating", label: "Highest Rated" },
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeMaterial = (material: string) => {
    updateFilter(
      "materials",
      filters.materials.filter((m) => m !== material)
    );
  };

  const removeOrigin = (origin: string) => {
    updateFilter(
      "origin",
      filters.origin.filter((o) => o !== origin)
    );
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: "all",
      priceRange: null,
      materials: [],
      origin: [],
      sortBy: "featured",
    });
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.priceRange !== null ||
    filters.materials.length > 0 ||
    filters.origin.length > 0;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-umber">
          Category
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-brand-umber/80 hover:text-brand-umber"
            >
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={filters.category === cat.value}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="h-4 w-4 border-brand-teal text-brand-teal focus:ring-brand-teal"
              />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-umber">
          Price Range
        </h3>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label
              key={index}
              className="flex cursor-pointer items-center gap-2 text-sm text-brand-umber/80 hover:text-brand-umber"
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
              <span>{range.label}</span>
            </label>
          ))}
          {filters.priceRange && (
            <button
              onClick={() => updateFilter("priceRange", null)}
              className="mt-2 text-xs text-brand-teal hover:underline"
            >
              Clear price filter
            </button>
          )}
        </div>
      </div>

      {/* Materials Filter */}
      {availableMaterials.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-umber">
            Materials
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableMaterials.map((material) => (
              <label
                key={material}
                className="flex cursor-pointer items-center gap-2 text-sm text-brand-umber/80 hover:text-brand-umber"
              >
                <input
                  type="checkbox"
                  checked={filters.materials.includes(material)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFilter("materials", [...filters.materials, material]);
                    } else {
                      removeMaterial(material);
                    }
                  }}
                  className="h-4 w-4 rounded border-brand-teal text-brand-teal focus:ring-brand-teal"
                />
                <span>{material}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Origin Filter */}
      {availableOrigins.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-umber">
            Origin
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableOrigins.map((origin) => (
              <label
                key={origin}
                className="flex cursor-pointer items-center gap-2 text-sm text-brand-umber/80 hover:text-brand-umber"
              >
                <input
                  type="checkbox"
                  checked={filters.origin.includes(origin)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFilter("origin", [...filters.origin, origin]);
                    } else {
                      removeOrigin(origin);
                    }
                  }}
                  className="h-4 w-4 rounded border-brand-teal text-brand-teal focus:ring-brand-teal"
                />
                <span>{origin}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button
          onClick={clearAllFilters}
          variant="outline"
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Button
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          variant="outline"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isMobileFiltersOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
        {isMobileFiltersOpen && (
          <div className="mt-4 rounded-lg border border-brand-teal/20 bg-white p-4">
            <FilterContent />
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 space-y-6 rounded-lg border border-brand-teal/20 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-brand-umber">
              Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-brand-teal hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>
    </>
  );
}

