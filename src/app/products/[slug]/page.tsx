"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Sparkles, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { notFound } from "next/navigation";

import {
  getProductCardBySlug,
  getRelatedProductCards,
} from "@/server/storefront/products";

import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductCardBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProductCards({
    productId: product.id,
    categorySlug: product.category,
  });

  return <ProductDetailClient product={product} related={related} />;
}
      // Same artisan (if available)
