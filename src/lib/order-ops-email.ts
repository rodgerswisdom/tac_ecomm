import { prisma } from "@/lib/prisma";
import { EmailService, getEmailConfig } from "@/lib/email";
import { DELIVERY_LABELS, type DeliveryMethod } from "@/lib/delivery";
import { getEmailBaseUrl, toOrderEmailItems } from "@/lib/order-item-display";

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
      deliveryInstructions: true,
      user: { select: { email: true } },
      shippingAddress: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          address1: true,
          address2: true,
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

  if (!order?.shippingAddress) return;

  const addr = order.shippingAddress;
  const customerName = `${addr.firstName} ${addr.lastName}`.trim();
  const phone = addr.phone?.trim() || "Not provided";
  const locality = [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ");
  const emailItems = toOrderEmailItems(order.items, getEmailBaseUrl());
  // Code first: it's what the packer looks for on the stock label.
  const itemLines = emailItems.map(
    (item) => `${item.sku ? `${item.sku} — ` : ""}${item.name}${item.design ? ` (${item.design})` : ""} × ${item.quantity}`,
  );
  const itemRowsHtml = emailItems
    .map(
      (item) => `
        <tr>
          <td width="64" style="padding: 6px 8px 6px 0; vertical-align: top;">${
            item.imageUrl
              ? `<img src="${escapeHtml(item.imageUrl)}" alt="" width="56" height="56" style="display: block; width: 56px; height: 56px; object-fit: cover; border-radius: 6px; border: 1px solid #eee;" />`
              : ""
          }</td>
          <td style="padding: 6px 0; vertical-align: top;">
            ${item.sku ? `<strong style="font-size: 16px;">${escapeHtml(item.sku)}</strong><br />` : ""}
            ${escapeHtml(item.name)}${item.design ? ` &middot; ${escapeHtml(item.design)}` : ""}<br />
            Qty <strong>${item.quantity}</strong>
          </td>
        </tr>`,
    )
    .join("");
  const totalLine = `KES ${Math.round(order.total).toLocaleString()}`;
  const paymentLine = order.paymentMethod ?? "Not specified";
  const deliveryLine = order.shippingMethod
    ? DELIVERY_LABELS[order.shippingMethod as DeliveryMethod] ?? order.shippingMethod
    : "Not specified";
  const streetLines = [addr.address1, addr.address2].filter(Boolean) as string[];

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
      ${
        order.deliveryInstructions
          ? `<p style="margin: 0 0 12px 0; padding: 10px 12px; background: #fff7e6; border-radius: 6px;"><strong>Customer's delivery instructions:</strong><br />${escapeHtml(order.deliveryInstructions)}<br /><em>Call the customer to agree the handover in Nairobi CBD. No shipping was charged.</em></p>`
          : ""
      }
      <p style="margin: 0 0 6px 0;"><strong>Items</strong></p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 12px 0; border-collapse: collapse;">${itemRowsHtml}</table>
      <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
      <p style="margin: 0 0 6px 0;"><strong>Shipping address</strong></p>
      <p style="margin: 0;">
        ${escapeHtml(customerName)}<br />
        ${streetLines.map((line) => `${escapeHtml(line)}<br />`).join("")}
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
    `Delivery: ${deliveryLine}\n` +
    (order.deliveryInstructions
      ? `Customer's delivery instructions: ${order.deliveryInstructions}\n(Call the customer to agree the handover in Nairobi CBD. No shipping was charged.)\n`
      : "") +
    `\n` +
    `Items:\n${itemLines.map((line) => `- ${line}`).join("\n")}\n\n` +
    `Shipping:\n${customerName}\n${streetLines.join("\n")}\n${locality}\n${addr.country}\n`;

  const emailService = new EmailService(getEmailConfig());
  await Promise.all(
    OPS_EMAILS.map((to) => emailService.sendEmail({ to, subject, html, text })),
  );
}

/** Alert the ops team to a payment that needs a human decision (refund, restock, etc.). */
export async function sendOpsAlertEmail({
  subject,
  lines,
}: {
  subject: string;
  lines: string[];
}): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin: 0 0 12px 0; color: #b42318;">${escapeHtml(subject)}</h2>
      ${lines.map((line) => `<p style="margin: 0 0 8px 0;">${escapeHtml(line)}</p>`).join("")}
    </div>
  `;
  const text = `${subject}\n\n${lines.join("\n")}\n`;
  const emailService = new EmailService(getEmailConfig());
  await Promise.all(
    OPS_EMAILS.map((to) => emailService.sendEmail({ to, subject: `[Action needed] ${subject}`, html, text })),
  );
}
