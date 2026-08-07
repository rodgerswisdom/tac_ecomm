"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { ImageUploader } from "@/components/ImageUploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Palette,
  Users,
  Sparkles,
  HandHeart,
} from "lucide-react";
import { getBespokeCategoryOptions } from "@/lib/category-taxonomy";

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

const categoryTimelines: Record<string, { standard: string; express: string }> = {
  earrings: {
    standard: "4-6 weeks",
    express: "2-3 weeks",
  },
  "bracelets-bangles": {
    standard: "6-8 weeks",
    express: "3-4 weeks",
  },
  "necklaces-chains": {
    standard: "8-12 weeks",
    express: "4-6 weeks",
  },
  "arm-bands": {
    standard: "4-6 weeks",
    express: "2-3 weeks",
  },
  "matching-sets": {
    standard: "10-14 weeks",
    express: "6-8 weeks",
  },
};

const categories = [
  ...getBespokeCategoryOptions(),
  { value: "matching-sets", label: "Matching Sets" },
];

const budgetOptions = [
  { value: "500-1000", label: "$500 - $1,000" },
  { value: "1000-2500", label: "$1,000 - $2,500" },
  { value: "2500-5000", label: "$2,500 - $5,000" },
  { value: "5000+", label: "$5,000+" },
];

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  vision: "",
  budget: "",
  category: "",
  timeline: "",
  isExpress: false,
};

function BespokeRequestForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!formData.category || !formData.budget) {
      setSubmitError("Please select a category and budget range.");
      return;
    }
    const submissionData = {
      ...formData,
      photos: uploadedPhotos,
      categoryLabel: categories.find((c) => c.value === formData.category)?.label || "",
      expressPremium: formData.isExpress ? 0.2 : 0,
    };
    setSubmitting(true);
    try {
      const res = await fetch("/api/bespoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: submissionData.name,
          email: submissionData.email,
          phone: submissionData.phone || undefined,
          vision: submissionData.vision,
          category: submissionData.category,
          categoryLabel: submissionData.categoryLabel,
          budget: submissionData.budget,
          timeline: submissionData.timeline,
          isExpress: submissionData.isExpress,
          expressPremium: submissionData.expressPremium,
          photos: submissionData.photos,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitSuccess(true);
    } catch {
      setSubmitError("Unable to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotosChange = (_files: File[], urls: string[]) => {
    setUploadedPhotos(urls);
  };

  const handleCategoryChange = (category: string) => {
    const timeline = categoryTimelines[category];
    setFormData({
      ...formData,
      category,
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

  const resetForm = () => {
    setSubmitSuccess(false);
    setFormData(initialFormData);
    setUploadedPhotos([]);
    setSubmitError("");
  };

  if (submitSuccess) {
    return (
      <div className="rounded-lg border border-brand-teal/30 bg-brand-jade/10 p-8 text-center">
        <h3 className="mb-2 font-heading text-xl text-brand-umber">Thank you</h3>
        <p className="mb-4 text-brand-umber/80">
          Your consultation request has been received. We&apos;ll be in touch soon.
        </p>
        <Button
          variant="outline"
          onClick={resetForm}
          className="border-brand-teal/30 text-brand-umber"
        >
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="rounded-lg border border-brand-coral/50 bg-brand-coral/10 px-4 py-3 text-sm text-brand-coral">
          {submitError}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-umber">
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
          <label className="mb-2 block text-sm font-medium text-brand-umber">
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
        <label className="mb-2 block text-sm font-medium text-brand-umber">
          Phone Number
        </label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-brand-umber">
          Your Vision
        </label>
        <textarea
          value={formData.vision}
          onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
          placeholder="Describe your vision, inspiration, or any specific requirements..."
          className="h-32 w-full resize-none rounded-md border border-brand-umber/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-teal"
          required
        />
      </div>

      <ImageUploader
        mode="multiple"
        onChange={handlePhotosChange}
        maxFiles={5}
        folder="bespoke-uploads"
        tags={["bespoke", "reference"]}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-brand-umber">
          Product Category <span className="text-brand-coral">*</span>
        </label>
        <CustomDropdown
          options={categories}
          value={formData.category}
          onChange={handleCategoryChange}
          placeholder="Select a category"
          className="[&>button]:border-brand-umber/20 [&>button]:bg-white [&>button]:text-brand-umber [&>button_span]:text-brand-umber [&>button_svg]:text-brand-umber/60"
          ariaLabel="Product category"
        />
        {formData.category && selectedCategoryTimeline && (
          <p className="mt-1 text-xs text-brand-umber/60">
            Standard timeline for {categories.find((c) => c.value === formData.category)?.label}: {selectedCategoryTimeline.standard}
          </p>
        )}
      </div>

      {formData.category && selectedCategoryTimeline && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-brand-umber/20 bg-brand-beige/50 p-4">
            <input
              type="checkbox"
              id="express"
              checked={formData.isExpress}
              onChange={(e) => handleExpressChange(e.target.checked)}
              className="h-4 w-4 rounded border-brand-umber/30 text-brand-teal focus:ring-brand-teal"
            />
            <div className="flex-1">
              <label htmlFor="express" className="cursor-pointer text-sm font-medium text-brand-umber">
                Express Delivery
              </label>
              <p className="mt-1 text-xs text-brand-umber/70">
                {selectedCategoryTimeline.express} delivery (shorter timeframe, additional cost applies)
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-brand-teal/30 bg-brand-jade/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-umber">
                  Estimated Timeline
                </p>
                <p className="mt-1 text-xs text-brand-umber/70">
                  {formData.isExpress ? "Express" : "Standard"} delivery
                </p>
              </div>
              <p className="font-heading text-lg text-brand-teal">
                {formData.isExpress
                  ? selectedCategoryTimeline.express
                  : selectedCategoryTimeline.standard}
              </p>
            </div>
            {formData.isExpress && (
              <p className="mt-2 flex items-center gap-1 text-xs text-brand-coral">
                <span className="font-semibold">*</span>
                <span>Express delivery incurs an additional 20% premium on the final price</span>
              </p>
            )}
          </div>

          <input type="hidden" name="timeline" value={formData.timeline} />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-brand-umber">
          Budget Range
        </label>
        <CustomDropdown
          options={budgetOptions}
          value={formData.budget}
          onChange={(budget) => setFormData({ ...formData, budget })}
          placeholder="Select budget range"
          className="[&>button]:border-brand-umber/20 [&>button]:bg-white [&>button]:text-brand-umber [&>button_span]:text-brand-umber [&>button_svg]:text-brand-umber/60"
          ariaLabel="Budget range"
        />
        {formData.isExpress && (
          <p className="mt-1 text-xs text-brand-umber/60">
            Note: Express delivery adds 20% to your selected budget range
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-12 w-full text-lg"
        disabled={submitting}
      >
        {submitting ? (
          <>Sending...</>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Request Consultation
          </>
        )}
      </Button>
    </form>
  );
}

export function BespokeRequestModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request a Consultation</DialogTitle>
          <DialogDescription>
            Fill out the form below to get started on your bespoke piece.
          </DialogDescription>
        </DialogHeader>
        <Card className="overflow-hidden border-brand-umber/10 bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-5 pb-2 text-center sm:p-6">
            <CardTitle className="text-center text-brand-umber">
              Bespoke Request Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 sm:p-6">
            <BespokeRequestForm />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export function BespokeProcessSection({
  onRequestClick,
}: {
  onRequestClick?: () => void;
}) {
  return (
    <section className="section-spacing bg-brand-beige">
      <div className="gallery-container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-heading text-3xl text-brand-umber md:text-4xl">
            Commission a custom piece
          </h2>
          <p className="mx-auto max-w-2xl text-base text-brand-umber/70">
            Prefer something made only for you? Share your vision and our studio will guide the process.
          </p>
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
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold to-brand-teal">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-umber text-xs font-bold text-white shadow-lg">
                    {step.step}
                  </div>
                </div>
              </div>
              <h3 className="mb-3 font-heading text-xl text-brand-umber">{step.title}</h3>
              <p className="text-brand-umber/70">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {onRequestClick ? (
          <div className="mt-12 flex justify-center">
            <Button size="lg" onClick={onRequestClick}>
              <Sparkles className="mr-2 h-5 w-5" />
              Request bespoke piece
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** @deprecated Use BespokeProcessSection + BespokeRequestModal instead */
export function BespokeCommissionSection() {
  return <BespokeProcessSection />;
}
