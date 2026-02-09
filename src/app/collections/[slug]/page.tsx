import { notFound } from "next/navigation";

import {
  getCollectionSummaries,
  getCollectionSummaryBySlug,
  getCollectionSlugs,
} from "@/server/storefront/collections";
import { getCollectionProductCards } from "@/server/storefront/products";

import { CollectionPageClient } from "./CollectionPageClient";

const RESERVED_SLUGS = new Set(["matching-sets", "corporate-gifts"]);

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getCollectionSlugs();
  return slugs
    .filter((slug) => !RESERVED_SLUGS.has(slug))
    .map((slug) => ({ slug }));
}

interface CollectionPageProps {
  params: { slug: string };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const slug = params.slug;
  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  const collection = await getCollectionSummaryBySlug(slug);

  if (!collection) {
    notFound();
  }

  const [products, relatedCollections] = await Promise.all([
    getCollectionProductCards(slug),
    getCollectionSummaries({ excludeSlugs: [slug], limit: 3 }),
  ]);

  return (
    <CollectionPageClient
      collection={collection}
      products={products}
      relatedCollections={relatedCollections}
    />
  );
}
