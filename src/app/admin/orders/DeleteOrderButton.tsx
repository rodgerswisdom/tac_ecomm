'use client'

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface DeleteOrderButtonProps {
  orderId: string
  orderNumber: string
  disabled?: boolean
  deleteOrder: (formData: FormData) => Promise<void>
}

export function DeleteOrderButton({ orderId, orderNumber, disabled = false, deleteOrder }: DeleteOrderButtonProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (isPending) return
    setError(null)
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("orderId", orderId)
        await deleteOrder(formData)
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to delete order")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (!isPending ? setOpen(next) : null)}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 border border-border"
          aria-label="Delete order"
          disabled={disabled || isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete order?</DialogTitle>
          <DialogDescription>
            Order <span className="font-semibold text-brand-umber">{orderNumber}</span> and all of its items, payments, and
            history will be permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
