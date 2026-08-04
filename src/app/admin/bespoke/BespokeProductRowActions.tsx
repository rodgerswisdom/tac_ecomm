"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Store } from "lucide-react"
import { RowActions } from "@/components/admin/row-actions"
import { adminToast } from "@/lib/admin/feedback"
import { setProductBespokeAction } from "@/server/admin/product-actions"

interface BespokeProductRowActionsProps {
  productId: string
  productSlug: string
}

export function BespokeProductRowActions({
  productId,
  productSlug,
}: BespokeProductRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <RowActions
      editHref={`/admin/products/${productId}`}
      viewHref={`/products/${productSlug}`}
      viewLinkProps={{ target: "_blank" }}
      viewLabel="View storefront"
      items={[
        {
          label: "Move to collections",
          icon: <Store className="h-4 w-4" />,
          disabled: isPending,
          separatorBefore: true,
          onSelect: () => {
            startTransition(async () => {
              try {
                const formData = new FormData()
                formData.append("productId", productId)
                formData.append("isBespoke", "false")
                const result = await setProductBespokeAction(formData)
                if (result?.error) {
                  adminToast.error(result.error)
                  return
                }
                adminToast.success(result?.message ?? "Moved to regular collections.")
                router.refresh()
              } catch (error) {
                adminToast.error(error instanceof Error ? error.message : "Action failed")
              }
            })
          },
        },
      ]}
    />
  )
}
