"use client"

import { useRouter } from "next/navigation"
import { AdminActionForm } from "@/components/admin/AdminActionForm"
import { Button } from "@/components/ui/button"
import { deleteProductAction } from "@/server/admin/product-actions"

export function ProductDeleteForm({ productId }: { productId: string }) {
  const router = useRouter()

  return (
    <AdminActionForm
      action={deleteProductAction}
      successMessage="Product deleted."
      onSuccess={() => router.push("/admin/products")}
    >
      <input type="hidden" name="productId" value={productId} />
      <Button variant="destructive" size="sm">
        Delete product
      </Button>
    </AdminActionForm>
  )
}
