'use client'

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { BespokeRequestStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateBespokeStatusAction, type UpdateBespokeStatusFormState } from "@/server/admin/bespoke"

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
      {state.status === "error" ? (
        <p className="text-sm font-medium text-rose-600">{state.message ?? "Unable to update"}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm font-medium text-emerald-600">{state.message ?? "Updated"}</p>
      ) : null}
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
