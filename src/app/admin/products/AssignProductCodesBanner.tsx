"use client"

import { useState, useTransition } from "react"
import { Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { assignProductCodesAction } from "@/server/admin/product-actions"
import { adminToast } from "@/lib/admin/feedback"

/** One-off prompt to move products from old name-based SKUs to category codes (EAR-0042). */
export function AssignProductCodesBanner({ count }: { count: number }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function run() {
    startTransition(async () => {
      const result = await assignProductCodesAction()
      if (result.error) adminToast.error(result.error)
      else adminToast.success(result.message ?? "Product codes assigned.")
      setConfirming(false)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
      <Tag className="h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">
          {count} {count === 1 ? "product still has" : "products still have"} an old-style SKU
        </p>
        <p className="text-amber-900/80">
          Give them short product codes by category (e.g. EAR-0042) so orders are easy to pick and pack. Past orders keep
          the code they were placed with.
        </p>
      </div>
      {confirming ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={run} disabled={pending}>
            {pending ? "Assigning…" : `Yes, assign ${count} codes`}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="bg-white" onClick={() => setConfirming(true)}>
          Assign product codes
        </Button>
      )}
    </div>
  )
}
