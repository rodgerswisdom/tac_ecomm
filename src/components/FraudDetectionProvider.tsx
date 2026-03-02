'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { initializeFraudDetection } from '@/lib/fraud'

export function FraudDetectionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (status === 'loading') return
    if (hasInitialized.current) return

    const userId =
      session?.user?.id ||
      session?.user?.email ||
      undefined

    function initFraud() {
      if (hasInitialized.current) return
      hasInitialized.current = true
      try {
        initializeFraudDetection(userId)
      } catch (err) {
        console.error('Fraud SDK crashed during init:', err)
      }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // DOM is already ready
      initFraud()
    } else {
      // Wait for DOMContentLoaded
      const handler = () => {
        initFraud()
        document.removeEventListener('DOMContentLoaded', handler)
      }
      document.addEventListener('DOMContentLoaded', handler)
    }
  }, [status, session])

  return <>{children}</>
}