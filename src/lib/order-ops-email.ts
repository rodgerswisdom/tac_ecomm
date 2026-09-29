import { prisma } from "@/lib/prisma";
import { EmailService, getEmailConfig } from "@/lib/email";

const OPS_EMAILS = [
  "info@tacaccessories.co.ke",
  "peter@tacaccessories.co.ke",
  "mary@tacaccessories.co.ke",
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Notify the ops team that a paid order needs fulfilment. */
export async function sendNewOrderOpsEmail(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      orderNumber: true,
      total: true,
      paymentMethod: true,
      shippingMethod: true,
      user: { select: { email: true } },
      shippingAddress: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
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
          productName: true,
          selectedImageLabel: true,
        },
      },
    },
  });

  if (!order?.shippingAddress) return;

  const addr = order.shippingAddress;
  const customerName = `${addr.firstName} ${addr.lastName}`.trim();
  const phone = addr.phone?.trim() || "Not provided";
  const locality = [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ");
  const itemLines = order.items.map((item) => {
    const label = item.selectedImageLabel ? ` — ${item.selectedImageLabel}` : "";
    return `${item.productName ?? "Product"}${label} × ${item.quantity}`;
  });
  const totalLine = `KES ${Math.round(order.total).toLocaleString()}`;
  const paymentLine = order.paymentMethod ?? "Not specified";
  const deliveryLine = order.shippingMethod ?? "Not specified";

  const subject = `New paid order: ${order.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin: 0 0 12px 0;">New paid order</h2>
      <p style="margin: 0 0 12px 0;"><strong>Order #:</strong> ${escapeHtml(order.orderNumber)}</p>
      <p style="margin: 0 0 12px 0;"><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${escapeHtml(order.user.email)}</p>
      <p style="margin: 0 0 12px 0;"><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p style="margin: 0 0 12px 0;"><strong>Total:</strong> ${totalLine}</p>
      <p style="margin: 0 0 12px 0;"><strong>Payment method:</strong> ${escapeHtml(paymentLine)}</p>
      <p style="margin: 0 0 12px 0;"><strong>Delivery:</strong> ${escapeHtml(deliveryLine)}</p>
      <p style="margin: 0 0 6px 0;"><strong>Items</strong></p>
      <ul style="margin: 0 0 12px 0; padding-left: 18px;">${itemLines
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("")}</ul>
      <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
      <p style="margin: 0 0 6px 0;"><strong>Shipping address</strong></p>
      <p style="margin: 0;">
        ${escapeHtml(customerName)}<br />
        ${escapeHtml(addr.address1)}<br />
        ${escapeHtml(locality)}<br />
        ${escapeHtml(addr.country)}
      </p>
    </div>
  `;
  const text =
    `New paid order\n\n` +
    `Order #: ${order.orderNumber}\n` +
    `Customer: ${customerName}\n` +
    `Email: ${order.user.email}\n` +
    `Phone: ${phone}\n` +
    `Total: ${totalLine}\n` +
    `Payment method: ${paymentLine}\n` +
    `Delivery: ${deliveryLine}\n\n` +
    `Items:\n${itemLines.map((line) => `- ${line}`).join("\n")}\n\n` +
    `Shipping:\n${customerName}\n${addr.address1}\n${locality}\n${addr.country}\n`;

  const emailService = new EmailService(getEmailConfig());
  await Promise.all(
    OPS_EMAILS.map((to) => emailService.sendEmail({ to, subject, html, text })),
  );
}
