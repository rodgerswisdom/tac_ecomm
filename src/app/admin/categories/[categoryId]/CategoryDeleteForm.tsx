"use client"

import { useRouter } from "next/navigation"
import { AdminActionForm } from "@/components/admin/AdminActionForm"
import { Button } from "@/components/ui/button"
import { deleteCategoryAction } from "@/server/admin/categories"

export function CategoryDeleteForm({ categoryId }: { categoryId: string }) {
  const router = useRouter()

  return (
    <AdminActionForm
      action={deleteCategoryAction}
      successMessage="Category deleted."
      onSuccess={() => router.push("/admin/categories")}
    >
      <input type="hidden" name="categoryId" value={categoryId} />
      <Button type="submit" variant="destructive" size="sm">
        Delete category
      </Button>
    </AdminActionForm>
  )
}
