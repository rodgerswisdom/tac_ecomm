import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrderDetail } from "@/server/admin/orders";
import { PrintButton } from "./PrintButton";
import { getStoreContactDetails } from "@/lib/store-contact";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatKes(amount: number) {
  return `KES ${Math.round(amount).toLocaleString()}`;
}

export default async function OrderInvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderDetail(orderId);
  if (!order) notFound();

  const settings = await (prisma as any).settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const storeName = (settings?.storeName as string | undefined) || "Tac Accessories";
  const { email: storeEmail, phone: storePhone } = getStoreContactDetails({
    salesEmail: settings?.salesEmail as string | undefined,
    supportEmail: settings?.supportEmail as string | undefined,
    whatsappNumber: settings?.whatsappNumber as string | undefined,
  });
  const storeAddress = (settings?.address as string | undefined) || "";

  const billToName =
    order.shippingAddress
      ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim()
      : order.user?.name || "Customer";

  const billToEmail = order.user?.email || "";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 bg-background p-4 sm:p-8 print:p-0">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight">{storeName}</h1>
          {storeAddress ? <p className="text-sm text-muted-foreground">{storeAddress}</p> : null}
          <div className="text-sm text-muted-foreground">
            {storeEmail ? <div>{storeEmail}</div> : null}
            {storePhone ? <div>{storePhone}</div> : null}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <PrintButton />
          <Link href={`/admin/orders/${order.id}`} className="text-sm text-muted-foreground underline underline-offset-4 print:hidden">
            Back to order
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 print:rounded-none print:border-0 print:p-0">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-6">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Invoice</p>
            <div className="space-y-1 text-sm">
              <div className="flex gap-2">
                <span className="w-28 text-muted-foreground">Invoice #</span>
                <span className="font-semibold">{order.orderNumber}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-28 text-muted-foreground">Date</span>
                <span className="font-semibold">{dateFormatter.format(new Date(order.createdAt))}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-28 text-muted-foreground">Currency</span>
                <span className="font-semibold">KES</span>
              </div>
            </div>
          </div>

          <div className="min-w-[260px] space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bill to</p>
            <div className="text-sm">
              <p className="font-semibold">{billToName}</p>
              {billToEmail ? <p className="text-muted-foreground">{billToEmail}</p> : null}
              {order.shippingAddress ? (
                <div className="mt-2 text-muted-foreground">
                  <div>{order.shippingAddress.address1}</div>
                  {order.shippingAddress.address2 ? <div>{order.shippingAddress.address2}</div> : null}
                  <div>
                    {order.shippingAddress.city}
                    {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
                    {order.shippingAddress.postalCode}
                  </div>
                  <div>{order.shippingAddress.country}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Item</th>
                  <th className="py-3 pr-4">SKU</th>
                  <th className="py-3 pr-4 text-right">Qty</th>
                  <th className="py-3 pr-4 text-right">Unit</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-4 pr-4">
                      <div className="font-semibold">{item.product?.name ?? "Product"}</div>
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">{item.product?.sku ?? "—"}</td>
                    <td className="py-4 pr-4 text-right">{item.quantity}</td>
                    <td className="py-4 pr-4 text-right">{formatKes(item.price)}</td>
                    <td className="py-4 text-right font-semibold">{formatKes(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-2 sm:ml-auto sm:max-w-sm text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatKes(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold">{formatKes(order.shipping)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-semibold">{formatKes(order.tax)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base">
              <span className="font-black uppercase tracking-widest">Total</span>
              <span className="font-black">{formatKes(order.total)}</span>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Notes</p>
            <p className="mt-1">
              Thank you for shopping with {storeName}. This invoice is generated from the admin console.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

