"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const roleOptions = Object.values(UserRole)

type ActionResult = { success?: boolean; error?: string }

const initialState: ActionResult = { success: false, error: undefined }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="bg-[#4a2b28] text-[#f2dcb8] hover:bg-[#3d221f]" disabled={pending}>
      {pending ? "Creating..." : "Create user"}
    </Button>
  )
}

export function CreateUserForm({
  action,
}: {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>
}) {
  const [state, formAction] = useActionState(action, initialState)

  return (
    <form
      action={formAction}
      className="mx-auto w-full max-w-xl space-y-8"
    >
  {state.error ? (
    <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
      {state.error}
    </div>
  ) : null}

  {state.success ? (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      User created.
    </div>
  ) : null}

  {/* Account details */}
  <section className="space-y-5">
    <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">
      Account details
    </h2>

    <div className="space-y-2">
      <label
        htmlFor="user-name"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
      >
        Full name
      </label>
      <Input
        id="user-name"
        name="name"
        placeholder="Jane Doe"
        required
      />
    </div>

    <div className="space-y-2">
      <label
        htmlFor="user-email"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
      >
        Email address
      </label>
      <Input
        id="user-email"
        name="email"
        type="email"
        placeholder="jane@example.com"
        required
      />
    </div>
  </section>

  {/* Access level */}
  <section className="space-y-4">
    <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">
      Access level
    </h2>

    <div className="space-y-2">
      <label
        htmlFor="user-role"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
      >
        Role
      </label>

      <select
        id="user-role"
        name="role"
        defaultValue={UserRole.CUSTOMER}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {roleOptions.map((role) => (
          <option key={role} value={role} className="capitalize">
            {role.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <p className="text-xs text-muted-foreground">
        Admin users can access the dashboard and manage data.
      </p>
    </div>
  </section>

  {/* Actions */}
  <div className="flex items-center justify-end gap-3 pt-4">
    <Button asChild variant="ghost">
      <Link href="/admin/users">Discard</Link>
    </Button>
    <SubmitButton />
  </div>
</form>
  )
}
