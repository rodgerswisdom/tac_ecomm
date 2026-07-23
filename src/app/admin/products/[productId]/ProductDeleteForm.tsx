"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { buildProductDeleteDescription } from "@/lib/admin/product-delete"
import { adminToast } from "@/lib/admin/feedback"
import type { ActionResult } from "@/lib/admin/action-result"
import {
  archiveProductAction,
  deleteProductAction,
} from "@/server/admin/product-actions"

type ProductDeleteFormProps = {
  productId: string
  productName: string
  orderCount: number
  orderNumbers: string[]
}

export function ProductDeleteForm({
  productId,
  productName,
  orderCount,
  orderNumbers,
}: ProductDeleteFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const description = buildProductDeleteDescription({
    productName,
    orderCount,
    orderNumbers,
  })

  const runAction = (
    action: (formData: FormData) => Promise<ActionResult>,
    successMessage: string,
    redirectToList = false,
  ) => {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("productId", productId)
      const result = await action(formData)
      if (result.error) {
        setError(result.error)
        adminToast.error(result.error)
        return
      }
      adminToast.success(successMessage)
      setOpen(false)
      if (redirectToList) {
        router.push("/admin/products")
      } else {
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (!isPending ? setOpen(next) : null)}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {orderCount > 0 ? `Delete ${productName}?` : `Permanently delete ${productName}?`}
          </DialogTitle>
          <DialogDescription className="whitespace-pre-wrap">{description}</DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          {orderCount > 0 ? (
            <Button
              type="button"
              onClick={() => runAction(archiveProductAction, "Product archived.")}
              disabled={isPending}
            >
              {isPending ? "Working..." : "Archive instead"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="destructive"
            onClick={() => runAction(deleteProductAction, "Product deleted.", true)}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : orderCount > 0 ? "Delete anyway" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
