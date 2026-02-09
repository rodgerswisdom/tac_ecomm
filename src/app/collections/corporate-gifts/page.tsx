import { getProductCardData } from "@/server/storefront/products";
import { CorporateGiftsClient } from "./CorporateGiftsClient";

export default async function CorporateGiftsPage() {
  const corporateProducts = await getProductCardData({
    corporateGiftsOnly: true,
    limit: 9,
  });

  return <CorporateGiftsClient corporateProducts={corporateProducts} />;
}
