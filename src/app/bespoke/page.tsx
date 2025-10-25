"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Palette, 
  Users, 
  Clock, 
  Heart, 
  Star, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  HandHeart,
  Globe
} from "lucide-react";

const bespokeProcess = [
  {
    step: 1,
    title: "Design Consultation",
    description: "Share your vision with our artisan partners through a personalized video call.",
    duration: "30 minutes",
    icon: Palette,
  },
  {
    step: 2,
    title: "Artisan Matching",
    description: "We connect you with the perfect artisan based on your design and cultural preferences.",
    duration: "2-3 days",
    icon: Users,
  },
  {
    step: 3,
    title: "Creation Process",
    description: "Watch your piece come to life through regular updates and artisan stories.",
    duration: "2-4 weeks",
    icon: HandHeart,
  },
  {
    step: 4,
    title: "Delivery & Story",
    description: "Receive your bespoke piece with a detailed story of its creation journey.",
    duration: "1-2 weeks",
    icon: Heart,
  },
];

const artisanSpecialties = [
  {
    name: "Bronze Casting",
    region: "Kenya",
    artisan: "Achieng' Wanjiku",
    specialties: ["Collar pieces", "Signet rings", "Traditional motifs"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Gold Smithing",
    region: "Ghana",
    artisan: "Kojo Mensah",
    specialties: ["Adinkra symbols", "Wedding sets", "Heritage pieces"],
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Tuareg Metalwork",
    region: "Mali",
    artisan: "Binta Traoré",
    specialties: ["Celestial designs", "Desert motifs", "Stackable pieces"],
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
  },
];

export default function BespokeStudioPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vision: "",
    budget: "",
    timeline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Bespoke consultation request:", formData);
  };

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
              Bespoke Studio
            </span>
            <h1 className="font-heading text-5xl text-brand-umber md:text-6xl mb-6">
              Your Vision, <span className="bg-gradient-to-r from-brand-gold to-brand-teal bg-clip-text text-transparent">Their Heritage</span>
            </h1>
            <p className="text-xl text-brand-umber/80 mb-8 max-w-3xl mx-auto">
              Collaborate directly with master artisans across Africa to create one-of-a-kind pieces that tell your unique story while honoring centuries-old traditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-6">
                View Artisan Gallery
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <div className="text-center mb-16">
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              The Bespoke Process
            </span>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              From Vision to Heirloom
            </h2>
            <p className="text-lg text-brand-umber/70 max-w-2xl mx-auto">
              Every bespoke piece is a collaboration between your vision and the artisan's heritage, creating something truly unique.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {bespokeProcess.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-gold to-brand-teal rounded-full flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-umber text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="font-heading text-xl text-brand-umber mb-3">
                  {step.title}
                </h3>
                <p className="text-brand-umber/70 mb-4">
                  {step.description}
                </p>
                <span className="caps-spacing text-xs text-brand-teal">
                  {step.duration}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Artisan Specialties */}
      <section className="section-spacing bg-brand-jade/10">
        <div className="gallery-container">
          <div className="text-center mb-16">
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              Master Artisans
            </span>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              Meet Your Creative Partners
            </h2>
            <p className="text-lg text-brand-umber/70 max-w-2xl mx-auto">
              Each artisan brings unique skills and cultural heritage to your bespoke piece.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {artisanSpecialties.map((specialty, index) => (
              <motion.div
                key={specialty.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-brand-umber/10 bg-white/80 backdrop-blur-sm">
                  <div className="aspect-square relative">
                    <img
                      src={specialty.image}
                      alt={specialty.artisan}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-umber/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-heading text-xl mb-1">{specialty.artisan}</h3>
                      <p className="text-sm opacity-90">{specialty.region}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="font-heading text-lg text-brand-umber mb-3">
                      {specialty.name}
                    </h4>
                    <div className="space-y-2">
                      {specialty.specialties.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-teal" />
                          <span className="text-sm text-brand-umber/70">{item}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Collaborate
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Form */}
      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
                Start Your Journey
              </span>
              <h2 className="font-heading text-4xl text-brand-umber mb-6">
                Book Your Design Consultation
              </h2>
              <p className="text-lg text-brand-umber/70">
                Share your vision and we'll connect you with the perfect artisan.
              </p>
            </div>

            <Card className="border-brand-umber/10 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-brand-umber">
                  Bespoke Consultation Request
                </CardTitle>
                <CardDescription className="text-center">
                  Tell us about your vision and we'll create something extraordinary together.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-brand-umber mb-2">
                        Full Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-umber mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-umber mb-2">
                      Phone Number
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-umber mb-2">
                      Your Vision
                    </label>
                    <textarea
                      value={formData.vision}
                      onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                      placeholder="Describe your vision, inspiration, or any specific requirements..."
                      className="w-full h-32 px-3 py-2 border border-brand-umber/20 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-brand-umber mb-2">
                        Budget Range
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-3 py-2 border border-brand-umber/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        required
                      >
                        <option value="">Select budget range</option>
                        <option value="500-1000">$500 - $1,000</option>
                        <option value="1000-2500">$1,000 - $2,500</option>
                        <option value="2500-5000">$2,500 - $5,000</option>
                        <option value="5000+">$5,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-umber mb-2">
                        Timeline
                      </label>
                      <select
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        className="w-full px-3 py-2 border border-brand-umber/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        required
                      >
                        <option value="">Select timeline</option>
                        <option value="urgent">ASAP (2-3 weeks)</option>
                        <option value="flexible">Flexible (1-2 months)</option>
                        <option value="planning">Planning ahead (3+ months)</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Request Consultation
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-spacing bg-gradient-to-br from-brand-gold/10 via-brand-jade/5 to-brand-coral/5">
        <div className="gallery-container">
          <div className="text-center mb-16">
            <span className="caps-spacing text-xs text-brand-teal mb-4 inline-block">
              Why Choose Bespoke
            </span>
            <h2 className="font-heading text-4xl text-brand-umber mb-6">
              More Than Just Jewelry
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
                <Heart className="h-8 w-8 text-brand-teal" />
              </div>
              <h3 className="font-heading text-xl text-brand-umber mb-4">
                Personal Connection
              </h3>
              <p className="text-brand-umber/70">
                Work directly with artisans who understand your vision and cultural heritage.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto bg-brand-gold/20 rounded-full flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-brand-gold" />
              </div>
              <h3 className="font-heading text-xl text-brand-umber mb-4">
                Unique Heritage
              </h3>
              <p className="text-brand-umber/70">
                Each piece carries the story of its creation and the artisan's cultural background.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto bg-brand-coral/20 rounded-full flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-brand-coral" />
              </div>
              <h3 className="font-heading text-xl text-brand-umber mb-4">
                Community Impact
              </h3>
              <p className="text-brand-umber/70">
                Support artisan communities and preserve traditional craftsmanship for future generations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
