"use client"

import { useRouter } from "next/navigation"
import { AdminActionForm } from "@/components/admin/AdminActionForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CouponType } from "@prisma/client"
import type { ActionResult } from "@/lib/admin/action-result"

type CouponEditFormsProps = {
  coupon: {
    id: string
    code: string
    description: string | null
    type: CouponType
    value: number
    minAmount: number | null
    maxUses: number | null
    isActive: boolean
    startsAt: string | null
    expiresAt: string | null
  }
  updateAction: (formData: FormData) => Promise<ActionResult>
  deleteAction: (formData: FormData) => Promise<ActionResult>
}

export function CouponEditForms({ coupon, updateAction, deleteAction }: CouponEditFormsProps) {
  const router = useRouter()

  return (
    <>
      <AdminActionForm
        action={updateAction}
        successMessage="Coupon updated."
        onSuccess={() => router.push("/admin/coupons")}
        className="space-y-4"
      >
        <Input name="code" defaultValue={coupon.code} required maxLength={32} />
        <Input name="description" defaultValue={coupon.description ?? ""} />
        <select
          name="type"
          defaultValue={coupon.type}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value={CouponType.PERCENTAGE}>Percentage</option>
          <option value={CouponType.FIXED_AMOUNT}>Fixed Amount</option>
          <option value={CouponType.FREE_SHIPPING}>Free Shipping</option>
        </select>
        <Input name="value" type="number" step="0.01" defaultValue={coupon.value} required />
        <Input name="minAmount" type="number" step="0.01" defaultValue={coupon.minAmount ?? ""} />
        <Input name="maxUses" type="number" defaultValue={coupon.maxUses ?? ""} />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" value="true" defaultChecked={coupon.isActive} /> Active
        </label>
        <Input
          name="startsAt"
          type="date"
          defaultValue={coupon.startsAt ? coupon.startsAt.slice(0, 10) : ""}
        />
        <Input
          name="expiresAt"
          type="date"
          defaultValue={coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : ""}
        />
        <Button type="submit" className="w-full">
          Update Coupon
        </Button>
      </AdminActionForm>
      <AdminActionForm
        action={deleteAction}
        successMessage="Coupon deleted."
        onSuccess={() => router.push("/admin/coupons")}
        className="mt-4"
      >
        <Button type="submit" variant="destructive" className="w-full">
          Delete Coupon
        </Button>
      </AdminActionForm>
    </>
  )
}
