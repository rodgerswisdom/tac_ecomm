import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionsPageClient } from "@/app/collections/CollectionsPageClient";
import { BespokeCommissionSection } from "./BespokeStudioPageClient";
import { getBespokeProductCards } from "@/server/storefront/products";

export const metadata: Metadata = {
  title: "Bespoke & Limited Edition | TAC Accessories",
  description:
    "One-of-one and limited edition pieces from TAC Accessories. Shop exclusive works or commission a custom design.",
  alternates: {
    canonical: "/bespoke",
  },
};

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function BespokeLimitedEditionPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const initialCategory = parseParam(params.category);
  const initialSearch = parseParam(params.q);

  const products = await getBespokeProductCards();
  const categoryMap = new Map<string, string>();
  for (const product of products) {
    if (product.category && product.brand) {
      categoryMap.set(product.category, product.brand);
    }
  }
  const categories = Array.from(categoryMap.entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Suspense fallback={null}>
      <CollectionsPageClient
        initialProducts={products}
        categories={categories}
        collections={[]}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
        basePath="/bespoke"
        pageTitle="Bespoke & Limited Edition"
        pageDescription="One-of-one and limited release pieces. Each work is curated for collectors who want something singular."
        emptyTitle="No limited edition pieces yet"
        emptyDescription="Check back soon, or commission a custom piece below."
        footer={<BespokeCommissionSection />}
      />
    </Suspense>
  );
}
