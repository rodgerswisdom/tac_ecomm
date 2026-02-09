import { ProductType } from "@prisma/client";
import { getProductCardData } from "@/server/storefront/products";
import { MatchingSetsClient } from "./MatchingSetsClient";

export default async function MatchingSetsPage() {
  const sets = await getProductCardData({ productType: ProductType.MATCHING_SET });

  return <MatchingSetsClient sets={sets} />;
}
