import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getCoupons, updateCouponAction, deleteCouponAction } from "@/server/admin/coupons"
import { CouponType } from "@prisma/client"
import { notFound, redirect } from "next/navigation"

export default async function EditCouponPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const coupons = await getCoupons();
  const coupon = coupons.find((c) => c.id === id);
  if (!coupon) return notFound();

  async function updateCoupon(formData: FormData) {
    "use server"
    if (!coupon) return notFound()
    await updateCouponAction(coupon.id, formData)
    redirect("/admin/coupons")
  }

  async function deleteCoupon() {
    "use server"
    if (!coupon) return notFound()
    await deleteCouponAction(coupon.id)
    redirect("/admin/coupons")
  }

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Discount Code</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateCoupon} className="space-y-4">
          <Input name="code" defaultValue={coupon.code} required maxLength={32} />
          <Input name="description" defaultValue={coupon.description ?? ""} />
          <select name="type" defaultValue={coupon.type} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
          <Input name="startsAt" type="date" defaultValue={coupon.startsAt ? coupon.startsAt.toISOString().slice(0,10) : ""} />
          <Input name="expiresAt" type="date" defaultValue={coupon.expiresAt ? coupon.expiresAt.toISOString().slice(0,10) : ""} />
          <Button type="submit" className="w-full">Update Coupon</Button>
        </form>
        <form action={deleteCoupon} className="mt-4">
          <Button type="submit" variant="destructive" className="w-full">Delete Coupon</Button>
        </form>
      </CardContent>
    </Card>
  )
}
