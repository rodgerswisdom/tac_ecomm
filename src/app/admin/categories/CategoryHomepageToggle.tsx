"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import type { ActionResult } from "@/server/admin/users"
import { toggleCategoryHomepageAction } from "@/server/admin/categories"
import { useAdminActionFeedback } from "@/hooks/use-admin-action-feedback"

const initialState: ActionResult = { success: false, error: undefined }

function ToggleButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      size="sm"
      variant={enabled ? "default" : "outline"}
      disabled={pending}
      className="h-7 min-w-[3.25rem] px-2 text-xs"
    >
      {pending ? "..." : enabled ? "On" : "Off"}
    </Button>
  )
}

export function CategoryHomepageToggle({
  categoryId,
  enabled,
}: {
  categoryId: string
  enabled: boolean
}) {
  const [state, formAction] = useActionState(toggleCategoryHomepageAction, initialState)
  useAdminActionFeedback(state, { successMessage: "Homepage visibility updated." })

  return (
    <form action={formAction}>
      <input type="hidden" name="categoryId" value={categoryId} />
      <ToggleButton enabled={enabled} />
    </form>
  )
}
