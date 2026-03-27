import { NextResponse } from "next/server";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PaymentService, getPaymentConfig } from "@/lib/payments";
import { deriveOrderStatus } from "@/lib/order-status";
import { decrementStock, restoreStock } from "@/lib/stock";
import { sendPaidOrderConfirmedEmail } from "@/lib/order-email";

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
      id: true,
      userId: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      payments: {
        where: {
          method: PaymentMethod.PESAPAL,
          ...(trackingId ? { transactionId: trackingId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, status: true, transactionId: true, currency: true },
      },
      items: {
        select: {
          productId: true,
          variantId: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let currentPaymentStatus = order.paymentStatus;
  let currentPayment = order.payments[0] ?? null;

  // Reconcile pending orders directly with Pesapal on poll so cart clears even
  // if IPN arrives late/misses and callback first returns pending.
  if (trackingId && currentPaymentStatus !== PaymentStatus.COMPLETED) {
    try {
      const paymentService = new PaymentService(getPaymentConfig());
      const verification = await paymentService.verifyPayment("pesapal", trackingId, {
        merchantReference: order.orderNumber,
      });

      const nextPaymentStatus = mapPaymentStatus(verification.status);
      const nextOrderStatus = deriveOrderStatus(nextPaymentStatus, order.status);
      const paymentCurrency = "KES";
      let shouldSendPaidEmail = false;

      await prisma.$transaction(async (tx) => {
        if (currentPayment) {
          await tx.payment.update({
            where: { id: currentPayment.id },
            data: {
              status: nextPaymentStatus,
              transactionId: verification.transactionId ?? trackingId,
              amount: verification.amount ?? order.total,
              currency: paymentCurrency,
              gatewayResponse: JSON.stringify(verification),
            },
          });
        } else {
          const createdPayment = await tx.payment.create({
            data: {
              orderId: order.id,
              method: PaymentMethod.PESAPAL,
              status: nextPaymentStatus,
              transactionId: verification.transactionId ?? trackingId,
              amount: verification.amount ?? order.total,
              currency: paymentCurrency,
              gatewayResponse: JSON.stringify(verification),
            },
          });
          currentPayment = createdPayment;
        }

        if (nextPaymentStatus === PaymentStatus.COMPLETED) {
          await tx.cartItem.deleteMany({
            where: { userId: order.userId },
          });
        }

        if (nextOrderStatus === order.status) {
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: nextPaymentStatus },
          });
          return;
        }

        if (order.status === OrderStatus.PENDING && nextOrderStatus === OrderStatus.CONFIRMED) {
          const transition = await tx.order.updateMany({
            where: { id: order.id, status: OrderStatus.PENDING },
            data: { paymentStatus: nextPaymentStatus, status: OrderStatus.CONFIRMED },
          });

          if (transition.count > 0) {
            await decrementStock(order.items, tx);
            shouldSendPaidEmail = true;
            return;
          }

          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: nextPaymentStatus },
          });
          return;
        }

        if (order.status === OrderStatus.CONFIRMED && nextOrderStatus === OrderStatus.CANCELLED) {
          const transition = await tx.order.updateMany({
            where: { id: order.id, status: OrderStatus.CONFIRMED },
            data: { paymentStatus: nextPaymentStatus, status: OrderStatus.CANCELLED },
          });

          if (transition.count > 0) {
            await restoreStock(order.id, tx);
            return;
          }

          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: nextPaymentStatus },
          });
          return;
        }

        const transition = await tx.order.updateMany({
          where: { id: order.id, status: order.status },
          data: { paymentStatus: nextPaymentStatus, status: nextOrderStatus },
        });

        if (transition.count === 0) {
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: nextPaymentStatus },
          });
        }
      });

      if (shouldSendPaidEmail) {
        try {
          await sendPaidOrderConfirmedEmail(order.id);
        } catch (emailError) {
          console.error("Failed to send paid order confirmation email:", emailError);
        }
      }

      const refreshed = await prisma.order.findUnique({
        where: { id: order.id },
        select: {
          paymentStatus: true,
          payments: {
            where: { method: PaymentMethod.PESAPAL },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, status: true, currency: true, transactionId: true },
          },
        },
      });

      currentPaymentStatus = refreshed?.paymentStatus ?? currentPaymentStatus;
      currentPayment = refreshed?.payments[0] ?? currentPayment;
    } catch (error) {
      console.error("Payment status reconciliation failed:", error);
    }
  }

  return NextResponse.json({
    paymentStatus: currentPaymentStatus,
    payment: currentPayment,
  });
}

function mapPaymentStatus(status: "completed" | "pending" | "failed" | "cancelled"): PaymentStatus {
  switch (status) {
    case "completed":
      return PaymentStatus.COMPLETED;
    case "pending":
      return PaymentStatus.PENDING;
    case "cancelled":
      return PaymentStatus.CANCELLED;
    default:
      return PaymentStatus.FAILED;
  }
}
