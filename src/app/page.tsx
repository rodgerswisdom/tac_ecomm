import { HomePageClient } from "./HomePageClient";
import { getFeaturedProductCards } from "@/server/storefront/products";
import { getCollectionSummaries } from "@/server/storefront/collections";

export default async function HomePage() {
  const [featuredProducts, collections] = await Promise.all([
    getFeaturedProductCards(8),
    getCollectionSummaries({ limit: 6 }),
  ]);

  return <HomePageClient featuredProducts={featuredProducts} collections={collections} />;
}
