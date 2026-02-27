/**
 * TAC Accessories — Transactional Email Service
 * Transport: Brevo SMTP  (smtp-relay.brevo.com:587 / STARTTLS)
 * Library:   nodemailer
 */

import nodemailer, { type Transporter } from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
  fromEmail: string
  fromName: string
  replyTo?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface SendEmailOptions {
  to: string | { email: string; name?: string }
  subject: string
  html: string
  text?: string
  from?: { email: string; name: string }
  replyTo?: string
}

export interface OrderEmailData {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency?: string
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  trackingNumber?: string
  estimatedDelivery?: string
  couponCode?: string
  couponDiscount?: number
}

// ─────────────────────────────────────────────
// Singleton transporter
// ─────────────────────────────────────────────

let _transporter: Transporter | null = null

function getTransporter(config: EmailConfig): Transporter {
  if (_transporter) return _transporter

  _transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,          // STARTTLS — port 587 upgrades after handshake
    requireTLS: true,       // Refuse plain-text fallback
    pool: true,             // Reuse connections across sends
    maxConnections: 5,
    maxMessages: 100,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 10_000,  // 10 s
    greetingTimeout: 8_000,
    socketTimeout: 30_000,
    tls: {
      // Brevo's cert is valid; keep this true in production
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  })

  return _transporter
}

// ─────────────────────────────────────────────
// EmailService
// ─────────────────────────────────────────────

export class EmailService {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  // ── Core send ──────────────────────────────

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    // Development / CI guard: warn loudly but don't throw
    if (!this.config.user || !this.config.pass) {
      console.warn(
        '[EmailService] SMTP credentials are not set. Email NOT delivered.',
        { subject: options.subject }
      )
      return false
    }

    // Build RFC-5322 address strings nodemailer accepts without type issues
    const toAddress =
      typeof options.to === 'string'
        ? options.to
        : options.to.name
          ? `"${options.to.name}" <${options.to.email}>`
          : options.to.email

    const fromAddress = options.from
      ? `"${options.from.name}" <${options.from.email}>`
      : `"${this.config.fromName}" <${this.config.fromEmail}>`

    const mailOptions: Mail.Options = {
      from: fromAddress,
      to: toAddress,
      subject: options.subject,
      html: options.html,
      text: options.text ?? this.htmlToText(options.html),
      replyTo: options.replyTo ?? this.config.replyTo ?? this.config.fromEmail,
      headers: {
        // Brevo best-practice: include a list-unsubscribe header for transactional mail
        'X-Mailer': 'TAC-Accessories/1.0',
      },
    }

