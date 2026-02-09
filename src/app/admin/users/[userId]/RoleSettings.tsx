"use client"

import { useState } from "react"
import { UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { useFormStatus } from "react-dom"

type Props = {
  userId: string
  currentRole: UserRole
  action: (formData: FormData) => Promise<void>
}

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={disabled || pending}>
      {pending ? "Saving..." : "Save role"}
    </Button>
  )
}

export function RoleSettings({ userId, currentRole, action }: Props) {
  const [role, setRole] = useState<UserRole>(currentRole)
  const dirty = role !== currentRole

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-foreground" htmlFor="role-select">
          Role
        </label>
        <select
          id="role-select"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {Object.values(UserRole).map((r) => (
            <option key={r} value={r} className="capitalize">
              {r.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <SaveButton disabled={!dirty} />
      </div>
      <p className="text-xs text-muted-foreground">Changing role affects permissions immediately.</p>
    </form>
  )
}
