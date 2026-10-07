import { prisma } from "@/lib/prisma";
import { EmailService, getEmailConfig } from "@/lib/email";
import { getEmailBaseUrl, toOrderEmailItems } from "@/lib/order-item-display";

export async function sendPaidOrderConfirmedEmail(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      subtotal: true,
      tax: true,
      shipping: true,
      total: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      shippingAddress: {
        select: {
          firstName: true,
          lastName: true,
          address1: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
      },
      items: {
        select: {
          quantity: true,
          price: true,
          productName: true,
          productSku: true,
          selectedImageUrl: true,
          selectedImageLabel: true,
          productImage: { select: { url: true } },
          product: {
            select: { name: true, sku: true, images: { orderBy: { order: "asc" }, take: 1, select: { url: true } } },
          },
        },
      },
    },
  });

  if (!order?.user?.email || !order.shippingAddress) {
    return false;
  }

  const customerName =
    order.user.name?.trim() ||
    `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim();

  const emailService = new EmailService(getEmailConfig());
  return emailService.sendOrderConfirmed({
    customerName,
    customerEmail: order.user.email,
    orderNumber: order.orderNumber,
    orderDate: new Date(order.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    items: toOrderEmailItems(order.items, getEmailBaseUrl()),
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    currency: "KSH",
    shippingAddress: {
      name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim(),
      address: order.shippingAddress.address1,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      zipCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    },
  });
}
