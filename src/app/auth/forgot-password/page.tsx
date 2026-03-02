'use client'

import { useState } from 'react'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Crown, Mail, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const normalizedEmail = email.trim().toLowerCase()

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError('Please enter a valid email address')
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizedEmail }),
            })

            const data = await res.json()

            if (res.ok) {
                setSubmitted(true)
            } else if (res.status === 404) {
                setError(data.message ?? "We couldn't find an account with that email. Please check and try again.")
            } else {
                setError(data.message ?? 'Something went wrong. Please try again.')
            }
        } catch {
            setError('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background pattern — matches sign-in page */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/10" />
                <div className="absolute top-0 left-0 w-full h-full afro-pattern-stars" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 p-4">
                <Link
                    href="/auth/signin"
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Sign In</span>
                </Link>
            </nav>

            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-2xl">
                        {!submitted && (
                            <CardHeader className="text-center pb-8">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="flex justify-center mb-4"
                                >
                                    <div className="relative">
                                        <Crown className="h-12 w-12 text-primary" />
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                            className="absolute -top-1 -right-1"
                                        >
                                            <Sparkles className="h-4 w-4 text-emerald-500" />
                                        </motion.div>
                                    </div>
                                </motion.div>

                                <CardTitle className="text-2xl luxury-heading">
                                    Forgot your <span className="afro-text-gradient">password?</span>
                                </CardTitle>
                                <CardDescription className="luxury-text">
                                    Enter your email and we&apos;ll send you a secure reset link
                                </CardDescription>
                            </CardHeader>
                        )}

                        <CardContent className="space-y-6">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-4 py-4"
                                >
                                    <div className="rounded-full bg-emerald-100 p-4">
                                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                                    </div>
                                    <p className="text-center text-sm text-muted-foreground leading-relaxed">
                                        A password reset link has been sent to <strong>{email}</strong>. Check your inbox and spam folder.
                                    </p>
                                    <Link
                                        href="/auth/signin"
                                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Return to Sign In
                                    </Link>
                                </motion.div>
                            ) : (
                                <>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    autoFocus
                                                    className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                                                    placeholder="you@tacaccessories.com"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full h-12 text-lg bg-gradient-to-r from-primary to-emerald hover:from-primary/90 hover:to-emerald/90 shadow-xl hover:shadow-2xl transition-all duration-300"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                                    Sending link…
                                                </>
                                            ) : (
                                                'Send Reset Link'
                                            )}
                                        </Button>
                                    </form>

                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Remembered it?{' '}
                                            <Link
                                                href="/auth/signin"
                                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                                            >
                                                Sign in
                                            </Link>
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div>Loading…</div>}>
            <ForgotPasswordForm />
        </Suspense>
    )
}
