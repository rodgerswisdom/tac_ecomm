'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { initializeFraudDetection } from '@/lib/fraud'

export function FraudDetectionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // FIX: Polyfill 'tagName' on document and window to prevent brittle @keverdjs/fraud-sdk from crashing
    // on focus events that land on non-element targets (e.g., when t.tagName.toLowerCase() is called).
    if (typeof document !== 'undefined' && !(document as any).tagName) {
      Object.defineProperty(document, 'tagName', { value: 'DOCUMENT', configurable: true });
    }
    if (typeof window !== 'undefined' && !(window as any).tagName) {
      Object.defineProperty(window, 'tagName', { value: 'WINDOW', configurable: true });
    }

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