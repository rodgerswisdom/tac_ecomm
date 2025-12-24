// Keverd fraud detection integration

import { Keverd } from '@keverdjs/fraud-sdk'

export interface FraudCheckResult {
  risk_score: number
  score: number
  action: 'allow' | 'soft_challenge' | 'hard_challenge' | 'block'
  reason: string[]
  session_id: string
  requestId: string
  sim_swap_engine?: {
    userId?: string
    risk: number
    flags: {
      sim_changed?: boolean
      device_changed?: boolean
      behavior_anomaly?: boolean
      time_anomaly?: boolean
      velocity_anomaly?: boolean
    }
    updatedProfile?: Record<string, unknown>
  }
}

let isInitialized = false

/**
 * Initialize the Keverd fraud detection SDK
 * Should be called once when the app loads (client-side)
 */
export function initializeFraudDetection(userId?: string): void {
  if (typeof window === 'undefined') {
    // Server-side, skip initialization
    return
  }

  if (isInitialized) {
    return
  }

  const apiKey = process.env.NEXT_PUBLIC_KEVERD_API_KEY

  if (!apiKey) {
    console.warn('Keverd API key not found. Fraud detection will be disabled.')
    return
  }

  try {
    Keverd.init({
      apiKey,
      endpoint: process.env.NEXT_PUBLIC_KEVERD_ENDPOINT || 'https://app.keverd.com',
      userId,
      debug: process.env.NODE_ENV === 'development',
    })
    isInitialized = true
  } catch (error) {
    console.error('Failed to initialize Keverd fraud detection:', error)
  }
}

/**
 * Get visitor data and risk assessment
 * This should be called before processing sensitive operations like checkout
 */
export async function checkFraudRisk(): Promise<FraudCheckResult | null> {
  if (typeof window === 'undefined') {
    // Server-side, return null (fraud detection runs client-side)
    return null
  }

  if (!isInitialized) {
    // Try to initialize if not already done
    initializeFraudDetection()
  }

  try {
    const result = await Keverd.getVisitorData()
    return result as FraudCheckResult
  } catch (error) {
    console.error('Fraud detection check failed:', error)
    // In case of error, allow the transaction but log it
    return null
  }
}

/**
 * Create a transaction ID for tracking
 * Legacy method for backward compatibility
 */
export async function createTransactionId(metadata?: {
  amount?: number
  currency?: string
  recipient?: string
}): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null
  }

  if (!isInitialized) {
    initializeFraudDetection()
  }

  try {
    const transactionId = await Keverd.createTransactionID(metadata)
    return transactionId
  } catch (error) {
    console.error('Failed to create transaction ID:', error)
    return null
  }
}

/**
 * Clean up the SDK instance
 */
export function destroyFraudDetection(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    Keverd.destroy()
    isInitialized = false
  } catch (error) {
    console.error('Failed to destroy fraud detection:', error)
  }
}

/**
 * Determine if a transaction should proceed based on fraud risk
 */
export function shouldAllowTransaction(result: FraudCheckResult | null): {
  allowed: boolean
  requiresChallenge: boolean
  message?: string
} {
  if (!result) {
    // If fraud check failed, allow but log
    return { allowed: true, requiresChallenge: false }
  }

  switch (result.action) {
    case 'allow':
      return { allowed: true, requiresChallenge: false }
    
    case 'soft_challenge':
      return {
        allowed: true,
        requiresChallenge: true,
        message: 'Please verify your identity to continue. This helps us protect your account.'
      }
    
    case 'hard_challenge':
      return {
        allowed: true,
        requiresChallenge: true,
        message: 'Additional verification required. Please complete the security check to proceed.'
      }
    
    case 'block':
      return {
        allowed: false,
        requiresChallenge: false,
        message: 'This transaction cannot be completed due to security concerns. Please contact support if you believe this is an error.'
      }
    
    default:
      // Unknown action, allow but log
      return { allowed: true, requiresChallenge: false }
  }
}

