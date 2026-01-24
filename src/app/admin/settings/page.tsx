import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"
import { getAdminSettingsData, toggleCouponAction, toggleProductFlagAction } from "@/server/admin/settings"
import { AdminPageHeader } from "@/components/admin/page-header"

export default async function SettingsPage() {
  const data = await getAdminSettingsData()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description="Control storefront highlights and incentives."
        breadcrumb={[
          { label: "Settings", href: "/admin/settings" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Storefront highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground">Featured products</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {data.featuredProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                    <span>{product.name}</span>
                    <form action={toggleProductFlagAction} className="flex items-center gap-2">
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="field" value="isFeatured" />
                      <input type="hidden" name="value" value="false" />
                      <Button size="sm" variant="ghost">
                        Remove
                      </Button>
                    </form>
                  </li>
                ))}
                {data.featuredProducts.length === 0 && <li className="text-muted-foreground">No featured products.</li>}
              </ul>
            </section>

            <section className="rounded-lg border border-dashed border-border p-4 text-sm">
              <h4 className="font-semibold">Assign product flag</h4>
              <form action={toggleProductFlagAction} className="mt-3 space-y-2">
                <Input name="productId" placeholder="Product ID" required />
                <select name="field" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="isFeatured">Featured</option>
                  <option value="isBespoke">Bespoke</option>
                  <option value="isCorporateGift">Corporate gift</option>
                  <option value="isActive">Active</option>
                </select>
                <select name="value" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="true">Enable</option>
                  <option value="false">Disable</option>
                </select>
                <Button type="submit" className="w-full">
                  Update product
                </Button>
              </form>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coupons & incentives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-sm">
              {data.coupons.map((coupon) => (
                <li key={coupon.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <p className="font-semibold">{coupon.code}</p>
                    <p className="text-xs text-muted-foreground">{coupon.description ?? 'No description'}</p>
                  </div>
                  <form action={toggleCouponAction} className="flex items-center gap-2">
                    <input type="hidden" name="couponId" value={coupon.id} />
                    <input type="hidden" name="isActive" value={(!coupon.isActive).toString()} />
                    <Button size="sm" variant={coupon.isActive ? 'outline' : 'default'}>
                      {coupon.isActive ? 'Disable' : 'Activate'}
                    </Button>
                  </form>
                </li>
              ))}
              {data.coupons.length === 0 && <li className="text-muted-foreground">No coupons configured.</li>}
            </ul>

            <section>
              <h4 className="text-sm font-semibold text-muted-foreground">Bespoke & corporate programs</h4>
              <div className="mt-2 grid gap-3 text-sm">
                {data.bespokeProducts.map((product) => (
                  <div key={product.id} className="rounded-md border border-border px-3 py-2">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Bespoke · {formatPrice(product.price)}</p>
                  </div>
                ))}
                {data.bespokeProducts.length === 0 && <p className="text-muted-foreground">No bespoke products.</p>}
                {data.corporateGiftProducts.map((product) => (
                  <div key={product.id} className="rounded-md border border-border px-3 py-2">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Corporate gifting · {formatPrice(product.price)}</p>
                  </div>
                ))}
                {data.corporateGiftProducts.length === 0 && (
                  <p className="text-muted-foreground">No corporate gift products.</p>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
