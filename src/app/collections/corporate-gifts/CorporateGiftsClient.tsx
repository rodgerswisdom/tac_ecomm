"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Gift,
  Heart,
  Globe,
  ArrowRight,
  Award,
  HandHeart,
  Sparkles,
  Mail,
} from "lucide-react";

const impactMetrics = [
  {
    icon: Users,
    number: "500+",
    label: "Artisan Families Supported",
    description: "Direct impact on communities across Africa",
  },
  {
    icon: Globe,
    number: "15",
    label: "Countries Represented",
    description: "Authentic pieces from diverse African regions",
  },
  {
    icon: Heart,
    number: "98%",
    label: "Customer Satisfaction",
    description: "Rated by corporate clients worldwide",
  },
  {
    icon: Award,
    number: "50+",
    label: "Fortune 500 Clients",
    description: "Trusted by leading global companies",
  },
];

export function CorporateGiftsClient() {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    quantity: "",
    budget: "",
    requirements: "",
  });

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />

      <section className="nav-clearance section-spacing">
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
            <h1 className="font-heading text-3xl sm:text-5xl text-brand-umber md:text-6xl mb-6">
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
              <Button
                size="lg"
                className="px-8 py-6"
                onClick={() => setShowContactForm(true)}
              >
                Request Corporate Catalog
                <Gift className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6"
                onClick={() => setShowContactForm(true)}
              >
                Schedule Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {showContactForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowContactForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl text-brand-umber">
                Corporate Gift Inquiry
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContactForm(false)}
              >
                ×
              </Button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for your inquiry! We'll contact you soon.");
                setShowContactForm(false);
              }}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.companyName}
                    onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-brand-umber/20 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.contactPerson}
                    onChange={(e) => setContactForm({ ...contactForm, contactPerson: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-brand-umber/20 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-brand-umber/20 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-brand-umber/20 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Quantity</label>
                  <input
                    type="text"
                    value={contactForm.quantity}
                    onChange={(e) => setContactForm({ ...contactForm, quantity: e.target.value })}
                    placeholder="e.g., 50-100 pieces"
                    className="w-full px-4 py-2 rounded-lg border border-brand-umber/20 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Range</label>
                  <input
                    type="text"
                    value={contactForm.budget}
                    onChange={(e) => setContactForm({ ...contactForm, budget: e.target.value })}
                    placeholder="e.g., $5,000 - $10,000"
                    className="w-full px-4 py-2 rounded-lg border border-brand-umber/20 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Special Requirements</label>
                <textarea
                  value={contactForm.requirements}
                  onChange={(e) => setContactForm({ ...contactForm, requirements: e.target.value })}
                  rows={4}
                  placeholder="Tell us about your specific needs, branding requirements, delivery timeline, etc."
                  className="w-full px-4 py-2 rounded-lg border border-brand-umber/20 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1">
                  Submit Inquiry
                  <Mail className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowContactForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
