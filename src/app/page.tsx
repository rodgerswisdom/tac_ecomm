import type { Metadata } from "next";
import { HomePageClient } from "./HomePageClient";
import { getFeaturedProductCards } from "@/server/storefront/products";
import { getCollectionSummaries } from "@/server/storefront/collections";
import { SEOService, SEO_PRESETS } from "@/lib/seo";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.tacaccessories.co.ke";
// Ensure clean base URL string without an unintended double-slash down the line
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const metadata: Metadata = {
  title: SEO_PRESETS.home.title,
  description: SEO_PRESETS.home.description,
  keywords: SEO_PRESETS.home.keywords,
  authors: [{ name: "TAC Accessories" }],
  openGraph: {
    title: SEO_PRESETS.home.title,
    description: SEO_PRESETS.home.description,
    url: `${cleanBaseUrl}/`,
    siteName: "TAC Accessories",
    images: [
      {
        url: `${cleanBaseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "TAC Accessories - Afrocentric Jewelry & Accessories",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_PRESETS.home.title,
    description: SEO_PRESETS.home.description,
    images: [`${cleanBaseUrl}/og-image.jpg`], // Ensure the image URL is absolute
    creator: "@tacaccessories",
    site: "@tacaccessories",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/`,
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

export default async function HomePage() {
  const [featuredProducts, collections] = await Promise.all([
    getFeaturedProductCards(8),
    getCollectionSummaries({ limit: 6 }),
  ]);

  // Generate structured data
  const seoService = new SEOService();
  const organizationStructuredData = seoService.generateOrganizationStructuredData();
  const websiteStructuredData = seoService.generateWebsiteStructuredData();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      <HomePageClient featuredProducts={featuredProducts} collections={collections} />
    </>
  );
}