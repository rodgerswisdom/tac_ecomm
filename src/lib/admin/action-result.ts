export type ActionResult = {
  success?: boolean
  error?: string
  message?: string
}

export function adminActionError(message: string): ActionResult {
  return { error: message }
}

export function adminActionSuccess(message?: string): ActionResult {
  return message ? { success: true, message } : { success: true }
}

export async function runAdminAction(
  fn: () => Promise<ActionResult | void>,
  fallbackError = "Something went wrong. Please try again.",
): Promise<ActionResult> {
  try {
    const result = await fn()
    if (result?.error) {
      return result
    }
    return result ?? adminActionSuccess()
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return adminActionError("Unauthorized")
    }
    console.error(error)
    return adminActionError(fallbackError)
  }
}
