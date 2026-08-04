"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Award, HandHeart, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MANUAL_PAYMENT } from "@/lib/manual-payment";
import { FREE_SHIPPING_KENYA_KSH_THRESHOLD, SHIPPING_RATES_KSH } from "@/lib/delivery";

const pillars = [
  {
    icon: Award,
    title: "Authentic craft",
    description: "Handmade pieces from artisans using techniques passed down across generations.",
  },
  {
    icon: HandHeart,
    title: "Fair partnerships",
    description: "We work directly with makers and invest in the communities behind each design.",
  },
  {
    icon: Sparkles,
    title: "Living heritage",
    description: "Every collection celebrates African symbolism, materials, and contemporary style.",
  },
] as const;

const faqs = [
  {
    id: "what-is-tac",
    question: "What is TAC Accessories?",
    answer:
      "TAC is a Nairobi-based gallery of African adornment and home pieces—handmade by artisans across the continent and curated for collectors who value craft, story, and contemporary style.",
  },
  {
    id: "handmade",
    question: "Are the products handmade?",
    answer:
      "Yes. Most pieces are handmade, so small variations in colour, texture, or finish are part of the craft. Product pages note materials and details when available.",
  },
  {
    id: "designs",
    question: "What do the different designs on a product mean?",
    answer:
      "Many products offer more than one design (gallery images). Choose the design you want before adding to your basket. Each design can have its own description on the product page.",
  },
  {
    id: "payment",
    question: "How do I pay for an order?",
    answer: `Pay with M-Pesa Paybill after placing your order: Business number ${MANUAL_PAYMENT.paybillNumber}, Account (short code) ${MANUAL_PAYMENT.accountNumber}, then enter the order amount and submit. We confirm the order once payment is received.`,
  },
  {
    id: "shipping",
    question: "How much is shipping in Kenya?",
    answer: `Kenya Standard is KSh ${SHIPPING_RATES_KSH.kenya_standard.toLocaleString("en-KE")} (1–3 business days). Kenya Express is KSh ${SHIPPING_RATES_KSH.kenya_express.toLocaleString("en-KE")} (1–2 business days). Orders within Kenya may qualify for free shipping above KSh ${FREE_SHIPPING_KENYA_KSH_THRESHOLD.toLocaleString("en-KE")}.`,
  },
  {
    id: "delivery-time",
    question: "When does delivery timing start?",
    answer:
      "Delivery timelines begin after we confirm payment. Handmade and made-to-order pieces may need extra preparation time—we’ll update you if so.",
  },
  {
    id: "returns",
    question: "What is your returns policy?",
    answer:
      "If an item arrives damaged or doesn’t match your order, request a return or exchange within 7 days of delivery. Items should be unused and in original condition. Contact us with your order number and photos if needed.",
  },
  {
    id: "bespoke",
    question: "Can I commission a custom or limited piece?",
    answer:
      "Yes. Visit Bespoke & Limited Edition to shop exclusive works or submit a commission request. Our team will follow up to discuss materials, timeline, and pricing.",
  },
  {
    id: "corporate",
    question: "Do you offer corporate or gift orders?",
    answer:
      "We support gifting and corporate enquiries. Reach out via the Contact page with quantities, timelines, and branding needs so we can advise.",
  },
  {
    id: "contact",
    question: "How can I reach you?",
    answer: `Email ${MANUAL_PAYMENT.supportEmail}, WhatsApp ${MANUAL_PAYMENT.whatsappDisplay}, or use the Contact form. Include your order number when asking about an existing order.`,
  },
] as const;

export function AboutPageClient() {
  return (
    <main className="relative overflow-hidden bg-brand-beige bg-texture-linen">
      <Navbar />

      {/* Section 1 — Intro */}
      <section className="nav-clearance section-spacing pb-12 md:pb-16">
        <div className="gallery-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="caps-spacing text-xs text-brand-teal">About TAC</span>
            <h1 className="mt-3 font-heading text-4xl leading-tight text-brand-umber md:text-5xl">
              Where heritage breathes, and luxury lives.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-brand-umber/75 md:text-lg">
              Tac Accessories is a gallery of African adornment—curated in Nairobi, crafted across the
              continent, and made for collectors who care about story as much as silhouette.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 2 — What we stand for */}
      <section className="section-spacing bg-white">
        <div className="gallery-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="caps-spacing text-xs text-brand-teal">Our promise</span>
            <h2 className="mt-3 font-heading text-3xl text-brand-umber md:text-4xl">
              Craft with intention
            </h2>
            <p className="mt-4 text-sm text-brand-umber/70 md:text-base">
              Three principles guide every piece we offer.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.33, 1, 0.68, 1] }}
                className="rounded-3xl border border-brand-umber/10 bg-brand-beige/40 p-6 shadow-[0_16px_40px_rgba(74,43,40,0.08)]"
              >
                <div className="mb-4 inline-flex rounded-2xl border border-brand-teal/20 bg-brand-teal/10 p-3 text-brand-teal">
                  <pillar.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-heading text-xl text-brand-umber">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-umber/70">{pillar.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-14 flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-brand-teal/20 bg-brand-jade/10 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <div>
              <p className="font-heading text-xl text-brand-umber">Step into the gallery</p>
              <p className="mt-1 text-sm text-brand-umber/70">
                Browse collections or reach out for bespoke and gifting.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-center gap-3">
              <Button asChild className="bg-brand-umber text-white hover:bg-brand-umber/90">
                <Link href="/collections">
                  Shop collections
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-brand-teal/30 text-brand-umber">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 3 — FAQs */}
      <section id="faq" className="section-spacing">
        <div className="gallery-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="caps-spacing text-xs text-brand-teal">Help</span>
            <h2 className="mt-3 font-heading text-3xl text-brand-umber md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-sm text-brand-umber/70 md:text-base">
              Quick answers on craft, payment, shipping, and returns.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
            className="mx-auto mt-10 max-w-3xl rounded-3xl border border-brand-umber/10 bg-white/90 px-5 py-2 shadow-[0_16px_40px_rgba(74,43,40,0.08)] sm:px-8"
          >
            <Accordion type="single" collapsible defaultValue={faqs[0]?.id} className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p>{faq.answer}</p>
                    {faq.id === "shipping" ? (
                      <p className="mt-2">
                        <Link href="/shipping" className="font-medium text-brand-teal hover:underline">
                          View shipping details
                        </Link>
                      </p>
                    ) : null}
                    {faq.id === "returns" ? (
                      <p className="mt-2">
                        <Link href="/returns" className="font-medium text-brand-teal hover:underline">
                          View returns policy
                        </Link>
                      </p>
                    ) : null}
                    {faq.id === "bespoke" ? (
                      <p className="mt-2">
                        <Link href="/bespoke" className="font-medium text-brand-teal hover:underline">
                          Explore Bespoke & Limited Edition
                        </Link>
                      </p>
                    ) : null}
                    {faq.id === "contact" ? (
                      <p className="mt-2">
                        <Link href="/contact" className="font-medium text-brand-teal hover:underline">
                          Go to Contact
                        </Link>
                      </p>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
