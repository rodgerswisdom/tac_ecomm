'use client'

import { useState } from 'react'
import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Crown, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

type Step = 'password' | 'otp'

function SignInForm() {
  const [step, setStep] = useState<Step>('password')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const requestOtp = async () => {
    const normalizedEmail = formData.email.trim().toLowerCase()
    if (!normalizedEmail || !formData.password) {
      setError('Please enter both email and password')
      return
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(normalizedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    const res = await fetch('/api/auth/mfa/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password: formData.password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      if (res.status === 401) setError('Invalid email or password. Please check your credentials and try again.')
      else if (res.status === 429) setError('Too many attempts. Please try again in 15 minutes.')
      else setError(data?.message || 'Failed to send code. Please try again.')
      return false
    }
    if (data.mfaToken) {
      setError('')
      const result = await signIn('credentials', { mfaToken: data.mfaToken, redirect: false })
      if (result?.ok) {
        window.location.href = callbackUrl
        return true
      }
      setError('Sign-in failed. Please try again.')
      return false
    }
    if (data.challengeId) {
      setChallengeId(data.challengeId)
      setStep('otp')
      setOtpCode('')
      setError('')
      return true
    }
    setError('Invalid response. Please try again.')
    return false
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await requestOtp()
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!challengeId || otpCode.length !== 6) {
      setError('Please enter the 6-digit code from your email.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code: otpCode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.message || 'Invalid or expired code. Try again or request a new code.')
        setIsLoading(false)
        return
      }
      const mfaToken = data.mfaToken
      if (!mfaToken) {
        setError('Invalid response. Please try again.')
        setIsLoading(false)
        return
      }
      const result = await signIn('credentials', {
        mfaToken,
        redirect: false,
      })
      if (result?.error) {
        setError('Session expired. Please sign in again from the start.')
      } else if (result?.ok) {
        window.location.href = callbackUrl
        return
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } catch (err) {
      console.error('Verify error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setIsLoading(true)
    try {
      await requestOtp()
      if (step === 'otp') setError('') // clear any previous error on success
    } catch {
      setError('Failed to resend code.')
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
          <Card className="afro-card bg-background/80 backdrop-blur-sm border-border/50 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  {step === 'password' ? (
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
                {step === 'password' ? (
                  <>Welcome <span className="afro-text-gradient">Back</span></>
                ) : (
                  <>Check your email</>
                )}
              </CardTitle>
              <CardDescription className="luxury-text">
                {step === 'password'
                  ? 'Sign in to your Tac Accessories account'
                  : `We sent a 6-digit code to ${formData.email ? maskEmail(formData.email.trim()) : 'your email'}. Enter it below.`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {step === 'password' ? (
                  <motion.form
                    key="password"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handlePasswordSubmit}
                    className="space-y-4"
                  >
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
                          className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                          placeholder="admin@tacaccessory.com"
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
                          className="pl-10 pr-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex justify-end mt-1">
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-emerald hover:from-primary/90 hover:to-emerald/90 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending code...
                        </>
                      ) : (
                        'Continue'
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
                        className="h-12 text-center text-lg tracking-[0.5em] font-mono bg-background/50 backdrop-blur-sm border-border/50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Code expires in 15 minutes.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-emerald hover:from-primary/90 hover:to-emerald/90 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        'Sign in'
                      )}
                    </Button>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                      >
                        Resend code
                      </button>
                      <button
                        type="button"
                        onClick={() => { setStep('password'); setChallengeId(null); setError(''); setOtpCode(''); }}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Use a different account
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {step === 'password' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Sign up
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

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
