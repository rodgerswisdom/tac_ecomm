import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionsPageClient } from "./CollectionsPageClient";
import { getProductCardData } from "@/server/storefront/products";
import { getCollectionSummaries } from "@/server/storefront/collections";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  alternates: {
    canonical: "/collections",
  },
};

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const initialCategory = parseParam(params.category);
  const initialSearch = parseParam(params.q);

  const products = await getProductCardData();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
    },
  });
  const collectionSummaries = await getCollectionSummaries({ includeVirtual: true });
  const categorySlugs = new Set(categories.map((category) => category.slug));
  const collections = collectionSummaries
    .filter((collection) => !categorySlugs.has(collection.slug))
    .map((collection) => ({ slug: collection.slug, name: collection.name }));

  return (
    <Suspense fallback={null}>
      <CollectionsPageClient
        initialProducts={products}
        categories={categories}
        collections={collections}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
      />
    </Suspense>
  );
}
