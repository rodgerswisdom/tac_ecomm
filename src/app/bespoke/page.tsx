"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhotoUpload } from "@/components/PhotoUpload";
import { 
  Palette, 
  Users, 
  Sparkles,
  HandHeart,
} from "lucide-react";

const bespokeProcess = [
  {
    step: 1,
    title: "Design Consultation",
    description: "Share your vision with our team through a personalized consultation.",
    icon: Palette,
  },
  {
    step: 2,
    title: "Design Development",
    description: "We develop your custom design based on your requirements and preferences.",
    icon: Users,
  },
  {
    step: 3,
    title: "Creation & Delivery",
    description: "Watch your piece come to life through regular updates and receive your finished bespoke piece.",
    icon: HandHeart,
  },
];


// Category to standard timeline mapping
const categoryTimelines: Record<string, { standard: string; express: string }> = {
  earrings: {
    standard: "4-6 weeks",
    express: "2-3 weeks",
  },
  rings: {
    standard: "6-8 weeks",
    express: "3-4 weeks",
  },
  bracelets: {
    standard: "6-8 weeks",
    express: "3-4 weeks",
  },
  necklaces: {
    standard: "8-12 weeks",
    express: "4-6 weeks",
  },
  "hair-accessories": {
    standard: "4-6 weeks",
    express: "2-3 weeks",
  },
  "matching-sets": {
    standard: "10-14 weeks",
    express: "6-8 weeks",
  },
};

const categories = [
  { value: "earrings", label: "Earrings" },
  { value: "rings", label: "Rings" },
  { value: "bracelets", label: "Bracelets & Bangles" },
  { value: "necklaces", label: "Necklaces & Chains" },
  { value: "hair-accessories", label: "Hair Accessories" },
  { value: "matching-sets", label: "Matching Sets" },
];

export default function BespokeStudioPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vision: "",
    budget: "",
    category: "",
    timeline: "",
    isExpress: false,
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    const submissionData = {
      ...formData,
      photos: uploadedPhotos,
      categoryLabel: categories.find((c) => c.value === formData.category)?.label || "",
      expressPremium: formData.isExpress ? 0.2 : 0, // 20% premium
    };
    console.log("Bespoke consultation request:", submissionData);
    // TODO: Send to API endpoint
  };

  const handlePhotosChange = (files: File[], urls: string[]) => {
    setUploadedPhotos(urls);
  };

  // Update timeline when category or express option changes
  const handleCategoryChange = (category: string) => {
    const newCategory = category;
    const timeline = categoryTimelines[newCategory];
    setFormData({
      ...formData,
      category: newCategory,
      timeline: timeline ? (formData.isExpress ? timeline.express : timeline.standard) : "",
    });
  };

  const handleExpressChange = (isExpress: boolean) => {
    if (formData.category && categoryTimelines[formData.category]) {
      const timeline = categoryTimelines[formData.category];
      setFormData({
        ...formData,
        isExpress,
        timeline: isExpress ? timeline.express : timeline.standard,
      });
    } else {
      setFormData({
        ...formData,
        isExpress,
      });
    }
  };

  const selectedCategoryTimeline = formData.category
    ? categoryTimelines[formData.category]
    : null;

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      
      {/* Hero Section with How It Works */}
      <section className="section-spacing bg-brand-beige">
        <div className="gallery-container">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl text-brand-umber md:text-5xl mb-4">
              Bespoke Studio
            </h1>
            <p className="text-lg text-brand-umber/70 max-w-2xl mx-auto mb-12">
              Create custom pieces tailored to your vision with TAC Accessories.
            </p>
            
            {/* <div className="mb-12">
              <h2 className="font-heading text-3xl text-brand-umber mb-4">
                How It Works
              </h2>
              <p className="text-base text-brand-umber/70 max-w-xl mx-auto mb-8">
                Our team guides you through the bespoke creation process.
              </p>
            </div> */}
          </div>

          <div className="grid gap-8 md:grid-cols-3">
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
                <p className="text-brand-umber/70">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Form */}
      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl text-brand-umber mb-4">
                Request a Consultation
              </h2>
              <p className="text-base text-brand-umber/70">
                Fill out the form below to get started.
              </p>
            </div>

            <Card className="border-brand-umber/10 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-brand-umber">
                  Bespoke Request Form
                </CardTitle>
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

                  <PhotoUpload onFilesChange={handlePhotosChange} maxFiles={5} />

                  <div>
                    <label className="block text-sm font-medium text-brand-umber mb-2">
                      Product Category <span className="text-brand-coral">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-brand-umber/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {formData.category && selectedCategoryTimeline && (
                      <p className="text-xs text-brand-umber/60 mt-1">
                        Standard timeline for {categories.find((c) => c.value === formData.category)?.label}: {selectedCategoryTimeline.standard}
                      </p>
                    )}
                  </div>

                  {formData.category && selectedCategoryTimeline && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 rounded-lg border border-brand-umber/20 bg-brand-beige/50">
                        <input
                          type="checkbox"
                          id="express"
                          checked={formData.isExpress}
                          onChange={(e) => handleExpressChange(e.target.checked)}
                          className="w-4 h-4 text-brand-teal border-brand-umber/30 rounded focus:ring-brand-teal"
                        />
                        <div className="flex-1">
                          <label htmlFor="express" className="text-sm font-medium text-brand-umber cursor-pointer">
                            Express Delivery
                          </label>
                          <p className="text-xs text-brand-umber/70 mt-1">
                            {selectedCategoryTimeline.express} delivery (shorter timeframe, additional cost applies)
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border border-brand-teal/30 bg-brand-jade/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-brand-umber">
                              Estimated Timeline
                            </p>
                            <p className="text-xs text-brand-umber/70 mt-1">
                              {formData.isExpress ? "Express" : "Standard"} delivery
                            </p>
                          </div>
                          <p className="text-lg font-heading text-brand-teal">
                            {formData.isExpress
                              ? selectedCategoryTimeline.express
                              : selectedCategoryTimeline.standard}
                          </p>
                        </div>
                        {formData.isExpress && (
                          <p className="text-xs text-brand-coral mt-2 flex items-center gap-1">
                            <span className="font-semibold">*</span>
                            <span>Express delivery incurs an additional 20% premium on the final price</span>
                          </p>
                        )}
                      </div>

                      {/* Hidden input to store timeline value for form submission */}
                      <input
                        type="hidden"
                        name="timeline"
                        value={formData.timeline}
                      />
                    </div>
                  )}

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
                    {formData.isExpress && (
                      <p className="text-xs text-brand-umber/60 mt-1">
                        Note: Express delivery adds 20% to your selected budget range
                      </p>
                    )}
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


      <Footer />
    </main>
  );
}
