import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrderDetail } from "@/server/admin/orders";
import { buildInvoiceDocumentData } from "@/lib/invoice-data";
import { OrderInvoiceDocument } from "@/components/admin/invoice/OrderInvoiceDocument";
import { PrintButton } from "./PrintButton";
import "@/components/admin/invoice/invoice-print.css";

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

  const website =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://www.tacaccessories.co.ke";

  const invoiceData = buildInvoiceDocumentData(order, settings, website);

  return (
    <div className="invoice-document">
      <div className="invoice-toolbar print:hidden">
        <Link
          href={`/admin/orders/${order.id}`}
          className="invoice-toolbar__back"
        >
          Back to order
        </Link>
        <PrintButton />
      </div>

      <OrderInvoiceDocument data={invoiceData} />
    </div>
  );
}
