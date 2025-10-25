"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  Gift, 
  Heart, 
  Globe, 
  Star,
  CheckCircle,
  ArrowRight,
  Award,
  HandHeart,
  Sparkles
} from "lucide-react";
import Link from "next/link";

const corporateCollections = [
  {
    id: 1,
    name: "Executive Collection",
    description: "Premium pieces for C-suite gifting and high-level client appreciation.",
    price: "From $2,500",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    features: ["Handcrafted by master artisans", "Custom packaging", "Certificate of authenticity", "Corporate branding options"],
    idealFor: "C-suite executives, VIP clients, board members"
  },
  {
    id: 2,
    name: "Team Appreciation Sets",
    description: "Thoughtful collections for employee recognition and team milestones.",
    price: "From $150",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=80",
    features: ["Bulk pricing available", "Custom team messaging", "Gift boxes included", "Bulk shipping"],
    idealFor: "Employee recognition, team achievements, company anniversaries"
  },
  {
    id: 3,
    name: "Client Gift Collection",
    description: "Professional yet personal gifts that strengthen business relationships.",
    price: "From $300",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
    features: ["Professional presentation", "Custom thank you notes", "Bulk discounts", "Fast turnaround"],
    idealFor: "Client appreciation, partnership milestones, holiday gifting"
  },
  {
    id: 4,
    name: "Wedding Corporate Gifts",
    description: "Elegant pieces for corporate wedding gifts and special occasions.",
    price: "From $500",
    image: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=600&q=80",
    features: ["Wedding-themed packaging", "Custom engraving", "Gift registry integration", "Bulk orders welcome"],
    idealFor: "Employee weddings, client celebrations, special occasions"
  }
];

const impactMetrics = [
  {
    icon: Users,
    number: "500+",
    label: "Artisan Families Supported",
    description: "Direct impact on communities across Africa"
  },
  {
    icon: Globe,
    number: "15",
    label: "Countries Represented",
    description: "Authentic pieces from diverse African regions"
  },
  {
    icon: Heart,
    number: "98%",
    label: "Customer Satisfaction",
    description: "Rated by corporate clients worldwide"
  },
  {
    icon: Award,
    number: "50+",
    label: "Fortune 500 Clients",
    description: "Trusted by leading global companies"
  }
];

const testimonials = [
  {
    company: "TechCorp International",
    name: "Sarah Johnson",
    role: "VP of Partnerships",
    quote: "Our clients were amazed by the authentic craftsmanship and the story behind each piece. It elevated our gifting to a whole new level.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&q=80"
  },
  {
    company: "Global Finance Group",
    name: "Michael Chen",
    role: "Head of Client Relations",
    quote: "The corporate gifts helped us stand out in a crowded market. Our clients appreciated the cultural authenticity and quality.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
  },
  {
    company: "Innovation Labs",
    name: "Aisha Patel",
    role: "CEO",
    quote: "Supporting artisan communities while strengthening our business relationships - it's a win-win that aligns with our values.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80"
  }
];

export default function CorporateGiftsPage() {
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);

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
              Corporate Gifts
            </span>
            <h1 className="font-heading text-5xl text-brand-umber md:text-6xl mb-6">
              Gift with <span className="bg-gradient-to-r from-brand-gold to-brand-teal bg-clip-text text-transparent">Purpose</span>
            </h1>
            <p className="text-xl text-brand-umber/80 mb-8 max-w-3xl mx-auto">
              Strengthen business relationships while supporting African artisan communities. Our corporate gifts combine authentic craftsmanship with professional presentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6">
                Request Corporate Catalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6">
                Schedule Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <div className="text-center mb-16">
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              Our Impact
            </span>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              Meaningful Business Relationships
            </h2>
            <p className="text-lg text-brand-umber/70 max-w-2xl mx-auto">
              Every corporate gift creates a positive impact on both your business relationships and artisan communities.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-gold to-brand-teal rounded-full flex items-center justify-center mb-4">
                  <metric.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-brand-umber mb-2">
                  {metric.number}
                </div>
                <h3 className="font-heading text-lg text-brand-umber mb-2">
                  {metric.label}
                </h3>
                <p className="text-sm text-brand-umber/70">
                  {metric.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Collections */}
      <section className="section-spacing bg-brand-jade/10">
        <div className="gallery-container">
          <div className="text-center mb-16">
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              Corporate Collections
            </span>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              Curated for Every Business Need
            </h2>
            <p className="text-lg text-brand-umber/70 max-w-2xl mx-auto">
              From executive gifts to team appreciation, we have collections designed for every corporate occasion.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {corporateCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-brand-umber/10 bg-white/80 backdrop-blur-sm h-full">
                  <div className="aspect-video relative">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-heading text-2xl mb-1">{collection.name}</h3>
                      <p className="text-lg font-semibold">{collection.price}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-brand-umber/70 mb-6">
                      {collection.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-brand-umber">Features:</h4>
                      {collection.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-teal" />
                          <span className="text-sm text-brand-umber/70">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-brand-umber mb-2">Ideal for:</h4>
                      <p className="text-sm text-brand-umber/70">{collection.idealFor}</p>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1">
                        Request Quote
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

      {/* Testimonials */}
      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <div className="text-center mb-16">
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              Client Testimonials
            </span>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              Trusted by Leading Companies
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.company}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-brand-umber/10 bg-white/80 backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-brand-umber">{testimonial.name}</h4>
                        <p className="text-sm text-brand-umber/70">{testimonial.role}</p>
                        <p className="text-xs text-brand-teal">{testimonial.company}</p>
                      </div>
                    </div>
                    <blockquote className="text-brand-umber/80 italic">
                      "{testimonial.quote}"
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-spacing bg-gradient-to-br from-brand-gold/10 via-brand-jade/5 to-brand-coral/5">
        <div className="gallery-container">
          <div className="text-center mb-16">
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              Why Choose Us
            </span>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              Corporate Gifting Excellence
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto bg-brand-teal/20 rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-brand-teal" />
              </div>
              <h3 className="font-heading text-xl text-brand-umber mb-4">
                Professional Service
              </h3>
              <p className="text-brand-umber/70">
                Dedicated account management, bulk pricing, and corporate branding options for seamless integration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto bg-brand-gold/20 rounded-full flex items-center justify-center mb-6">
                <HandHeart className="h-8 w-8 text-brand-gold" />
              </div>
              <h3 className="font-heading text-xl text-brand-umber mb-4">
                Authentic Impact
              </h3>
              <p className="text-brand-umber/70">
                Every purchase directly supports artisan communities and preserves traditional craftsmanship.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto bg-brand-coral/20 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-brand-coral" />
              </div>
              <h3 className="font-heading text-xl text-brand-umber mb-4">
                Unique Storytelling
              </h3>
              <p className="text-brand-umber/70">
                Each piece comes with artisan stories and cultural context that elevates your gifting experience.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              Ready to Elevate Your Corporate Gifting?
            </h2>
            <p className="text-lg text-brand-umber/70 mb-8">
              Let us help you create meaningful business relationships through authentic African craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6">
                Request Corporate Catalog
                <Gift className="ml-2 h-5 w-5" />
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
