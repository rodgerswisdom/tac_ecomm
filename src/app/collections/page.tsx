import type { Metadata } from "next";
import { CollectionsPageClient } from "./CollectionsPageClient";
import { getProductCardData } from "@/server/storefront/products";
import { getCollectionSummaries } from "@/server/storefront/collections";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  alternates: {
    canonical: "/collections",
  },
};

export default async function CollectionsPage() {
  const products = await getProductCardData();
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      children: { select: { slug: true } },
    },
  });
  const collectionSummaries = await getCollectionSummaries({ includeVirtual: true });
  const categorySlugs = new Set(categories.map((category) => category.slug));
  const collections = collectionSummaries
    .filter((collection) => !categorySlugs.has(collection.slug))
    .map((collection) => ({ slug: collection.slug, name: collection.name }));

  return (
    <CollectionsPageClient
      initialProducts={products}
      categories={categories.map(({ slug, name, children }) => ({
        slug,
        name,
        childSlugs: children.map((child) => child.slug),
      }))}
      collections={collections}
    />
  );
}
