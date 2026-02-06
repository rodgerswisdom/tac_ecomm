"use client"

import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateUserForm } from "./CreateUserForm"

type ActionResult = { success?: boolean; error?: string }

export function NewUserModal({
  action,
}: {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>
}) {
  const router = useRouter()

  return (
    <Dialog open onOpenChange={(open) => { if (!open) router.push("/admin/users") }}>
      <DialogContent className="max-w-2xl bg-white text-foreground">
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
          <DialogDescription>Create a customer or admin account for tailored access.</DialogDescription>
        </DialogHeader>
        <CreateUserForm action={action} />
      </DialogContent>
    </Dialog>
  )
}
