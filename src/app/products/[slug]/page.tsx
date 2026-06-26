import { use } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getProductCardBySlug,
  getRelatedProductCards,
} from "@/server/storefront/products";
import { SEOService } from "@/lib/seo";

import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductCardBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found - TAC Accessories",
      description: "The product you're looking for could not be found.",
    };
  }

  const seoService = new SEOService();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.tacaccessories.co.ke/";
  const productUrl = `${baseUrl}/products/${product.slug}`;

  // Determine availability status
  const availability = product.isOutOfStock ? "out_of_stock" : "in_stock";

  // Generate Open Graph tags
  const openGraphTags = {
    title: `${product.name} - TAC Accessories`,
    description: product.description,
    url: productUrl,
    siteName: "TAC Accessories",
    images: [
      {
        url: product.image,
        width: 1200,
        height: 630,
        alt: product.name,
      },
      ...product.gallery.slice(0, 3).map((img) => ({
        url: img,
        width: 1200,
        height: 630,
        alt: `${product.name} - Additional view`,
      })),
    ],
    locale: "en_US",
    type: "website" as const,
  };

  // Generate Twitter Card tags
  const twitterTags = {
    card: "summary_large_image" as const,
    title: `${product.name} - TAC Accessories`,
    description: product.description,
    images: [product.image],
    creator: "@tacaccessories",
    site: "@tacaccessories",
  };

  // Generate keywords
  const keywords = [
    product.name,
    ...product.materials,
    product.category || "jewelry",
    product.subcategory || "",
    "afrocentric jewelry",
    "african accessories",
    "handcrafted jewelry",
    product.origin,
    "TAC Accessories",
  ].filter(Boolean);

  return {
    title: `${product.name} - TAC Accessories`,
    description: product.description,
    keywords: keywords,
    authors: [{ name: "TAC Accessories" }],
    openGraph: openGraphTags,
    twitter: twitterTags,
    alternates: {
      canonical: productUrl,
    },
    robots: {
      index: !product.isOutOfStock,
      follow: true,
      googleBot: {
        index: !product.isOutOfStock,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const product = use(getProductCardBySlug(slug));

  if (!product) {
    notFound();
  }

  const related = use(
    getRelatedProductCards({
    productId: product.id,
    categorySlug: product.category,
    }),
  );

  // Generate structured data for the product
  const seoService = new SEOService();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.tacaccessories.co.ke/";
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const availability = product.isOutOfStock ? "out_of_stock" : "in_stock";

  const productStructuredData = seoService.generateProductStructuredData({
    title: product.name,
    description: product.description,
    type: "product",
    image: product.image,
    url: productUrl,
    price: product.price,
    currency: "KSH",
    availability: availability,
    condition: "new",
    brand: product.brand || "TAC Accessories",
    sku: product.id,
    category: product.category,
    rating: product.rating,
    reviewCount: product.reviewCount,
  });

  // Generate breadcrumb structured data
  const breadcrumbs = [
    { name: "Home", url: baseUrl },
    { name: "Collections", url: `${baseUrl}/collections` },
  ];

  if (product.category) {
    breadcrumbs.push({
      name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
      url: `${baseUrl}/collections/${product.category}`,
    });
  }

  breadcrumbs.push({
    name: product.name,
    url: productUrl,
  });

  const breadcrumbStructuredData = seoService.generateBreadcrumbStructuredData(breadcrumbs);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
