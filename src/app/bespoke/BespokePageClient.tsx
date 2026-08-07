"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionsPageClient } from "@/app/collections/CollectionsPageClient";
import { BespokeProcessSection, BespokeRequestModal } from "./BespokeStudioPageClient";
import type { ProductCardData } from "@/types/product";
import type { CategoryOption } from "@/components/ProductFilters";

interface BespokePageClientProps {
  initialProducts: ProductCardData[];
  categories: CategoryOption[];
  initialCategory?: string;
  initialSearch?: string;
}

export function BespokePageClient({
  initialProducts,
  categories,
  initialCategory,
  initialSearch,
}: BespokePageClientProps) {
  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <>
      <CollectionsPageClient
        initialProducts={initialProducts}
        categories={categories}
        collections={[]}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
        basePath="/bespoke"
        pageTitle="Bespoke & Limited Edition"
        pageDescription="One-of-one and limited release pieces. Each work is curated for collectors who want something singular."
        emptyTitle="No limited edition pieces yet"
        emptyDescription="Check back soon, or request a custom piece using the button above."
        heroAction={
          <Button size="lg" onClick={() => setRequestOpen(true)}>
            <Sparkles className="mr-2 h-5 w-5" />
            Request bespoke piece
          </Button>
        }
        footer={
          <BespokeProcessSection onRequestClick={() => setRequestOpen(true)} />
        }
      />
      <BespokeRequestModal open={requestOpen} onOpenChange={setRequestOpen} />
    </>
  );
}
