import { notFound, redirect } from "next/navigation";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { Navbar } from "@/components/Navbar";
import { MpesaPaymentWaiting } from "@/components/checkout/MpesaPaymentWaiting";
import { prisma } from "@/lib/prisma";
import {
  getTumaCallbackPublicOrigin,
  getTumaCallbackWarning,
} from "@/lib/tuma-callback-url";

type PaymentPageProps = {
  searchParams: Promise<{
    orderId?: string;
    message?: string;
  }>;
};

function parseStkMessage(gatewayResponse: string | null | undefined): string | null {
  if (!gatewayResponse?.trim()) return null;
  try {
    const parsed = JSON.parse(gatewayResponse) as { message?: string };
    return typeof parsed.message === "string" ? parsed.message : null;
  } catch {
    return null;
  }
}

export default async function MpesaPaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const orderId = params.orderId?.trim();
  if (!orderId) {
    redirect("/checkout");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      paymentStatus: true,
      total: true,
      payments: {
        where: { method: PaymentMethod.TUMA },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { gatewayResponse: true },
      },
    },
  });

  if (!order) notFound();

  if (order.paymentStatus === PaymentStatus.COMPLETED) {
    redirect(`/checkout/thank-you?orderId=${order.id}&status=success`);
  }

  const stkMessage =
    parseStkMessage(order.payments[0]?.gatewayResponse) || params.message || undefined;
  const callbackOrigin = getTumaCallbackPublicOrigin();
  const callbackWarning = callbackOrigin ? getTumaCallbackWarning(callbackOrigin) : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-beige bg-texture-linen">
      <Navbar />
      <section className="nav-clearance section-spacing pb-16">
        <div className="gallery-container">
          <MpesaPaymentWaiting
            orderId={order.id}
            orderNumber={order.orderNumber}
            initialMessage={stkMessage}
            callbackWarning={callbackWarning}
          />
        </div>
      </section>
    </main>
  );
}
