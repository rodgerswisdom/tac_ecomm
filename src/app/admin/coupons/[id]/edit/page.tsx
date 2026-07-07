import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCoupons, updateCouponAction, deleteCouponAction } from "@/server/admin/coupons"
import { notFound } from "next/navigation"
import { CouponEditForms } from "./CouponEditForms"

export default async function EditCouponPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const coupons = await getCoupons()
  const coupon = coupons.find((c) => c.id === id)
  if (!coupon) return notFound()

  async function updateCoupon(formData: FormData) {
    "use server"
    await updateCouponAction(coupon!.id, formData)
  }

  async function deleteCoupon(_formData: FormData) {
    "use server"
    await deleteCouponAction(coupon!.id)
  }

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Discount Code</CardTitle>
      </CardHeader>
      <CardContent>
        <CouponEditForms coupon={coupon} updateAction={updateCoupon} deleteAction={deleteCoupon} />
      </CardContent>
    </Card>
  )
}
