import { NextResponse } from "next/server";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId")?.trim();

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      paymentStatus: true,
      payments: {
        where: {
          method: { in: [PaymentMethod.TUMA, PaymentMethod.PESAPAL] },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, status: true, transactionId: true, currency: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const currentPayment = order.payments[0] ?? null;

  return NextResponse.json({
    paymentStatus: order.paymentStatus,
    payment: currentPayment,
    isComplete: order.paymentStatus === PaymentStatus.COMPLETED,
  });
}
