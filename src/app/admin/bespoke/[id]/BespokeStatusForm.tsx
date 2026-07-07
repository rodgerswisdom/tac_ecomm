'use client'

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { BespokeRequestStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateBespokeStatusAction, type UpdateBespokeStatusFormState } from "@/server/admin/bespoke"
import { useAdminActionFeedback } from "@/hooks/use-admin-action-feedback"

const initialState: UpdateBespokeStatusFormState = { status: "idle" }

const statusOptions = Object.values(BespokeRequestStatus)

interface BespokeStatusFormProps {
  requestId: string
  defaultStatus: BespokeRequestStatus
  defaultAdminNotes?: string | null
}

export function BespokeStatusForm({
  requestId,
  defaultStatus,
  defaultAdminNotes,
}: BespokeStatusFormProps) {
  const [state, formAction] = useActionState(updateBespokeStatusAction, initialState)
  useAdminActionFeedback(state, { successMessage: "Bespoke request updated." })

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={requestId} />
      <label className="text-xs font-medium text-muted-foreground" htmlFor="bespoke-status">
        Status
      </label>
      <select
        id="bespoke-status"
        name="status"
        defaultValue={defaultStatus}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, " ").toLowerCase()}
          </option>
        ))}
      </select>
      <label className="text-xs font-medium text-muted-foreground" htmlFor="bespoke-admin-notes">
        Admin notes
      </label>
      <Textarea
        id="bespoke-admin-notes"
        name="adminNotes"
        placeholder="Internal notes about this request"
        defaultValue={defaultAdminNotes ?? ""}
        className="min-h-[80px]"
      />
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving..." : "Save update"}
    </Button>
  )
}
