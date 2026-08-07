import type { Metadata } from "next";
import { Suspense } from "react";
import { BespokePageClient } from "./BespokePageClient";
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
      <BespokePageClient
        initialProducts={products}
        categories={categories}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
      />
    </Suspense>
  );
}
