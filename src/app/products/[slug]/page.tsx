import { use } from "react";
import { notFound } from "next/navigation";

import {
  getProductCardBySlug,
  getRelatedProductCards,
} from "@/server/storefront/products";

import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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

  return <ProductDetailClient product={product} related={related} />;
}
