import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createCouponAction } from "@/server/admin/coupons"
import { CouponType } from "@prisma/client"
import { redirect } from "next/navigation"

export default function NewCouponPage() {
  async function createCoupon(formData: FormData) {
    "use server"
    await createCouponAction(formData)
    redirect("/admin/coupons")
  }

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create Discount Code</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createCoupon} className="space-y-4">
          <Input name="code" placeholder="Code" required maxLength={32} />
          <Input name="description" placeholder="Description" />
          <select name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value={CouponType.PERCENTAGE}>Percentage</option>
            <option value={CouponType.FIXED_AMOUNT}>Fixed Amount</option>
            <option value={CouponType.FREE_SHIPPING}>Free Shipping</option>
          </select>
          <Input name="value" placeholder="Value" type="number" step="0.01" required />
          <Input name="minAmount" placeholder="Minimum Order Amount" type="number" step="0.01" />
          <Input name="maxUses" placeholder="Max Uses" type="number" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isActive" value="true" defaultChecked /> Active
          </label>
          <Input name="startsAt" placeholder="Start Date" type="date" />
          <Input name="expiresAt" placeholder="End Date" type="date" />
          <Button type="submit" className="w-full">Create Coupon</Button>
        </form>
      </CardContent>
    </Card>
  )
}
