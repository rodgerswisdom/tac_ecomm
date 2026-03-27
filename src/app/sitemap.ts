import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.APP_URL || "https://tacaccessories.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/collections`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isDraft: false },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    const collections = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const collectionRoutes: MetadataRoute.Sitemap = collections.map((collection) => ({
      url: `${BASE_URL}/collections/${collection.slug}`,
      lastModified: collection.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...collectionRoutes, ...productRoutes];
  } catch (error) {
    // Keep sitemap route resilient if DB is temporarily unavailable.
    console.error("Failed to build dynamic sitemap entries:", error);
    return staticRoutes;
  }
}
