import { CollectionsPageClient } from "./CollectionsPageClient";
import { getProductCardData } from "@/server/storefront/products";

export default async function CollectionsPage() {
  const products = await getProductCardData();
  return <CollectionsPageClient initialProducts={products} />;
}
