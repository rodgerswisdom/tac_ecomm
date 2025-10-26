"use client";

import { useState } from "react";
import { CategoryDropdown, SortDropdown } from "@/components/ui/custom-dropdown";

export default function DropdownTest() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  return (
    <div className="p-8 space-y-8 bg-brand-beige min-h-screen">
      <h1 className="text-2xl font-bold text-brand-umber">Dropdown Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-brand-umber">Category Dropdown</h2>
        <div className="w-64">
          <CategoryDropdown
            value={category}
            onChange={setCategory}
          />
        </div>
        <p className="text-sm text-brand-umber/70">Selected: {category}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-brand-umber">Sort Dropdown</h2>
        <div className="w-48">
          <SortDropdown
            value={sort}
            onChange={setSort}
          />
        </div>
        <p className="text-sm text-brand-umber/70">Selected: {sort}</p>
      </div>

      <div className="mt-8 p-4 bg-white rounded-lg border border-brand-umber/20">
        <h3 className="font-semibold text-brand-umber mb-2">Test Results:</h3>
        <p className="text-sm text-brand-umber/70">Category: {category}</p>
        <p className="text-sm text-brand-umber/70">Sort: {sort}</p>
      </div>
    </div>
  );
}