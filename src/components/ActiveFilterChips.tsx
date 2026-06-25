"use client";

import { X } from "lucide-react";
import { FilterState } from "./ProductFilters";
import type { CategoryOption } from "./ProductFilters";

interface ActiveFilterChipsProps {
  filters: FilterState;
  categories: CategoryOption[];
  collections: CategoryOption[];
  onRemoveFilter: <K extends keyof FilterState>(type: K, value?: FilterState[K]) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  categories,
  collections,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  const categoryLabels = new Map(
    [...categories, ...collections].map((option) => [option.slug, option.name])
  );
  type ActiveFilter =
    | { label: string; type: "category"; value: FilterState["category"] }
    | { label: string; type: "priceRange"; value: FilterState["priceRange"] }
    | { label: string; type: "materials"; value: string }
    | { label: string; type: "origin"; value: string };

  const activeFilters: ActiveFilter[] = [];

  if (filters.category !== "all") {
    activeFilters.push({
      label: categoryLabels.get(filters.category) ?? filters.category,
      type: "category",
      value: "all",
    });
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    const label =
      max === Infinity
        ? `Over KES ${min.toLocaleString()}`
        : `KES ${min.toLocaleString()} - ${max.toLocaleString()}`;
    activeFilters.push({ label, type: "priceRange", value: null });
  }

  filters.materials.forEach((material) => {
    activeFilters.push({ label: material, type: "materials", value: material });
  });

  filters.origin.forEach((origin) => {
    activeFilters.push({ label: origin, type: "origin", value: origin });
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-brand-umber/70">Active filters:</span>
      {activeFilters.map((filter, index) => (
        <button
          key={index}
          onClick={() => {
            if (filter.type === "materials") {
              onRemoveFilter(
                "materials",
                filters.materials.filter((v) => v !== filter.value)
              );
            } else if (filter.type === "origin") {
              onRemoveFilter(
                "origin",
                filters.origin.filter((v) => v !== filter.value)
              );
            } else {
              onRemoveFilter(filter.type, filter.value);
            }
          }}
          className="group flex items-center gap-1.5 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-3 py-1 text-xs font-medium text-brand-umber transition-colors hover:bg-brand-teal/20"
        >
          <span>{filter.label}</span>
          <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
        </button>
      ))}
      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-brand-teal hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