    try {
      const transporter = getTransporter(this.config)
      const info = await transporter.sendMail(mailOptions)
      console.info(
        `[EmailService] Delivered ✓ to=${toAddress} subject="${options.subject}" messageId=${info.messageId}`
      )
      return true
    } catch (err) {
      console.error(
        `[EmailService] SMTP error sending to ${toAddress}:`,
        err
      )
      return false
    }
  }

  // ── Public notification helpers ────────────

  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    const t = this.orderConfirmationTemplate(data)
    return this.sendEmail({
      to: { email: data.customerEmail, name: data.customerName },
      subject: t.subject,
      html: t.html,
      text: t.text,
    })
  }

  async sendOrderShipped(data: OrderEmailData): Promise<boolean> {
    const t = this.orderShippedTemplate(data)
    return this.sendEmail({
      to: { email: data.customerEmail, name: data.customerName },
      subject: t.subject,
      html: t.html,
      text: t.text,
    })
  }

  async sendOrderDelivered(data: OrderEmailData): Promise<boolean> {
    const t = this.orderDeliveredTemplate(data)
    return this.sendEmail({
      to: { email: data.customerEmail, name: data.customerName },
      subject: t.subject,
      html: t.html,
      text: t.text,
    })
  }

  async sendWelcomeEmail(customerName: string, customerEmail: string): Promise<boolean> {
    const t = this.welcomeTemplate(customerName)
    return this.sendEmail({
      to: { email: customerEmail, name: customerName },
      subject: t.subject,
      html: t.html,
      text: t.text,
    })
  }

  async sendPasswordResetEmail(customerEmail: string, resetLink: string): Promise<boolean> {
    const t = this.passwordResetTemplate(resetLink)
    return this.sendEmail({
      to: { email: customerEmail },
      subject: t.subject,
      html: t.html,
      text: t.text,
    })
  }

  // ── Connection health-check (optional use in /api/health) ──

  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = getTransporter(this.config)
      await transporter.verify()
      console.info('[EmailService] SMTP connection verified ✓')
      return true
    } catch (err) {
      console.error('[EmailService] SMTP connection failed:', err)
      return false
    }
  }

  // ── HTML Templates ─────────────────────────

  private baseLayout(
    title: string,
    subtitle: string,
    body: string
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,Helvetica,sans-serif;background:#f5e6ca;color:#1a0f00;-webkit-font-smoothing:antialiased}
    .wrap{width:100%;background:#f5e6ca;padding:32px 16px}
    .card{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(74,43,0,.12)}
    .hd{background:linear-gradient(135deg,#c89b3c 0%,#a0621a 100%);padding:48px 32px;text-align:center}
    .hd h1{color:#fff;font-size:26px;font-weight:700;letter-spacing:-.5px;line-height:1.3;margin:0 0 6px}
    .hd-sub{color:rgba(255,255,255,.82);font-size:14px;margin:0}
    .bd{padding:40px 32px}
    .greeting{font-size:18px;font-weight:600;color:#1a0f00;margin-bottom:10px}
    .intro{font-size:15px;color:#4a3000;line-height:1.7;margin-bottom:28px}
    .section{background:#faf4e8;border:1px solid #e8d5a3;border-radius:12px;padding:22px;margin-bottom:22px}
    .sec-title{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a0621a;margin-bottom:14px}
    .meta-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #e8d5a3;font-size:14px}
    .meta-row:last-child{border-bottom:none}
    .ml{color:#8a6a30}.mv{color:#1a0f00;font-weight:600}
    .li{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:1px solid #e8d5a3;font-size:14px}
    .li:last-child{border-bottom:none}
    .li-name{color:#1a0f00;font-weight:500;flex:1}
    .li-qty{color:#8a6a30;font-size:12px;margin-top:2px}
    .li-price{color:#1a0f00;font-weight:600;white-space:nowrap;margin-left:12px}
    .tot{display:flex;justify-content:space-between;padding:7px 0;font-size:14px}
    .tot.grand{border-top:2px solid #c89b3c;margin-top:8px;padding-top:12px;font-size:17px;font-weight:700;color:#a0621a}
    .track-box{text-align:center;padding:22px;background:linear-gradient(135deg,#fdf4e0,#f5e3b0);border-radius:12px;margin-bottom:22px;border:1px solid #d4aa60}
    .track-lbl{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#a0621a;margin-bottom:8px}
    .track-num{font-size:26px;font-weight:700;color:#1a0f00;letter-spacing:2px;font-family:'Courier New',monospace}
    .track-eta{font-size:13px;color:#8a6a30;margin-top:6px}
    .cta{text-align:center;margin:26px 0}
    .btn{display:inline-block;background:linear-gradient(135deg,#c89b3c,#a0621a);color:#fff!important;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;letter-spacing:.2px}
    .btn-out{display:inline-block;background:transparent;color:#a0621a!important;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;border:2px solid #c89b3c;margin-left:10px}
    .blist{list-style:none;padding:0;margin:0}
    .blist li{padding:8px 0 8px 26px;position:relative;font-size:14px;color:#4a3000;border-bottom:1px solid #e8d5a3}
    .blist li:last-child{border-bottom:none}
    .blist li::before{content:'✦';position:absolute;left:0;color:#c89b3c;font-size:11px;top:10px}
    .notice{background:#fff8ec;border-left:4px solid #c89b3c;padding:14px 16px;border-radius:0 8px 8px 0;font-size:13px;color:#4a3000;line-height:1.6;margin-bottom:22px}
    .ft{background:#1a0f00;padding:30px;text-align:center}
    .ft-logo{color:#c89b3c;font-size:17px;font-weight:700;letter-spacing:1px;margin-bottom:12px}
    .ft-links{margin:14px 0}
    .ft-links a{color:#c89b3c;text-decoration:none;font-size:13px;margin:0 9px}
    .ft-copy{color:#7a6050;font-size:12px;line-height:1.6;margin-top:18px}
    @media(max-width:480px){
      .bd{padding:24px 18px}.hd{padding:34px 18px}
      .btn-out{margin-left:0;margin-top:10px}
    }
  </style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="hd">
      <h1>${title}</h1>
      <p class="hd-sub">${subtitle}</p>
    </div>
    <div class="bd">${body}</div>
    <div class="ft">
      <div class="ft-logo">TAC ACCESSORIES</div>
      <div class="ft-links">
        <a href="${this.appUrl()}">Shop</a>
        <a href="${this.appUrl()}/contact">Support</a>
        <a href="${this.appUrl()}/profile/orders">My Orders</a>
      </div>
      <p class="ft-copy">
        TAC Accessories · Celebrating African Heritage Through Jewelry<br>
        You are receiving this because you placed an order or created an account with us.
      </p>
    </div>
  </div>
</div>
</body>
</html>`
  }

  // ── Order Confirmation ─────────────────────

  private orderConfirmationTemplate(data: OrderEmailData): EmailTemplate {
    const currency = data.currency ?? 'USD'
    const subject = `Order Confirmed — ${data.orderNumber} | TAC Accessories`

    const itemRows = data.items
      .map(
        (item) => `
      <div class="li">
        <div>
          <div class="li-name">${this.esc(item.name)}</div>
          <div class="li-qty">Qty: ${item.quantity}</div>
        </div>
        <div class="li-price">${this.fmtCurrency(item.price * item.quantity, currency)}</div>
      </div>`
      )
      .join('')

    const discountRow =
      data.couponCode && data.couponDiscount
        ? `<div class="tot"><span style="color:#8a6a30">Discount (${this.esc(data.couponCode)})</span><span style="color:#16a34a">−${this.fmtCurrency(data.couponDiscount, currency)}</span></div>`
        : ''

    const html = this.baseLayout(
      'Order Confirmed!',
      'Thank you for choosing TAC Accessories',
      `<p class="greeting">Hello, ${this.esc(data.customerName)}!</p>
      <p class="intro">We've received your order and are preparing your Afrocentric jewelry with care. You'll get another email once it ships.</p>

      <div class="section">
        <div class="sec-title">Order Details</div>
        <div class="meta-row"><span class="ml">Order Number</span><span class="mv">${this.esc(data.orderNumber)}</span></div>
        <div class="meta-row"><span class="ml">Order Date</span><span class="mv">${this.esc(data.orderDate)}</span></div>
      </div>

      <div class="section">
        <div class="sec-title">Items Ordered</div>
        ${itemRows}
        <div style="margin-top:12px">
          <div class="tot"><span style="color:#8a6a30">Subtotal</span><span>${this.fmtCurrency(data.subtotal, currency)}</span></div>
          <div class="tot"><span style="color:#8a6a30">Shipping</span><span>${data.shipping === 0 ? 'Free' : this.fmtCurrency(data.shipping, currency)}</span></div>
          ${data.tax > 0 ? `<div class="tot"><span style="color:#8a6a30">Tax</span><span>${this.fmtCurrency(data.tax, currency)}</span></div>` : ''}
          ${discountRow}
          <div class="tot grand"><span>Total</span><span>${this.fmtCurrency(data.total, currency)}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="sec-title">Shipping Address</div>
        <p style="font-size:14px;color:#4a3000;line-height:1.8">
          ${this.esc(data.shippingAddress.name)}<br>
          ${this.esc(data.shippingAddress.address)}<br>
          ${this.esc(data.shippingAddress.city)}${data.shippingAddress.state ? ', ' + this.esc(data.shippingAddress.state) : ''} ${this.esc(data.shippingAddress.zipCode)}<br>
          ${this.esc(data.shippingAddress.country)}
        </p>
      </div>

      <div class="cta">
        <a href="${this.appUrl()}/profile/orders" class="btn">View My Order</a>
      </div>
      <p style="font-size:13px;color:#8a6a30;text-align:center">
        Questions? Reply to this email or visit our <a href="${this.appUrl()}/contact" style="color:#a0621a">support page</a>.
      </p>`
    )

    const text = `Order Confirmed — ${data.orderNumber}

Hello ${data.customerName},

We've received your order and are preparing your Afrocentric jewelry.

Order Number: ${data.orderNumber}
Order Date: ${data.orderDate}

Items:
${data.items.map((i) => `  ${i.name} × ${i.quantity}  ${this.fmtCurrency(i.price * i.quantity, currency)}`).join('\n')}

Subtotal: ${this.fmtCurrency(data.subtotal, currency)}
Shipping: ${data.shipping === 0 ? 'Free' : this.fmtCurrency(data.shipping, currency)}
${data.tax > 0 ? `Tax: ${this.fmtCurrency(data.tax, currency)}\n` : ''}${data.couponCode && data.couponDiscount ? `Discount (${data.couponCode}): -${this.fmtCurrency(data.couponDiscount, currency)}\n` : ''}Total: ${this.fmtCurrency(data.total, currency)}

Shipping Address:
${data.shippingAddress.name}
${data.shippingAddress.address}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

View your order: ${this.appUrl()}/profile/orders

TAC Accessories — Celebrating African Heritage Through Jewelry`

    return { subject, html, text }
  }

  // ── Order Shipped ──────────────────────────

  private orderShippedTemplate(data: OrderEmailData): EmailTemplate {
    const subject = `Your Order Has Shipped — ${data.orderNumber} | TAC Accessories`

    const html = this.baseLayout(
      'Your Order is on the Way!',
      'Your beautiful jewelry is heading to you',
      `<p class="greeting">Hello, ${this.esc(data.customerName)}!</p>
      <p class="intro">Great news — your order <strong>${this.esc(data.orderNumber)}</strong> has been dispatched and is on its way to you.</p>

      <div class="track-box">
        <div class="track-lbl">Tracking Number</div>
        <div class="track-num">${this.esc(data.trackingNumber ?? 'Pending')}</div>
        ${data.estimatedDelivery ? `<div class="track-eta">Estimated delivery: <strong>${this.esc(data.estimatedDelivery)}</strong></div>` : ''}
      </div>

      <div class="section">
        <div class="sec-title">Shipping To</div>
        <p style="font-size:14px;color:#4a3000;line-height:1.8">
          ${this.esc(data.shippingAddress.name)}<br>
          ${this.esc(data.shippingAddress.address)}<br>
          ${this.esc(data.shippingAddress.city)}${data.shippingAddress.state ? ', ' + this.esc(data.shippingAddress.state) : ''} ${this.esc(data.shippingAddress.zipCode)}<br>
          ${this.esc(data.shippingAddress.country)}
        </p>
      </div>

      <div class="cta">
        <a href="${this.appUrl()}/profile/orders" class="btn">Track My Order</a>
      </div>`
    )

    const text = `Your Order Has Shipped — ${data.orderNumber}

Hello ${data.customerName},

Your order ${data.orderNumber} has been dispatched.

Tracking Number: ${data.trackingNumber ?? 'Pending'}
${data.estimatedDelivery ? `Estimated Delivery: ${data.estimatedDelivery}\n` : ''}
Shipping To:
${data.shippingAddress.name}
${data.shippingAddress.address}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

Track your order: ${this.appUrl()}/profile/orders

TAC Accessories — Celebrating African Heritage Through Jewelry`

    return { subject, html, text }
  }

  // ── Order Delivered ────────────────────────

  private orderDeliveredTemplate(data: OrderEmailData): EmailTemplate {
    const subject = `Your Order Has Been Delivered — ${data.orderNumber} | TAC Accessories`

    const html = this.baseLayout(
      'Your Order Has Arrived!',
      'Enjoy your beautiful Afrocentric jewelry',
      `<p class="greeting">Hello, ${this.esc(data.customerName)}!</p>
      <p class="intro">Your order <strong>${this.esc(data.orderNumber)}</strong> has been delivered. We hope you absolutely love your new jewelry!</p>

      <div class="cta">
        <a href="${this.appUrl()}/profile/orders" class="btn">View My Order</a>
        <a href="${this.appUrl()}/collections" class="btn-out">Shop More</a>
      </div>

      <p style="font-size:14px;color:#4a3000;line-height:1.7;margin-top:8px">
        We'd love to hear about your experience. Your review helps other customers discover our handcrafted pieces and supports the artisan communities behind them.
      </p>
      <div class="cta" style="margin-top:14px">
        <a href="${this.appUrl()}/profile/orders" class="btn-out">Leave a Review</a>
      </div>`
    )

    const text = `Your Order Has Been Delivered — ${data.orderNumber}

Hello ${data.customerName},

Your order ${data.orderNumber} has been delivered. We hope you love it!

Leave a review: ${this.appUrl()}/profile/orders
Shop more: ${this.appUrl()}/collections

TAC Accessories — Celebrating African Heritage Through Jewelry`

    return { subject, html, text }
  }

  // ── Welcome ────────────────────────────────

  private welcomeTemplate(customerName: string): EmailTemplate {
    const subject = 'Welcome to TAC Accessories'

    const html = this.baseLayout(
      'Welcome to TAC Accessories!',
      'Celebrating African Heritage Through Jewelry',
      `<p class="greeting">Hello, ${this.esc(customerName)}!</p>
      <p class="intro">Welcome to the TAC Accessories family. We're thrilled to have you join us in celebrating African culture and heritage through beautifully handcrafted jewelry.</p>

      <div class="section">
        <div class="sec-title">As a Member You'll Enjoy</div>
        <ul class="blist">
          <li>Exclusive early access to new collections</li>
          <li>Special member discounts and offers</li>
          <li>Insured and tracked delivery on every order</li>
          <li>Priority customer support</li>
          <li>Stories behind every piece and artisan</li>
        </ul>
      </div>

      <div class="cta">
        <a href="${this.appUrl()}/collections" class="btn">Start Shopping</a>
      </div>`
    )

    const text = `Welcome to TAC Accessories!

Hello ${customerName},

Welcome to the TAC Accessories family! We're thrilled to have you.

As a member you'll enjoy:
  * Exclusive early access to new collections
  * Special member discounts and offers
  * Insured and tracked delivery on every order
  * Priority customer support
  * Stories behind every piece and artisan

Start shopping: ${this.appUrl()}/collections

TAC Accessories — Celebrating African Heritage Through Jewelry`

    return { subject, html, text }
  }

  // ── Password Reset ─────────────────────────

  private passwordResetTemplate(resetLink: string): EmailTemplate {
    const subject = 'Reset Your Password — TAC Accessories'

    const html = this.baseLayout(
      'Reset Your Password',
      'Secure your TAC Accessories account',
      `<p class="greeting">Password Reset Request</p>
      <p class="intro">We received a request to reset the password for your TAC Accessories account. Click the button below to create a new password.</p>

      <div class="cta">
        <a href="${this.esc(resetLink)}" class="btn">Reset My Password</a>
      </div>

      <div class="notice">
        <strong>This link expires in 24 hours.</strong> If you did not request a password reset,
        you can safely ignore this email — your password will remain unchanged.
      </div>

      <p style="font-size:13px;color:#8a6a30;text-align:center">
        Or copy and paste this link into your browser:<br>
        <a href="${this.esc(resetLink)}" style="color:#a0621a;word-break:break-all">${this.esc(resetLink)}</a>
      </p>`
    )

    const text = `Reset Your Password — TAC Accessories

We received a request to reset the password for your TAC Accessories account.

Reset link (expires in 24 hours):
${resetLink}

If you didn't request this, you can safely ignore this email.

TAC Accessories — Celebrating African Heritage Through Jewelry`

    return { subject, html, text }
  }

  // ── Private utilities ──────────────────────

  /** HTML-escape user content before injecting into templates. */
  private esc(value: string | null | undefined): string {
    if (!value) return ''
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  private fmtCurrency(amount: number, currency = 'USD'): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currency.toUpperCase()} ${amount.toFixed(2)}`
    }
  }

  private appUrl(): string {
    return (
      process.env.APP_URL ??
      process.env.NEXTAUTH_URL ??
      'https://tacaccessories.com'
    ).replace(/\/$/, '')
  }

  /** Rough HTML → plain-text conversion for email clients that prefer it. */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }
}

// ─────────────────────────────────────────────
// Config factory & singleton helper
// ─────────────────────────────────────────────

export function getEmailConfig(): EmailConfig {
  return {
    host: process.env.BREVO_SMTP_HOST ?? 'smtp-relay.brevo.com',
    port: Number(process.env.BREVO_SMTP_PORT ?? '587'),
    user: process.env.BREVO_SMTP_USER ?? '',
    pass: process.env.BREVO_SMTP_PASS ?? '',
    fromEmail: process.env.EMAIL_FROM ?? 'noreply@tacaccessories.com',
    fromName: process.env.APP_NAME ?? 'TAC Accessories',
    replyTo: process.env.EMAIL_REPLY_TO,
  }
}

/** Returns a ready-to-use EmailService instance. */
export function createEmailService(): EmailService {
  return new EmailService(getEmailConfig())
}
