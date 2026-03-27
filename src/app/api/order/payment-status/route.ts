import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId")?.trim();
  const trackingId = searchParams.get("trackingId")?.trim();

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      paymentStatus: true,
      payments: {
        where: {
          method: PaymentMethod.PESAPAL,
          ...(trackingId ? { transactionId: trackingId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, transactionId: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    paymentStatus: order.paymentStatus,
    payment: order.payments[0] ?? null,
  });
}
