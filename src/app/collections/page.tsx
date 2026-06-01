import { CollectionsPageClient } from "./CollectionsPageClient";
import { getProductCardData } from "@/server/storefront/products";
import { getCollectionSummaries } from "@/server/storefront/collections";
import { prisma } from "@/lib/prisma";

export default async function CollectionsPage() {
  const products = await getProductCardData();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });
  const collectionSummaries = await getCollectionSummaries({ includeVirtual: true });
  const categorySlugs = new Set(categories.map((category) => category.slug));
  const collections = collectionSummaries
    .filter((collection) => !categorySlugs.has(collection.slug))
    .map((collection) => ({ slug: collection.slug, name: collection.name }));

  return (
    <CollectionsPageClient
      initialProducts={products}
      categories={categories}
      collections={collections}
    />
  );
}
