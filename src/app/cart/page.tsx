import { getProductCardData } from "@/server/storefront/products";
import { CartPageClient } from "./CartPageClient";

export default async function CartPage() {
  const recommendations = await getProductCardData({ limit: 3 });

  return <CartPageClient recommendations={recommendations} />;
}
