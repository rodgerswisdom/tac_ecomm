"use client"

import type { FormHTMLAttributes, ReactNode } from "react"
import { useAdminFormAction } from "@/hooks/use-admin-form-action"

type AdminActionFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: (formData: FormData) => Promise<void>
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  children: ReactNode
}

export function AdminActionForm({
  action,
  successMessage,
  errorMessage,
  onSuccess,
  children,
  ...props
}: AdminActionFormProps) {
  const { handleAction } = useAdminFormAction(action, {
    success: successMessage,
    error: errorMessage,
    onSuccess,
  })

  return (
    <form {...props} action={handleAction}>
      {children}
    </form>
  )
}
