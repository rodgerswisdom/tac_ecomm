import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getCollectionSummaries,
  getCollectionSummaryBySlug,
  getCollectionSlugs,
} from "@/server/storefront/collections";
import { getCollectionProductCards } from "@/server/storefront/products";
import { SEOService } from "@/lib/seo";

import { CollectionPageClient } from "./CollectionPageClient";

const RESERVED_SLUGS = new Set(["matching-sets", "corporate-gifts"]);

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const slugs = await getCollectionSlugs();
    return slugs
      .filter((slug) => !RESERVED_SLUGS.has(slug))
      .map((slug) => ({ slug }));
  } catch (error) {
    console.error("Failed to generate collection static params:", error);
    return [];
  }
}

interface CollectionPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  if (RESERVED_SLUGS.has(slug)) {
    return {
      title: "Collection Not Found - TAC Accessories",
      description: "The collection you're looking for could not be found.",
    };
  }

  const collection = await getCollectionSummaryBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found - TAC Accessories",
      description: "The collection you're looking for could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.tacaccessories.co.ke/";
  const collectionUrl = `${baseUrl}/collections/${collection.slug}`;
  const heroTitle = collection.heroTitle ?? collection.name;
  const heroDescription = collection.heroDescription ?? collection.description;
  const heroImage = collection.heroImage ?? collection.image;

  // Generate keywords
  const keywords = [
    collection.name,
    ...collection.featuredRegions,
    ...collection.subcategories,
    "afrocentric jewelry",
    "african accessories",
    "handcrafted jewelry",
    "TAC Accessories",
    "collection",
  ].filter(Boolean);

  return {
    title: `${heroTitle} - TAC Accessories`,
    description: heroDescription,
    keywords: keywords,
    authors: [{ name: "TAC Accessories" }],
    openGraph: {
      title: `${heroTitle} - TAC Accessories`,
      description: heroDescription,
      url: collectionUrl,
      siteName: "TAC Accessories",
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: heroTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${heroTitle} - TAC Accessories`,
      description: heroDescription,
      images: [heroImage],
      creator: "@tacaccessories",
      site: "@tacaccessories",
    },
    alternates: {
      canonical: collectionUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
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

  // Generate breadcrumb structured data
  const seoService = new SEOService();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.tacaccessories.co.ke/";
  const collectionUrl = `${baseUrl}/collections/${collection.slug}`;

  const breadcrumbs = [
    { name: "Home", url: baseUrl },
    { name: "Collections", url: `${baseUrl}/collections` },
    { name: collection.name, url: collectionUrl },
  ];

  const breadcrumbStructuredData = seoService.generateBreadcrumbStructuredData(breadcrumbs);

  // Generate CollectionPage structured data
  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    description: collection.description,
    url: collectionUrl,
    image: collection.image,
    numberOfItems: collection.itemCount,
    about: {
      "@type": "Thing",
      name: "Afrocentric Jewelry",
      description: "Handcrafted jewelry celebrating African heritage",
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionStructuredData),
        }}
      />
      <CollectionPageClient
        collection={collection}
        products={products}
        relatedCollections={relatedCollections}
      />
    </>
  );
}
