'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Crown, Lock, Eye, EyeOff, ArrowLeft, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const token = searchParams.get('token') ?? ''
    const email = searchParams.get('email') ?? ''

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Guard — if params are missing the link is invalid
    const isValidLink = Boolean(token && email)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, password }),
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                // Redirect to sign-in after 3 seconds
                setTimeout(() => router.push('/auth/signin'), 3000)
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
        <div className="relative min-h-screen overflow-hidden bg-background pb-8">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/10" />
                <div className="absolute top-0 left-0 w-full h-full afro-pattern-stars" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 px-4 py-3 sm:py-4">
                <Link
                    href="/auth/signin"
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Sign In</span>
                </Link>
            </nav>

            <div className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-2xl">
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

                            <CardTitle className="luxury-heading text-xl sm:text-2xl">
                                Create a new <span className="afro-text-gradient">password</span>
                            </CardTitle>
                            <CardDescription className="luxury-text">
                                {email ? `Resetting password for ${email}` : 'Secure your account'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Invalid link state */}
                            {!isValidLink && (
                                <div className="flex flex-col items-center gap-4 py-4 text-center">
                                    <div className="rounded-full bg-amber-100 p-4">
                                        <AlertTriangle className="h-10 w-10 text-amber-600" />
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        This reset link is invalid or has already been used.
                                    </p>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Request a new reset link
                                    </Link>
                                </div>
                            )}

                            {/* Success state */}
                            {isValidLink && success && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-4 py-4"
                                >
                                    <div className="rounded-full bg-emerald-100 p-4">
                                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                                    </div>
                                    <p className="text-center text-sm text-muted-foreground leading-relaxed">
                                        Your password has been updated successfully. Redirecting you to sign in…
                                    </p>
                                </motion.div>
                            )}

                            {/* Form */}
                            {isValidLink && !success && (
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
                                        {/* New password */}
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    autoFocus
                                                    minLength={8}
                                                    className="pl-10 pr-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                                                    placeholder="At least 8 characters"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm password */}
                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    minLength={8}
                                                    className="pl-10 pr-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                                                    placeholder="Re-enter your new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
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
                                                    Updating password…
                                                </>
                                            ) : (
                                                'Set New Password'
                                            )}
                                        </Button>
                                    </form>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading…</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
