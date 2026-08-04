'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Input } from '@/components/ui/input'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

type FormField = keyof FormErrors

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

const fieldClass = (showError: boolean) =>
  cn(
    'h-11 w-full rounded-lg border bg-white px-3 text-sm text-brand-umber placeholder:text-brand-umber/45',
    'focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30',
    showError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-brand-umber/20',
  )

export function ContactPageClient() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const showFieldError = (field: FormField) =>
    Boolean(errors[field] && (hasAttemptedSubmit || touched[field]))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as FormField]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleBlur = (field: FormField) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const nextErrors = validateForm(form)
    setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setHasAttemptedSubmit(true)

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
      setIsSubmitted(true)
      setHasAttemptedSubmit(false)
      setTouched({})
      setErrors({})
      setTimeout(() => {
        setIsSubmitted(false)
        setForm({ name: '', email: '', subject: '', message: '', phone: '' })
      }, 4000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const errorSummary =
    hasAttemptedSubmit && Object.keys(errors).length > 0
      ? Object.values(errors).filter(Boolean)
      : []

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      href: 'mailto:info@tacaccessories.co.ke',
      label: 'info@tacaccessories.co.ke',
      description: 'We reply within one business day.',
    },
    {
      icon: Phone,
      title: 'Phone',
      href: 'tel:+254704800866',
      label: '+254 704 800866',
      description: 'Monday–Friday, 9am–5pm EAT.',
    },
    {
      icon: MapPin,
      title: 'Studio',
      href: null as string | null,
      label: 'Based in Nairobi, Kenya',
      description: 'Online-only studio — customer visits are not available.',
    },
    {
      icon: Clock,
      title: 'Hours',
      href: null,
      label: 'Mon–Fri, 9am–5pm',
      description: 'Closed on weekends and public holidays.',
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-beige bg-texture-linen">
      <Navbar />

      <section className="nav-clearance section-spacing pb-8">
        <div className="gallery-container mx-auto max-w-3xl text-center">
          <span className="caps-spacing text-xs text-brand-teal">Contact</span>
          <h1 className="mt-3 font-heading text-4xl text-brand-umber md:text-5xl">We&apos;re here to help</h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-umber/75 md:text-base">
            Questions about an order, bespoke work, or corporate gifting? Send a message and our team will
            respond during business hours.
          </p>
        </div>
      </section>

      <section className="section-spacing pt-0">
        <div className="gallery-container">
          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,340px)] lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-brand-umber/10 bg-white/90 p-6 shadow-[0_20px_50px_rgba(74,43,40,0.1)] sm:p-8"
            >
              <div className="mb-6 flex items-center gap-2 text-brand-umber">
                <MessageSquare className="h-5 w-5 text-brand-teal" aria-hidden />
                <h2 className="font-heading text-2xl">Send a message</h2>
              </div>

              {isSubmitted ? (
                <div className="py-10 text-center">
                  <CheckCircle className="mx-auto mb-4 h-14 w-14 text-brand-teal" aria-hidden />
                  <p className="font-heading text-xl text-brand-umber">Message sent</p>
                  <p className="mt-2 text-sm text-brand-umber/70">We&apos;ll get back to you within 24 hours on business days.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {submitError ? (
                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                      {submitError}
                    </p>
                  ) : null}

                  {errorSummary.length > 0 ? (
                    <div
                      role="alert"
                      aria-labelledby="contact-form-errors"
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    >
                      <p id="contact-form-errors" className="font-medium">
                        Please fix the following:
                      </p>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        {errorSummary.map((message) => (
                          <li key={message}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-brand-umber">
                        Full name <span className="text-brand-coral">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('name')}
                        aria-invalid={showFieldError('name')}
                        aria-describedby={showFieldError('name') ? 'name-error' : undefined}
                        className={fieldClass(showFieldError('name'))}
                        placeholder="Your name"
                      />
                      {showFieldError('name') ? (
                        <p id="name-error" role="alert" className="mt-1 text-xs text-red-600">
                          {errors.name}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-brand-umber">
                        Email <span className="text-brand-coral">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('email')}
                        aria-invalid={showFieldError('email')}
                        aria-describedby={showFieldError('email') ? 'email-error' : undefined}
                        className={fieldClass(showFieldError('email'))}
                        placeholder="you@example.com"
                      />
                      {showFieldError('email') ? (
                        <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
                          {errors.email}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-brand-umber">
                        Phone <span className="text-brand-umber/50">(optional)</span>
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleInputChange}
                        className={fieldClass(false)}
                        placeholder="+254 …"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-brand-umber">
                        Subject <span className="text-brand-coral">*</span>
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('subject')}
                        aria-invalid={showFieldError('subject')}
                        aria-describedby={showFieldError('subject') ? 'subject-error' : undefined}
                        className={fieldClass(showFieldError('subject'))}
                        placeholder="How can we help?"
                      />
                      {showFieldError('subject') ? (
                        <p id="subject-error" role="alert" className="mt-1 text-xs text-red-600">
                          {errors.subject}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-brand-umber">
                      Message <span className="text-brand-coral">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('message')}
                      aria-invalid={showFieldError('message')}
                      aria-describedby={showFieldError('message') ? 'message-error' : undefined}
                      rows={5}
                      className={cn(fieldClass(showFieldError('message')), 'h-auto resize-none py-2.5')}
                      placeholder="Tell us about your inquiry…"
                    />
                    {showFieldError('message') ? (
                      <p id="message-error" role="alert" className="mt-1 text-xs text-red-600">
                        {errors.message}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full bg-brand-umber text-white hover:bg-brand-umber/90"
                  >
                    {isSubmitting ? (
                      'Sending…'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" aria-hidden />
                        Send message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>

            <aside className="space-y-4">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="rounded-2xl border border-brand-teal/15 bg-white/85 p-5 shadow-[0_12px_32px_rgba(74,43,40,0.08)]"
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                      <info.icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-umber/70">
                        {info.title}
                      </h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="mt-1 block font-medium text-brand-teal hover:underline"
                        >
                          {info.label}
                        </a>
                      ) : (
                        <p className="mt-1 font-medium text-brand-umber">{info.label}</p>
                      )}
                      <p className="mt-1 text-sm text-brand-umber/65">{info.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-brand-umber/10 bg-brand-jade/10 p-5 text-sm text-brand-umber/75">
                <p className="font-medium text-brand-umber">Virtual consultations</p>
                <p className="mt-1">
                  We offer video calls for bespoke and corporate orders. Workshop visits are not available.
                </p>
              </div>

              <p className="text-center text-sm text-brand-umber/70 lg:text-left">
                Prefer to browse first?{' '}
                <Link href="/collections" className="font-medium text-brand-teal hover:underline">
                  Shop collections
                </Link>
              </p>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
