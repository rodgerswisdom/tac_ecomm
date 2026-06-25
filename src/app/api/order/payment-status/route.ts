import { NextResponse } from "next/server";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function formatKes(amount: number) {
  return `KES ${Math.round(amount).toLocaleString()}`;
}

function parseGatewayMeta(gatewayResponse: string | null | undefined) {
  if (!gatewayResponse?.trim()) {
    return {
      stkMessage: null as string | null,
      failureReason: null as string | null,
      mpesaReceiptNumber: null as string | null,
      confirmedAt: null as string | null,
    };
  }
  try {
    const parsed = JSON.parse(gatewayResponse) as Record<string, unknown>;
    const stkMessage = typeof parsed.message === "string" ? parsed.message : null;
    const failureReason =
      typeof parsed.failure_reason === "string"
        ? parsed.failure_reason
        : typeof parsed.result_desc === "string"
          ? parsed.result_desc
          : null;
    const mpesaReceiptNumber =
      typeof parsed.mpesa_receipt_number === "string"
        ? parsed.mpesa_receipt_number
        : null;
    const confirmedAt =
      typeof parsed.timestamp === "string" ? parsed.timestamp : null;
    return { stkMessage, failureReason, mpesaReceiptNumber, confirmedAt };
  } catch {
    return {
      stkMessage: null,
      failureReason: null,
      mpesaReceiptNumber: null,
      confirmedAt: null,
    };
  }
}

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
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      total: true,
      updatedAt: true,
      payments: {
        where: {
          method: { in: [PaymentMethod.TUMA, PaymentMethod.PESAPAL] },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          transactionId: true,
          currency: true,
          gatewayResponse: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const payment = order.payments[0] ?? null;
  const { stkMessage, failureReason, mpesaReceiptNumber, confirmedAt } =
    parseGatewayMeta(payment?.gatewayResponse);
  const paymentStatus = order.paymentStatus;
  const isComplete = paymentStatus === PaymentStatus.COMPLETED;
  const isFailed =
    paymentStatus === PaymentStatus.FAILED || paymentStatus === PaymentStatus.CANCELLED;
  const isPending = !isComplete && !isFailed;

  return NextResponse.json({
    paymentStatus,
    orderStatus: order.status,
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    totalFormatted: formatKes(order.total),
    stkMessage,
    failureReason,
    mpesaReceiptNumber: isComplete ? mpesaReceiptNumber : null,
    confirmedAt: isComplete
      ? confirmedAt ?? payment?.updatedAt?.toISOString() ?? order.updatedAt.toISOString()
      : null,
    isComplete,
    isFailed,
    isPending,
    payment: payment
      ? {
          id: payment.id,
          status: payment.status,
          transactionId: payment.transactionId,
          currency: payment.currency,
        }
      : null,
    orderConfirmed: order.status === OrderStatus.CONFIRMED,
  });
}
