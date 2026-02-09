"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  ShoppingBag,
  Users,
  Globe,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { ProductCardData } from "@/types/product";

const benefits = [
  {
    icon: Heart,
    title: "Curated Harmony",
    description: "Each set is carefully curated to ensure perfect visual and cultural harmony between pieces.",
  },
  {
    icon: Users,
    title: "Artisan Collaboration",
    description: "Sets often feature pieces from the same artisan family, ensuring consistent craftsmanship.",
  },
  {
    icon: Award,
    title: "Complete Look",
    description: "Achieve a cohesive, authentic African aesthetic with our expertly matched collections.",
  },
  {
    icon: Globe,
    title: "Cultural Storytelling",
    description: "Each set tells a complete cultural story through its coordinated design elements.",
  },
];

interface MatchingSetsClientProps {
  sets: ProductCardData[];
}

export function MatchingSetsClient({ sets }: MatchingSetsClientProps) {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleAddSet = (product: ProductCardData) => {
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
        <div className="gallery-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              Matching Sets
            </span>
            <h1 className="font-heading text-5xl text-brand-umber md:text-6xl mb-6">
              Complete <span className="bg-gradient-to-r from-brand-gold to-brand-teal bg-clip-text text-transparent">Cultural Stories</span>
            </h1>
            <p className="text-xl text-brand-umber/80 mb-8 max-w-3xl mx-auto">
              Discover perfectly curated sets that tell complete cultural stories through harmoniously matched pieces from the same artisan communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6">
                Explore Sets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6">
                Custom Set Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <div className="text-center mb-16">
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              Why Choose Sets
            </span>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              Curated Cultural Harmony
            </h2>
            <p className="text-lg text-brand-umber/70 max-w-2xl mx-auto">
              Our matching sets are more than just coordinated jewelry - they&rsquo;re complete cultural narratives.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-gold to-brand-teal rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-heading text-lg text-brand-umber mb-3">
                  {benefit.title}
                </h3>
                <p className="text-sm text-brand-umber/70">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing bg-brand-jade/10">
        <div className="gallery-container">
          <div className="text-center mb-16">
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              Featured Sets
            </span>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              Complete Cultural Collections
            </h2>
            <p className="text-lg text-brand-umber/70 max-w-2xl mx-auto">
              Each set is carefully curated to ensure perfect harmony and cultural authenticity.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {sets.map((set, index) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-brand-umber/10 bg-white/80 backdrop-blur-sm h-full">
                  <div className="aspect-video relative">
                    <Image
                      src={set.image}
                      alt={set.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-heading text-2xl mb-1">{set.name}</h3>
                      <p className="text-lg font-semibold">{formatPrice(set.price)}</p>
                      {set.originalPrice && (
                        <p className="text-sm opacity-90 line-through">
                          {formatPrice(set.originalPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-brand-umber/70 mb-6">
                      {set.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-brand-umber">Materials:</h4>
                      {set.materials.slice(0, 3).map((material) => (
                        <div key={material} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-teal" />
                          <span className="text-sm text-brand-umber/70">
                            {material}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-brand-teal" />
                        <span className="text-sm text-brand-umber/70">
                          Artisan: {set.artisan?.name} • {set.origin}
                        </span>
                      </div>
                      {set.communityImpact && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-brand-gold" />
                          <span className="text-sm text-brand-umber/70">
                            {set.communityImpact}
                          </span>
                        </div>
                      )}
                    </div>

                    {set.isCorporateGift && (
                      <div className="mb-6 p-3 bg-brand-coral/10 rounded-lg border border-brand-coral/20">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-brand-coral" />
                          <span className="text-sm font-semibold text-brand-coral">
                            Corporate Gift Available
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={() => handleAddSet(set)}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Add Set to Cart
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/products/${set.slug}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-gold to-brand-teal rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              Create Your Perfect Set
            </h2>
            <p className="text-lg text-brand-umber/70 mb-8">
              Work with our artisans to create a custom matching set that perfectly reflects your style and cultural preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6">
                Start Custom Set Design
                <Heart className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6">
                Schedule Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
