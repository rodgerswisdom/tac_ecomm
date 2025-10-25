"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { featuredProducts } from "@/data/content";
import { patternAssets, regionPalettes } from "@/lib/patterns";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const slug = params?.slug as string;

  const product = useMemo(
    () => featuredProducts.find((item) => item.slug === slug),
    [slug],
  );

  const related = useMemo(
    () => featuredProducts.filter((item) => item.slug !== slug).slice(0, 3),
    [slug],
  );

  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    router.push("/collections");
    return null;
  }

  const artisanPalette =
    regionPalettes[product.artisan.region] ?? regionPalettes.kenya;

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
            <div className="space-y-6">
              <motion.div
                className="relative overflow-hidden rounded-[2.5rem] border border-brand-teal/20 bg-white shadow-[0_35px_80px_rgba(74,43,40,0.18)]"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              >
                <Image
                  src={product.gallery[activeImage] ?? product.image}
                  alt={product.name}
                  width={960}
                  height={720}
                  className="h-[520px] w-full rounded-[2.5rem] object-cover"
                  priority
                />
                <Image
                  src={patternAssets.beadCircles}
                  alt="Pattern overlay"
                  width={160}
                  height={160}
                  className="absolute -right-8 -top-8 hidden opacity-60 lg:block"
                />
              </motion.div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.gallery.map((image, index) => (
                  <button
                    key={`${product.id}-thumb-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border transition ${
                      activeImage === index
                        ? "border-brand-gold shadow-[0_12px_30px_rgba(223,160,83,0.28)]"
                        : "border-brand-teal/20"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

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
                    KES {product.price.toLocaleString()}
                  </p>
                </div>
                {product.originalPrice && (
                  <span className="text-sm text-brand-umber/40 line-through">
                    KES {product.originalPrice.toLocaleString()}
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

              <div className="rounded-[2rem] border border-brand-gold/45 bg-white/85 p-6" style={{ background: artisanPalette.background }}>
                <p className="caps-spacing text-xs text-brand-umber/60">
                  Artisan
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border border-brand-gold/60">
                    <Image
                      src={product.artisan.portrait}
                      alt={product.artisan.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-heading text-2xl text-brand-umber">
                      {product.artisan.name}
                    </p>
                    <p className="text-sm" style={{ color: artisanPalette.text }}>
                      {product.artisan.regionLabel}
                    </p>
                  </div>
                </div>
                <blockquote className="mt-4 border-l-2 border-brand-gold/40 pl-4 text-sm text-brand-umber/70">
                  “{product.artisan.quote}”
                </blockquote>
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
                  Every purchase supports TAC artisan scholarships.
                </div>
              </div>
            </motion.div>
          </div>

          <section className="mt-24 space-y-10">
            <div className="flex flex-col gap-4 text-left">
              <span className="caps-spacing text-xs text-brand-teal">
                Curated for you
              </span>
              <h2 className="font-heading text-3xl text-brand-umber">
                Discover more luminous pieces from this gallery.
              </h2>
            </div>
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductSummary key={`related-${item.id}`} product={item} />
              ))}
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  );
}

const ProductSummary = ({
  product,
}: {
  product: (typeof featuredProducts)[number];
}) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      className="group rounded-3xl border border-brand-teal/20 bg-white p-6 shadow-[0_20px_50px_rgba(74,43,40,0.14)] backdrop-blur-sm transition-colors hover:border-brand-teal/35 hover:shadow-[0_26px_60px_rgba(74,43,40,0.16)]"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src={product.image}
          alt={product.name}
          width={420}
          height={320}
          className="h-60 w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="mt-4 space-y-2">
        <Link href={`/products/${product.slug}`} className="font-heading text-2xl text-brand-umber">
          {product.name}
        </Link>
        <p className="text-sm text-brand-coral">
          KES {product.price.toLocaleString()}
        </p>
      </div>
    </motion.article>
  );
};
