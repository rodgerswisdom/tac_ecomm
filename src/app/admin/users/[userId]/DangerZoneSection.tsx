"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type Props = {
  userId: string
  action: (formData: FormData) => Promise<void>
}

export function DangerZoneSection({ userId, action }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Destructive actions</p>
          <p className="text-xs text-muted-foreground">Actions here are irreversible.</p>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            setExpanded((prev) => !prev)
            setConfirming(false)
          }}
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>

      {expanded ? (
        <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Deleting a user also removes their sessions. Orders stay linked but the account cannot sign in.
          </p>
          {confirming ? (
            <form action={action} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={userId} />
              <Button type="submit" variant="destructive" size="sm">
                Confirm delete
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="destructive" size="sm" onClick={() => setConfirming(true)}>
                Delete user
              </Button>
              <span className="text-xs text-muted-foreground">First click reveals confirmation.</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
