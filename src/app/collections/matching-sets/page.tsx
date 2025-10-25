"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Users,
  Globe,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { featuredProducts } from "@/data/content";

const matchingSets = [
  {
    id: 1,
    name: "Heritage Collection Set",
    description: "A complete ensemble featuring earrings, necklace, and bracelet from the same artisan family.",
    price: 89500,
    originalPrice: 105000,
    savings: 15500,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    pieces: [
      { name: "Kilimanjaro Bronze Collar", type: "Necklace" },
      { name: "Maasai Bead Hoops", type: "Earrings" },
      { name: "Rift Valley Cuff", type: "Bracelet" }
    ],
    artisan: "Achieng' Wanjiku",
    region: "Nairobi, Kenya",
    materials: ["Bronze", "Maasai glass beads", "24k gold wash"],
    isCorporateGift: true,
    communityImpact: "Supports 5 artisan families across Kenya"
  },
  {
    id: 2,
    name: "Adinkra Wisdom Set",
    description: "Traditional Ghanaian symbols crafted into a harmonious trio of jewelry pieces.",
    price: 67500,
    originalPrice: 78000,
    savings: 10500,
    image: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=600&q=80",
    pieces: [
      { name: "Sankofa Signet Ring", type: "Ring" },
      { name: "Adinkra Pendant", type: "Necklace" },
      { name: "Symbol Cufflinks", type: "Accessories" }
    ],
    artisan: "Kojo Mensah",
    region: "Accra, Ghana",
    materials: ["18k Fairmined gold", "Adinkra etching", "Ebony inlay"],
    isCorporateGift: false,
    communityImpact: "Supports 3 goldsmith families in Accra"
  },
  {
    id: 3,
    name: "Desert Nomad Collection",
    description: "Inspired by Tuareg traditions, this set captures the essence of Saharan nomadic life.",
    price: 52000,
    originalPrice: 61000,
    savings: 9000,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=80",
    pieces: [
      { name: "Timbuktu Desert Bangles", type: "Bracelets" },
      { name: "Celestial Drop Earrings", type: "Earrings" },
      { name: "Caravan Chain", type: "Necklace" }
    ],
    artisan: "Binta Traoré",
    region: "Bamako, Mali",
    materials: ["Tuareg bronze", "Fine sand casting", "Indigo patina"],
    isCorporateGift: false,
    communityImpact: "Supports 4 Tuareg artisan families in Bamako"
  },
  {
    id: 4,
    name: "Zulu Rainbow Set",
    description: "Vibrant glasswork pieces that celebrate the colorful traditions of KwaZulu artisans.",
    price: 42000,
    originalPrice: 48000,
    savings: 6000,
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f2e?auto=format&fit=crop&w=600&q=80",
    pieces: [
      { name: "Zulu Glasswork Hoops", type: "Earrings" },
      { name: "Rainbow Bead Necklace", type: "Necklace" },
      { name: "Traditional Hair Comb", type: "Hair Accessory" }
    ],
    artisan: "Zanele Kumalo",
    region: "KwaZulu, South Africa",
    materials: ["Recycled glass", "Brushed gold", "Hand-spun thread"],
    isCorporateGift: false,
    communityImpact: "Supports 6 Zulu artisan families in KwaZulu"
  }
];

const benefits = [
  {
    icon: Heart,
    title: "Curated Harmony",
    description: "Each set is carefully curated to ensure perfect visual and cultural harmony between pieces."
  },
  {
    icon: Users,
    title: "Artisan Collaboration",
    description: "Sets often feature pieces from the same artisan family, ensuring consistent craftsmanship."
  },
  {
    icon: Award,
    title: "Complete Look",
    description: "Achieve a cohesive, authentic African aesthetic with our expertly matched collections."
  },
  {
    icon: Globe,
    title: "Cultural Storytelling",
    description: "Each set tells a complete cultural story through its coordinated design elements."
  }
];

export default function MatchingSetsPage() {
  const [selectedSet, setSelectedSet] = useState<number | null>(null);

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      
      {/* Hero Section */}
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

      {/* Benefits Section */}
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
              Our matching sets are more than just coordinated jewelry - they're complete cultural narratives.
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

      {/* Matching Sets Grid */}
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
            {matchingSets.map((set, index) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-brand-umber/10 bg-white/80 backdrop-blur-sm h-full">
                  <div className="aspect-video relative">
                    <img
                      src={set.image}
                      alt={set.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <div className="bg-brand-coral text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Save ${set.savings.toLocaleString()}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-heading text-2xl mb-1">{set.name}</h3>
                      <p className="text-lg font-semibold">${set.price.toLocaleString()}</p>
                      <p className="text-sm opacity-90 line-through">${set.originalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-brand-umber/70 mb-6">
                      {set.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-brand-umber">Set Includes:</h4>
                      {set.pieces.map((piece, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-teal" />
                          <span className="text-sm text-brand-umber/70">
                            {piece.name} ({piece.type})
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-brand-teal" />
                        <span className="text-sm text-brand-umber/70">
                          Artisan: {set.artisan} • {set.region}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-brand-gold" />
                        <span className="text-sm text-brand-umber/70">
                          {set.communityImpact}
                        </span>
                      </div>
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
                      <Button className="flex-1">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Add Set to Cart
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Set Section */}
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
