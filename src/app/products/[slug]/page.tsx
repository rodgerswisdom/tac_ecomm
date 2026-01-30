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
import { featuredProducts } from "@/data/content";
import { Product360Viewer } from "@/components/Product360Viewer";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const slug = params?.slug as string;

  const product = useMemo(
    () => featuredProducts.find((item) => item.slug === slug),
    [slug],
  );

  const related = useMemo(() => {
    if (!product) return [];

    const otherProducts = featuredProducts.filter((item) => item.slug !== slug);
    
    // Score products based on relevance
    const scored = otherProducts.map((item) => {
      let score = 0;
      
      // Same category (high priority)
      if (item.category === product.category) score += 10;
      
      // Same artisan (if available)
      if (product.artisan && item.artisan && 
          product.artisan.name === item.artisan.name) score += 8;
      
      // Similar materials (at least one matching)
      const commonMaterials = product.materials.filter(m => 
        item.materials.some(im => im.toLowerCase().includes(m.toLowerCase()) || 
                                  m.toLowerCase().includes(im.toLowerCase()))
      );
      if (commonMaterials.length > 0) score += 5;
      
      // Similar price range (±30%)
      const priceDiff = Math.abs(item.price - product.price) / product.price;
      if (priceDiff <= 0.3) score += 3;
      
      // Same origin
      if (item.origin === product.origin) score += 2;
      
      return { product: item, score };
    });

    // Sort by score and take top 6, then shuffle to add variety
    const topScored = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.product);

    // Mix high-scored with some random variety
    const highScored = topScored.slice(0, 4);
    const variety = otherProducts
      .filter(p => !highScored.includes(p))
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    return [...highScored, ...variety].slice(0, 6);
  }, [slug, product]);

  if (!product) {
    router.push("/collections");
    return null;
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      <section className="section-spacing pb-0">
        <div className="gallery-container">
          <div className="mb-10 flex items-center justify-between text-xs text-brand-umber/60">
            <Link
              href="/collections"
              className="caps-spacing inline-flex items-center gap-2 text-brand-teal transition-colors hover:text-brand-coral"
            >
              <ArrowLeft className="h-4 w-4" /> Back to collections
            </Link>
            <span className="caps-spacing">Crafted in {product.origin}</span>
          </div>

          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            >
              <Product360Viewer
                images={product.gallery}
                productName={product.name}
                fallbackImage={product.image}
              />
            </motion.div>

            <motion.div
              className="space-y-10 rounded-[2.5rem] border border-brand-teal/20 bg-brand-beige/85 p-10 backdrop-blur-sm shadow-[0_28px_70px_rgba(74,43,40,0.16)]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
            >
              <div className="space-y-4">
                <span className="caps-spacing text-xs text-brand-coral">
                  Limited Release
                </span>
                <h1 className="font-heading text-5xl text-brand-umber">
                  {product.name}
                </h1>
                <p className="text-base text-brand-umber/75">{product.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 border-y border-brand-umber/15 py-6">
                <div>
                  <p className="caps-spacing text-xs text-brand-umber/50">
                    Investment
                  </p>
                  <p className="text-3xl font-heading text-brand-coral">
                    {formatPrice(product.price)}
                  </p>
                </div>
                {product.originalPrice && (
                  <span className="text-sm text-brand-umber/40 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <div className="flex items-center gap-2 rounded-full bg-brand-jade/30 px-3 py-1 text-sm text-brand-umber/70">
                  <Star className="h-4 w-4 text-brand-gold" /> Collectors&apos; favourite
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-heading text-2xl text-brand-umber">Materials</h2>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((material) => (
                    <span
                      key={material}
                      className="rounded-full border border-brand-teal/25 bg-white/70 px-4 py-1 text-sm text-brand-umber/70"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingBag className="mr-2 h-5 w-5" /> Add to Basket
              </Button>

              <div className="flex flex-col gap-3 rounded-3xl bg-brand-jade/25 p-6 text-sm text-brand-umber/70">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-gold" />
                  Complimentary global shipping & insured delivery.
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-gold" />
                  Every purchase supports Tac Accessories artisan scholarships.
                </div>
              </div>
            </motion.div>
          </div>

          {related.length > 0 && (
            <section className="mt-24 space-y-10">
              <div className="flex flex-col gap-4 text-left">
                <span className="caps-spacing text-xs text-brand-teal">
                  You May Also Like
                </span>
                <h2 className="font-heading text-3xl text-brand-umber">
                  Discover more luminous pieces from this gallery.
                </h2>
                <p className="text-base text-brand-umber/70 max-w-2xl">
                  Handpicked selections that complement this piece, curated by our styling team.
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ProductSummary key={`related-${item.id}`} product={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function ProductSummary({
  product,
}: {
  product: (typeof featuredProducts)[number];
}) {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      className="group rounded-3xl border border-brand-teal/20 bg-white overflow-hidden shadow-[0_20px_50px_rgba(74,43,40,0.14)] backdrop-blur-sm transition-all duration-300 hover:border-brand-teal/35 hover:shadow-[0_26px_60px_rgba(74,43,40,0.16)]"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden aspect-[4/5]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/95 backdrop-blur-sm hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/products/${product.slug}`;
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Quick View
            </Button>
            <Button
              size="sm"
              className="bg-brand-teal/95 backdrop-blur-sm hover:bg-brand-teal"
              onClick={handleQuickAdd}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
          {product.originalPrice && (
            <div className="absolute top-3 left-3 bg-brand-coral text-white text-xs font-semibold px-2 py-1 rounded-full">
              Sale
            </div>
          )}
        </div>
        <div className="p-6 space-y-3">
          <div>
            <h3 className="font-heading text-xl text-brand-umber group-hover:text-brand-teal transition-colors">
              {product.name}
            </h3>
            {product.origin && (
              <p className="text-xs text-brand-umber/60 mt-1">From {product.origin}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-brand-coral">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-brand-umber/40 line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>
            {product.materials.length > 0 && (
              <div className="flex gap-1">
                {product.materials.slice(0, 2).map((material, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 rounded-full bg-brand-jade/20 text-brand-umber/70"
                  >
                    {material.split(' ')[0]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
