import { notFound } from "next/navigation";

import {
  featuredCollections,
  type CollectionCategory,
} from "@/data/content";

import { CollectionPageClient } from "./CollectionPageClient";

const RESERVED_SLUGS = new Set(["matching-sets", "corporate-gifts"]);

export function generateStaticParams(): Array<{ slug: string }> {
  return featuredCollections
    .filter((collection) => !RESERVED_SLUGS.has(collection.slug))
    .map((collection) => ({ slug: collection.slug }));
}

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const collection = featuredCollections.find(
    (item) => item.slug === params.slug
  ) as CollectionCategory | undefined;

  if (!collection || RESERVED_SLUGS.has(collection.slug)) {
    notFound();
  }

  return <CollectionPageClient collection={collection} />;
}
