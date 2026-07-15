"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.button !== 0
}

function shouldHandleLink(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href")
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false
  }
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false
  }

  try {
    const url = new URL(href, window.location.href)
    if (url.origin !== window.location.origin) {
      return false
    }
    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return false
    }
  } catch {
    return false
  }

  return true
}

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNavigatingRef = useRef(false)
  const isFirstRenderRef = useRef(true)

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current)
      completeTimerRef.current = null
    }
  }, [])

  const startNavigation = useCallback(() => {
    if (isNavigatingRef.current) return

    clearTimers()
    isNavigatingRef.current = true

    queueMicrotask(() => {
      setProgress((value) => (value > 0 ? value : 18))

      intervalRef.current = setInterval(() => {
        setProgress((value) => {
          if (value >= 90) return value
          const step = value < 50 ? 8 : value < 75 ? 4 : 2
          return Math.min(value + step, 90)
        })
      }, 180)
    })
  }, [clearTimers])

  const completeNavigation = useCallback(() => {
    clearTimers()
    isNavigatingRef.current = false
    setProgress(100)

    completeTimerRef.current = setTimeout(() => {
      setProgress(0)
    }, 280)
  }, [clearTimers])

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    completeNavigation()
  }, [pathname, searchParams, completeNavigation])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return

      const anchor = (event.target as Element | null)?.closest("a")
      if (anchor && shouldHandleLink(anchor)) {
        startNavigation()
        return
      }

      const submitter = (event.target as Element | null)?.closest(
        "button[type='submit'], input[type='submit']",
      )
      const form = submitter?.closest("form")
      if (form && (form.method || "get").toLowerCase() === "get") {
        startNavigation()
      }
    }

    const handlePopState = () => {
      startNavigation()
    }

    const originalPushState = history.pushState.bind(history)
    const originalReplaceState = history.replaceState.bind(history)

    history.pushState = (...args) => {
      startNavigation()
      return originalPushState(...args)
    }

    history.replaceState = (...args) => {
      startNavigation()
      return originalReplaceState(...args)
    }

    document.addEventListener("click", handleDocumentClick, true)
    window.addEventListener("popstate", handlePopState)

    return () => {
      document.removeEventListener("click", handleDocumentClick, true)
      window.removeEventListener("popstate", handlePopState)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
      clearTimers()
    }
  }, [clearTimers, startNavigation])

  if (progress === 0) {
    return null
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[10000]"
    >
      <div className="h-[3px] w-full bg-brand-teal/15">
        <div
          className="h-full bg-brand-teal shadow-[0_0_12px_rgba(74,146,134,0.45)] transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
