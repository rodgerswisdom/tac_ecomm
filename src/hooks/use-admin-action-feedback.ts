"use client"

import { useEffect, useRef } from "react"
import { adminToast } from "@/lib/admin/feedback"

type FeedbackState = {
  success?: boolean
  error?: string
  message?: string
  status?: string
}

type UseAdminActionFeedbackOptions = {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: () => void
}

function resolveSuccessMessage(state: FeedbackState, fallback?: string) {
  if (state.message && state.status !== "error") return state.message
  return fallback ?? "Saved successfully."
}

function resolveErrorMessage(state: FeedbackState, fallback?: string) {
  if (state.error) return state.error
  if (state.status === "error" && state.message) return state.message
  return fallback ?? "Something went wrong. Please try again."
}

export function useAdminActionFeedback(
  state: FeedbackState,
  options: UseAdminActionFeedbackOptions = {}
) {
  const initialRender = useRef(true)
  const lastKey = useRef<string | null>(null)

  const { successMessage, errorMessage, onSuccess, onError } = options

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    const isSuccess =
      state.success === true || state.status === "success" || state.status === "saved"
    const isError = Boolean(state.error) || state.status === "error"

    if (!isSuccess && !isError) return

    const key = JSON.stringify({ isSuccess, isError, message: state.message, error: state.error })
    if (lastKey.current === key) return
    lastKey.current = key

    if (isSuccess) {
      adminToast.success(resolveSuccessMessage(state, successMessage))
      onSuccess?.()
      return
    }

    adminToast.error(resolveErrorMessage(state, errorMessage))
    onError?.()
  }, [state, successMessage, errorMessage, onSuccess, onError])
}
