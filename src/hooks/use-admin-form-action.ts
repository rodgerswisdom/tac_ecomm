"use client"

import { useCallback, useTransition } from "react"
import { adminToast } from "@/lib/admin/feedback"

type AdminFormActionMessages = {
  success?: string
  error?: string
  onSuccess?: () => void
}

export function useAdminFormAction(
  action: (formData: FormData) => Promise<void>,
  messages: AdminFormActionMessages = {}
) {
  const [isPending, startTransition] = useTransition()

  const handleAction = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        try {
          await action(formData)
          adminToast.success(messages.success ?? "Saved successfully.")
          messages.onSuccess?.()
        } catch (error) {
          adminToast.error(
            error instanceof Error ? error.message : messages.error ?? "Something went wrong."
          )
        }
      })
    },
    [action, messages.error, messages.onSuccess, messages.success]
  )

  return { handleAction, isPending }
}
