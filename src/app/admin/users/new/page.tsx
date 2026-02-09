import { createUserAction } from "@/server/admin/users"
import { NewUserModal } from "./NewUserModal"

export default function NewUserPage() {
  return (
    <NewUserModal action={createUserAction} />
  )
}
