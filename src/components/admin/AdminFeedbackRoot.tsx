"use client"

import { Suspense, useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Toaster } from "sonner"
import {
  ADMIN_MESSAGE_PARAM,
  ADMIN_NOTICE_PARAM,
  ADMIN_TOASTER_ID,
  adminToast,
} from "@/lib/admin/feedback"

function AdminFlashFromUrl() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const handledKey = useRef<string | null>(null)

  useEffect(() => {
    const notice = searchParams.get(ADMIN_NOTICE_PARAM)
    const message = searchParams.get(ADMIN_MESSAGE_PARAM)

    if (!notice || !message) return

    const key = `${pathname}?${notice}=${message}`
    if (handledKey.current === key) return
    handledKey.current = key

    if (notice === "success") {
      adminToast.success(message)
    } else if (notice === "error") {
      adminToast.error(message)
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete(ADMIN_NOTICE_PARAM)
    params.delete(ADMIN_MESSAGE_PARAM)
    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(next)
  }, [pathname, router, searchParams])

  return null
}

export function AdminFeedbackRoot() {
  return (
    <>
      <Toaster
        id={ADMIN_TOASTER_ID}
        position="top-right"
        richColors
        closeButton
        expand
      />
      <Suspense fallback={null}>
        <AdminFlashFromUrl />
      </Suspense>
    </>
  )
}
