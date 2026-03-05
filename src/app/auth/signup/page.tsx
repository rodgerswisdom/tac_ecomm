'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Crown, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, User, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Step = 'form' | 'otp'

export default function SignUpPage() {
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [verificationId, setVerificationId] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'password' || name === 'confirmPassword') {
        setPasswordsMatch(
          name === 'password'
            ? value === prev.confirmPassword
            : prev.password === value
        )
      }
      return updated
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password
    const confirmPassword = formData.confirmPassword
    const normalizedEmail = email.toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!name || !email || !password || !confirmPassword) {
      setError('Please complete all required fields')
      setIsLoading(false)
      return
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: normalizedEmail,
          password,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok && data.verificationId) {
        setVerificationId(data.verificationId)
        setStep('otp')
        setOtpCode('')
        setError('')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationId || otpCode.length !== 6) {
      setError('Please enter the 6-digit code from your email.')
      return
    }
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          code: otpCode,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.message || 'Invalid or expired code. Please request a new one.')
        setIsLoading(false)
        return
      }

      const mfaToken = data.mfaToken
      if (!mfaToken) {
        setError('Invalid response. Please try again.')
        setIsLoading(false)
        return
      }

      const signInResult = await signIn('credentials', {
        mfaToken,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/')
        router.refresh()
        return
      }
      setError('Account created, but we could not sign you in. Please try logging in.')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@')
    if (!domain) return email
    const visible = local.length <= 2 ? local : local.slice(0, 2) + '***'
    return `${visible}@${domain}`
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-emerald/5 to-bronze/10"></div>
        <div className="absolute top-0 left-0 w-full h-full afro-pattern-stars"></div>
      </div>

      <nav className="relative z-10 p-4">
        <Link href="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Store</span>
        </Link>
      </nav>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald to-bronze"></div>

            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  {step === 'form' ? (
                    <Crown className="h-12 w-12 text-primary" />
                  ) : (
                    <ShieldCheck className="h-12 w-12 text-primary" />
                  )}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </motion.div>
                </div>
              </motion.div>

              <CardTitle className="text-2xl luxury-heading">
                {step === 'form' ? (
                  <>Join <span className="afro-text-gradient">Tac Accessories</span></>
                ) : (
                  <>Verify your email</>
                )}
              </CardTitle>
              <CardDescription className="luxury-text">
                {step === 'form'
                  ? 'Create your account to shop and manage your orders'
                  : `We sent a 6-digit code to ${formData.email ? maskEmail(formData.email.trim()) : 'your email'}. Enter it below.`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {step === 'form' ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleFormSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
                          placeholder="you@tacaccessories.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="pl-10 pr-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
                          placeholder="Create a secure password"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Must be at least 8 characters and include a mix of letters and numbers.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="pl-10 pr-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
                          placeholder="Re-enter your password"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {!passwordsMatch && formData.confirmPassword && (
                        <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-emerald hover:from-primary/90 hover:to-emerald/90 shadow-xl hover:shadow-2xl"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending code...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="otp"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleOtpSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium mb-2">
                        Verification code
                      </label>
                      <Input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="h-12 text-center text-lg tracking-[0.5em] font-mono bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Code expires in 15 minutes.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-emerald hover:from-primary/90 hover:to-emerald/90 shadow-xl hover:shadow-2xl"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        'Verify & Create Account'
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => { setStep('form'); setVerificationId(null); setError(''); setOtpCode(''); }}
                      className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Use a different email
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {step === 'form' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
