'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, Heart, Award } from 'lucide-react'
import Link from 'next/link'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function validateForm(form: ContactForm): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim()) errors.name = 'Full name is required.'
  if (!form.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
  }
  if (!form.subject.trim()) errors.subject = 'Subject is required.'
  if (!form.message.trim()) errors.message = 'Message is required.'
  return errors
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validateForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send message. Please try again.')
      }
      setIsSubmitting(false)
      setIsSubmitted(true)
      setTimeout(() => {
        setIsSubmitted(false)
        setForm({ name: '', email: '', subject: '', message: '', phone: '' })
      }, 4000)
    } catch (err) {
      setIsSubmitting(false)
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-emerald-500" />,
      title: "Email Us",
      details: { href: "mailto:info@tacaccessories.co.ke", label: "info@tacaccessories.co.ke" },
      description: "Send us an email anytime"
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-500" />,
      title: "Call Us",
      details: { href: "tel:+254704800866", label: "+254 704 800866" },
      description: "Open Monday to Friday, 9am–5pm"
    },
    {
      icon: <MapPin className="h-6 w-6 text-brand-gold" />,
      title: "Our Location",
      details: { href: null, label: "Nairobi, Kenya" },
      description: "Based in Nairobi, Kenya — online studio only."
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-500" />,
      title: "Business Hours",
      details: { href: null, label: "Monday to Friday: 9am–5pm" },
      description: "Closed on weekends"
    }
  ]

  const faqs = [
    {
      question: "How long does it take to respond to inquiries?",
      answer: "We typically respond to all inquiries within 24 hours during business days."
    },
    {
      question: "Do you offer virtual consultations?",
      answer: "Yes! We offer virtual consultations to help you choose the perfect piece or discuss custom orders."
    },
    {
      question: "Can I schedule a visit to your workshop?",
      answer: "We are currently an online-only business. In-person workshop visits are not available at this time. We do offer virtual consultations to discuss your needs.",
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="nav-clearance pb-16 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/5 relative overflow-hidden">
        <div className="absolute inset-0 afro-pattern-stars opacity-5"></div>
        <div className="gallery-container relative z-10">
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
              <MessageSquare className="h-8 w-8 text-emerald-500" />
              <span className="text-emerald-600 font-semibold tracking-wide uppercase text-sm">Get in Touch</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold luxury-heading mb-6">
              <span className="afro-text-gradient">Contact</span>
              <br />
              <span className="text-foreground">Us</span>
            </h1>
            <p className="text-xl text-muted-foreground luxury-text leading-relaxed">
              We&apos;d love to hear from you! Whether you have questions about our jewellery,
              need help with an order, or want to learn more about our cultural significance,
              we&apos;re here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="afro-card">
                <CardHeader>
                  <CardTitle className="text-2xl luxury-heading">
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="luxury-text">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold luxury-heading mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-muted-foreground luxury-text">
                        Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                      {submitError && (
                        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {submitError}
                        </p>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Full Name *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? "name-error" : undefined}
                            className={`h-12 ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Your full name"
                          />
                          {errors.name && (
                            <p id="name-error" role="alert" className="mt-1 text-xs text-red-600">{errors.name}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email Address *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleInputChange}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            className={`h-12 ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="your@email.com"
                          />
                          {errors.email && (
                            <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-2">
                            Phone Number
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleInputChange}
                            className="h-12"
                            placeholder="+254 704 800866"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium mb-2">
                            Subject *
                          </label>
                          <Input
                            id="subject"
                            name="subject"
                            value={form.subject}
                            onChange={handleInputChange}
                            aria-invalid={!!errors.subject}
                            aria-describedby={errors.subject ? "subject-error" : undefined}
                            className={`h-12 ${errors.subject ? 'border-red-500' : ''}`}
                            placeholder="What's this about?"
                          />
                          {errors.subject && (
                            <p id="subject-error" role="alert" className="mt-1 text-xs text-red-600">{errors.subject}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={form.message}
                          onChange={handleInputChange}
                          aria-invalid={!!errors.message}
                          aria-describedby={errors.message ? "message-error" : undefined}
                          rows={6}
                          className={`w-full h-auto px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-sm ${errors.message ? 'border-red-500' : 'border-input'}`}
                          placeholder="Tell us more about your inquiry..."
                        />
                        {errors.message && (
                          <p id="message-error" role="alert" className="mt-1 text-xs text-red-600">{errors.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="afro-card p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-full bg-muted/50">
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold luxury-heading mb-1">
                            {info.title}
                          </h3>
                          {info.details.href ? (
                            <a href={info.details.href} className="text-primary font-semibold mb-1 hover:underline block">
                              {info.details.label}
                            </a>
                          ) : (
                            <p className="text-primary font-semibold mb-1">
                              {info.details.label}
                            </p>
                          )}
                          <p className="text-muted-foreground luxury-text text-sm">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold luxury-heading mb-6">
              Quick <span className="afro-text-gradient">Answers</span>
            </h2>
            <p className="text-xl text-muted-foreground luxury-text max-w-3xl mx-auto">
              Here are answers to some of the most common questions we receive.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="afro-card p-6">
                  <h3 className="text-lg font-semibold luxury-heading mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground luxury-text">
                    {faq.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold luxury-heading mb-6">
              Ready to <span className="afro-text-gradient">Explore</span>?
            </h2>
            <p className="text-xl text-muted-foreground luxury-text mb-8">
              Browse our collection of authentic African jewellery and discover
              pieces that speak to your soul.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/products">
                  <Award className="mr-2 h-5 w-5" />
                  Browse Collection
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link href="/about">
                  <Heart className="mr-2 h-5 w-5" />
                  Our Story
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
