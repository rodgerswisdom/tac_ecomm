import { NextRequest, NextResponse } from "next/server";
import { EmailService, getEmailConfig } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, phone } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      phone?: string;
    };

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const config = getEmailConfig();
    const emailService = new EmailService(config);

    const opsEmail = process.env.OPS_EMAIL || config.fromEmail;

    const html = `
      <h2>New Contact Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `;

    const text = [
      `New Contact Inquiry`,
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      `Subject: ${subject}`,
      "",
      `Message:`,
      message,
    ]
      .filter(Boolean)
      .join("\n");

    await emailService.sendEmail({
      to: opsEmail,
      subject: `[Contact Form] ${subject}`,
      html,
      text,
      from: `${name} via TAC Accessories <${config.fromEmail}>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/contact]", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
