"use client";

import { X } from "lucide-react";
import { FilterState } from "./ProductFilters";

interface ActiveFilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (type: keyof FilterState, value?: any) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  const activeFilters: Array<{ label: string; type: keyof FilterState; value?: any }> = [];

  if (filters.category !== "all") {
    const categoryLabels: Record<string, string> = {
      necklaces: "Necklaces",
      rings: "Rings",
      bracelets: "Bracelets",
      earrings: "Earrings",
      sets: "Sets",
    };
    activeFilters.push({
      label: categoryLabels[filters.category] || filters.category,
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
            if (filter.type === "materials" || filter.type === "origin") {
              const current = filters[filter.type] as string[];
              onRemoveFilter(
                filter.type,
                current.filter((v) => v !== filter.value)
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

