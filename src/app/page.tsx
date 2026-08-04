import type { Metadata } from "next";
import { HomePageClient } from "./HomePageClient";
import { getHomePageMainCategories } from "@/server/storefront/collections";
import { getHeroContent, getOfferOfTheMonth } from "@/server/storefront/settings";
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
  const fallbackHero = {
    image:
      "https://plus.unsplash.com/premium_photo-1666789257989-f2a5e8a2b972?auto=format&fit=crop&q=60&w=900",
    tagline: "Heritage Atelier Spotlight",
    headline: "Crafted by Heritage, Worn with Pride",
    description:
      "From the soil of Africa to the hands of its artisans, our jewellery is a symphony of earth and soul. Every design is a poetic expression of culture, artistry, and authenticity. These treasures are more than adornments — they are the heartbeat of Africa, worn close to yours.",
    ctaLabel: "Shop Collections",
    ctaHref: "/collections",
  }

  let mainCategories: Awaited<ReturnType<typeof getHomePageMainCategories>> = []
  let offerOfTheMonth: Awaited<ReturnType<typeof getOfferOfTheMonth>> = null
  let hero: Awaited<ReturnType<typeof getHeroContent>> = fallbackHero

  try {
    ;[mainCategories, offerOfTheMonth, hero] = await Promise.all([
      getHomePageMainCategories(),
      getOfferOfTheMonth(),
      getHeroContent(),
    ])
  } catch (error) {
    console.error("Failed to load home page data:", error)
  }

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
      <HomePageClient
        mainCategories={mainCategories}
        hero={hero}
        offerOfTheMonth={offerOfTheMonth}
      />
    </>
  );
}
