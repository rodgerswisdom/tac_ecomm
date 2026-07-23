"use client"

import { useCallback, useTransition } from "react"
import { adminToast } from "@/lib/admin/feedback"
import type { ActionResult } from "@/server/admin/users"

type AdminFormActionMessages = {
  success?: string
  error?: string
  onSuccess?: () => void
}

type AdminFormAction = (formData: FormData) => Promise<void | ActionResult>

export function useAdminFormAction(
  action: AdminFormAction,
  messages: AdminFormActionMessages = {}
) {
  const [isPending, startTransition] = useTransition()

  const handleAction = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        try {
          const result = await action(formData)
          if (result?.error) {
            adminToast.error(result.error)
            return
          }
          adminToast.success(result?.message ?? messages.success ?? "Saved successfully.")
          messages.onSuccess?.()
        } catch (error) {
          adminToast.error(messages.error ?? "Something went wrong. Please try again.")
          console.error(error)
        }
      })
    },
    [action, messages.error, messages.onSuccess, messages.success]
  )

  return { handleAction, isPending }
}
