import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCoupons, updateCouponAction, deleteCouponAction } from "@/server/admin/coupons"
import { toIso } from "@/lib/serialize"
import { notFound } from "next/navigation"
import { CouponEditForms } from "./CouponEditForms"

export default async function EditCouponPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const coupons = await getCoupons()
  const coupon = coupons.find((c) => c.id === id)
  if (!coupon) return notFound()

  const serializedCoupon = {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    minAmount: coupon.minAmount,
    maxUses: coupon.maxUses,
    isActive: coupon.isActive,
    startsAt: toIso(coupon.startsAt),
    expiresAt: toIso(coupon.expiresAt),
  }

  async function updateCoupon(formData: FormData) {
    "use server"
    return updateCouponAction(coupon!.id, formData)
  }

  async function deleteCoupon(_formData: FormData) {
    "use server"
    return deleteCouponAction(coupon!.id)
  }

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Discount Code</CardTitle>
      </CardHeader>
      <CardContent>
        <CouponEditForms coupon={serializedCoupon} updateAction={updateCoupon} deleteAction={deleteCoupon} />
      </CardContent>
    </Card>
  )
}
