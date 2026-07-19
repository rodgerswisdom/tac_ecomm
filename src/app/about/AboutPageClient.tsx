'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, Heart, Award, Users, Globe, Shield, ChevronDown, ChevronUp, Star, Gem, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { useCurrency } from '@/contexts/CurrencyContext'
import { formatFreeShippingThreshold } from '@/lib/delivery'

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
}

export function AboutPageClient() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { formatPrice } = useCurrency()
  const freeShippingThreshold = formatFreeShippingThreshold(formatPrice)

  const faqs: FAQ[] = [
    {
      id: 1,
      question: "What makes Tac Accessories authentic?",
      answer: "Every piece in our collection is handcrafted by master artisans using traditional techniques passed down through generations. We work directly with artisans across Africa to ensure authenticity and fair trade practices. Each piece comes with a certificate of authenticity and tells the story of its cultural significance.",
      category: "authenticity"
    },
    {
      id: 2,
      question: "How do you ensure ethical sourcing?",
      answer: "We are committed to ethical sourcing and fair trade practices. All our materials are sourced responsibly from certified suppliers, and we work directly with artisan communities to ensure fair wages and working conditions. We also support local communities through our artisan partnership program.",
      category: "ethics"
    },
    {
      id: 3,
      question: "What materials do you use?",
      answer: "We use locally sourced materials including cow bones, wood, brass, aluminium, and clay. All materials are carefully selected for their quality and cultural significance.",
      category: "materials"
    },
    {
      id: 4,
      question: "How long does shipping take?",
      answer: `We offer worldwide shipping. Kenya standard delivery takes 1-3 business days; Kenya express is faster (1-2 business days). International standard delivery takes 3-7 business days; international express is faster (2-5 business days). All orders are fully insured and tracked. Free shipping applies to orders within Kenya worth ${freeShippingThreshold} or more.`,
      category: "shipping"
    },
    {
      id: 5,
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all items. If you're not completely satisfied with your purchase, you can return it for a full refund or exchange. We also provide free return shipping and will help you find the perfect piece.",
      category: "returns"
    },
    {
      id: 6,
      question: "How do I care for my African jewellery?",
      answer: "Each piece comes with specific care instructions. Generally, store your jewellery in a dry, cool place away from direct sunlight. Clean gently with a soft cloth and avoid contact with perfumes and lotions. For gold pieces, professional cleaning is recommended annually.",
      category: "care"
    },
    {
      id: 7,
      question: "Do you offer custom pieces?",
      answer: "Yes! We work with our master artisans to create custom pieces based on your preferences. Whether you want to incorporate specific symbols, use particular materials, or create something unique, our artisans can bring your vision to life. Custom pieces typically take 4-6 weeks to complete.",
      category: "custom"
    },
    {
      id: 8,
      question: "What cultural significance do the symbols have?",
      answer: "Each symbol in our collection carries deep cultural and spiritual meaning. Adinkra symbols represent concepts like wisdom, strength, unity, and protection. We provide detailed information about each symbol's meaning and cultural context with every purchase.",
      category: "culture"
    },
    {
      id: 9,
      question: "How do you support African communities?",
      answer: "We are committed to supporting African communities through fair trade practices, artisan partnerships, and community development programs. A portion of every sale goes back to the communities where our pieces are made, supporting education, healthcare, and economic development.",
      category: "community"
    },
    {
      id: 10,
      question: "Can I visit your workshops?",
      answer: "We are currently an online-only business. In-person workshop visits are not available at this time. Contact us for virtual consultations or custom order discussions.",
      category: "tours"
    }
  ]

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'authenticity', name: 'Authenticity' },
    { id: 'ethics', name: 'Ethics & Sourcing' },
    { id: 'materials', name: 'Materials' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'returns', name: 'Returns' },
    { id: 'care', name: 'Care' },
    { id: 'custom', name: 'Custom Orders' },
    { id: 'culture', name: 'Culture' },
    { id: 'community', name: 'Community' },
    { id: 'tours', name: 'Tours' }
  ]

  const filteredFAQs = selectedCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory)

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="nav-clearance py-20 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/5 relative overflow-hidden">
        <div className="absolute inset-0 afro-pattern-stars opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center space-x-2 mb-6"
            >
              <Heart className="h-8 w-8 text-emerald-500" />
              <span className="text-emerald-600 font-semibold tracking-wide uppercase text-sm">Our Story</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold luxury-heading mb-6">
              <span className="afro-text-gradient">Celebrating</span>
              <br />
              <span className="text-foreground">African Heritage</span>
            </h1>
            <p className="text-xl text-muted-foreground luxury-text leading-relaxed">
              Tac Accessories was born from a deep passion for African culture and a desire to share
              the beauty of traditional craftsmanship with the world. We believe that every piece
              of jewellery tells a story, and our mission is to preserve and celebrate these stories
              while supporting the communities that create them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold luxury-heading mb-6">
              Our <span className="afro-text-gradient">Mission</span>
            </h2>
            <p className="text-xl text-muted-foreground luxury-text leading-relaxed mb-12">
              We are dedicated to preserving African cultural heritage through authentic,
              handcrafted jewellery while supporting artisan communities across the continent.
              Every piece in our collection represents not just beauty, but the rich history
              and traditions of African craftsmanship.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-soft">
                <div className="p-4 rounded-full bg-emerald-100 mb-4">
                  <Award className="h-8 w-8 text-emerald-600" />
                </div>
                <span className="font-semibold text-lg">Authentic Craftsmanship</span>
              </div>
              <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-soft">
                <div className="p-4 rounded-full bg-gold/20 mb-4">
                  <Users className="h-8 w-8 text-gold" />
                </div>
                <span className="font-semibold text-lg">Community Support</span>
              </div>
              <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-soft">
                <div className="p-4 rounded-full bg-blue-100 mb-4">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <span className="font-semibold text-lg">Cultural Preservation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold luxury-heading mb-6">
              Our <span className="afro-text-gradient">Values</span>
            </h2>
            <p className="text-xl text-muted-foreground luxury-text max-w-3xl mx-auto">
              These core values guide everything we do, from selecting our artisans to
              creating each piece of jewellery.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="h-12 w-12 text-emerald-500" />,
                title: "Authenticity",
                description: "Every piece is authentically crafted using traditional techniques and materials, preserving the true essence of African craftsmanship."
              },
              {
                icon: <Shield className="h-12 w-12 text-blue-500" />,
                title: "Ethical Sourcing",
                description: "We ensure fair trade practices and ethical sourcing of all materials, supporting communities and protecting the environment."
              },
              {
                icon: <Crown className="h-12 w-12 text-gold" />,
                title: "Quality Excellence",
                description: "We maintain the highest standards of quality, ensuring every piece meets our rigorous standards for craftsmanship and durability."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="afro-card h-full text-center p-8">
                  <div className="flex justify-center mb-6">
                    {value.icon}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl luxury-heading">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg luxury-text leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold luxury-heading mb-6">
              Frequently Asked <span className="afro-text-gradient">Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground luxury-text max-w-3xl mx-auto">
              Find answers to common questions about our jewellery, shipping,
              and cultural significance.
            </p>
          </motion.div>

          {/* FAQ Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-brand-umber text-brand-beige" : ""}
              >
                {category.name}
              </Button>
            ))}
          </motion.div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="afro-card">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold luxury-heading">
                      {faq.question}
                    </h3>
                    {openFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {openFAQ === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-muted-foreground luxury-text leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold luxury-heading mb-6">
              Have More <span className="afro-text-gradient">Questions</span>?
            </h2>
            <p className="text-xl text-muted-foreground luxury-text mb-8">
              We&apos;re here to help! Contact us for any questions about our jewellery,
              cultural significance, or custom orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/contact">
                  <Heart className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link href="/products">
                  <Gem className="mr-2 h-5 w-5" />
                  Browse Collection
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
