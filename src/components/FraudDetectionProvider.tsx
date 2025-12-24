'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { initializeFraudDetection } from '@/lib/fraud'

/**
 * Client component that initializes fraud detection on app load
 * This ensures device fingerprinting starts early for better accuracy
 */
export function FraudDetectionProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    // Initialize fraud detection with user ID if available
    const userId = session?.user?.id || session?.user?.email || undefined
    initializeFraudDetection(userId)
  }, [session])

  return <>{children}</>
}

