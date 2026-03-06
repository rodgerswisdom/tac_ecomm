// Email notification system (Resend or SMTP via Brevo)

import nodemailer from 'nodemailer'

export interface EmailConfig {
  apiKey: string
  fromEmail: string
  fromName: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
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

export class EmailService {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const from = data.from || `${this.config.fromName} <${this.config.fromEmail}>`
      const payload = {
        from,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text || this.htmlToText(data.html)
      }

      const hasRealResendKey =
        this.config.apiKey && !this.config.apiKey.toLowerCase().startsWith('your-')

      if (hasRealResendKey) {
        // Primary path: Resend HTTP API
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const err = await res.text()
          throw new Error(`Resend API error: ${res.status} ${err}`)
        }
      } else if (
        process.env.BREVO_SMTP_HOST &&
        process.env.BREVO_SMTP_USER &&
        process.env.BREVO_SMTP_PASS
      ) {
        // Fallback: Brevo SMTP via Nodemailer
        const transporter = nodemailer.createTransport({
          host: process.env.BREVO_SMTP_HOST,
          port: Number(process.env.BREVO_SMTP_PORT ?? '587'),
          secure: false,
          auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASS,
          },
        })

        await transporter.sendMail({
          from,
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text || this.htmlToText(data.html),
          replyTo: process.env.EMAIL_REPLY_TO || undefined,
        })
      } else {
        // Last resort: simulate API call so the rest of the app keeps working
        await this.simulateApiCall('/emails', payload)
      }

      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    const template = this.getOrderConfirmationTemplate(data)
    return this.sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendOrderShipped(data: OrderEmailData): Promise<boolean> {
    const template = this.getOrderShippedTemplate(data)
    return this.sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendOrderDelivered(data: OrderEmailData): Promise<boolean> {
    const template = this.getOrderDeliveredTemplate(data)
    return this.sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendOrderConfirmed(data: OrderEmailData): Promise<boolean> {
    const template = this.getOrderConfirmedTemplate(data)
    return this.sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendOrderProcessing(data: OrderEmailData): Promise<boolean> {
    const template = this.getOrderProcessingTemplate(data)
    return this.sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendOrderCancelled(data: OrderEmailData & { note?: string }): Promise<boolean> {
    const template = this.getOrderCancelledTemplate(data)
    return this.sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendOrderRefunded(data: OrderEmailData & { note?: string }): Promise<boolean> {
    const template = this.getOrderRefundedTemplate(data)
    return this.sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendWelcomeEmail(customerName: string, customerEmail: string): Promise<boolean> {
    const template = this.getWelcomeTemplate(customerName)
    return this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendPasswordResetEmail(customerEmail: string, resetLink: string): Promise<boolean> {
    const template = this.getPasswordResetTemplate(resetLink)
    return this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendMfaOtpEmail(to: string, code: string): Promise<boolean> {
    const template = this.getMfaOtpTemplate(code)
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendSignupOtpEmail(to: string, code: string): Promise<boolean> {
    const template = this.getSignupOtpTemplate(code)
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  private getOrderConfirmationTemplate(data: OrderEmailData): EmailTemplate {
    const subject = `Order Confirmation - ${data.orderNumber} | TAC Accessories`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .item:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 18px; color: #c89b3c; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
          .footer a { color: #c89b3c; text-decoration: none; }
          .button { display: inline-block; background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Thank you for choosing TAC Accessories</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>We're excited to confirm your order! Your Afrocentric jewelry is being prepared with love and will be shipped soon.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Order Date:</strong> ${data.orderDate}</p>
              
              <h4>Items Ordered:</h4>
              ${data.items.map(item => `
                <div class="item">
                  <span>${item.name} (Qty: ${item.quantity})</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <div class="item">
                <span>Subtotal:</span>
                <span>$${data.subtotal.toFixed(2)}</span>
              </div>
              ${'couponCode' in data && data.couponCode ? `
                <div class="item">
                  <span>Discount (${data.couponCode}):</span>
                    <span>-$${typeof data.couponDiscount === 'number' ? data.couponDiscount.toFixed(2) : '0.00'}</span>
                </div>
              ` : ''}
              <div class="item total">
                <span>Total:</span>
                <span>$${data.total.toFixed(2)}</span>
              </div>
            </div>
            
            <h3>Shipping Address:</h3>
            <p>
              ${data.shippingAddress.name}<br>
              ${data.shippingAddress.address}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}<br>
              ${data.shippingAddress.country}
            </p>
            
            <p>Our team will contact you shortly to confirm your order and next steps. We'll send you a tracking number once your order ships.</p>
            <p>If you have any questions, reply to this email or contact our support team.</p>
            
            <div style="text-align: center;">
              <a href="#" class="button">Track Your Order</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for supporting African craftsmanship and heritage!</p>
            <p>
              <a href="#">Visit Our Website</a> | 
              <a href="#">Contact Support</a> | 
              <a href="#">Follow Us</a>
            </p>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">
              TAC Accessories - Celebrating African Heritage Through Jewelry
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Order Confirmation - ${data.orderNumber}
      
      Hello ${data.customerName},
      
      Thank you for your order! We're excited to prepare your Afrocentric jewelry.
      
      Order Details:
      - Order Number: ${data.orderNumber}
      - Order Date: ${data.orderDate}
      
      Items:
      ${data.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}
      
      Subtotal: $${data.subtotal.toFixed(2)}
      Total: $${data.total.toFixed(2)}
      
      Shipping Address:
      ${data.shippingAddress.name}
      ${data.shippingAddress.address}
      ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
      ${data.shippingAddress.country}
      
      Our team will contact you shortly to confirm your order and next steps. We'll send tracking information once your order ships. If you have any questions, reply to this email.
      
      Thank you for choosing TAC Accessories!
    `

    return { subject, html, text }
  }

  private getOrderShippedTemplate(data: OrderEmailData): EmailTemplate {
    const subject = `Your Order Has Shipped! - ${data.orderNumber} | TAC Accessories`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .tracking-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #c89b3c; margin: 10px 0; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
          .button { display: inline-block; background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Your Order is on the Way!</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Your beautiful jewelry is heading your way</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Great news! Your order ${data.orderNumber} has been shipped and is on its way to you.</p>
            
            <div class="tracking-info">
              <h3>Tracking Information</h3>
              <div class="tracking-number">${data.trackingNumber}</div>
              <p>Estimated Delivery: ${data.estimatedDelivery}</p>
            </div>
            
            <p>You can track your package using the tracking number above. We'll also send you updates as your package makes its journey to you.</p>
            
            <div style="text-align: center;">
              <a href="#" class="button">Track Package</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing TAC Accessories!</p>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">
              TAC Accessories - Celebrating African Heritage Through Jewelry
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Your Order Has Shipped! - ${data.orderNumber}
      
      Hello ${data.customerName},
      
      Great news! Your order has been shipped and is on its way.
      
      Tracking Number: ${data.trackingNumber}
      Estimated Delivery: ${data.estimatedDelivery}
      
      You can track your package using the tracking number above.
      
      Thank you for choosing TAC Accessories!
    `

    return { subject, html, text }
  }

  private getOrderDeliveredTemplate(data: OrderEmailData): EmailTemplate {
    const subject = `Your Order Has Been Delivered! - ${data.orderNumber} | TAC Accessories`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
          .button { display: inline-block; background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Your Order Has Arrived!</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Enjoy your beautiful Afrocentric jewelry</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>We hope you love your new jewelry! Your order ${data.orderNumber} has been successfully delivered.</p>
            
            <p>We'd love to hear about your experience. Please consider leaving a review to help other customers discover our beautiful pieces.</p>
            
            <div style="text-align: center;">
              <a href="#" class="button">Leave a Review</a>
              <a href="#" class="button" style="background: transparent; border: 2px solid #c89b3c; color: #c89b3c;">Shop More</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for supporting African craftsmanship!</p>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">
              TAC Accessories - Celebrating African Heritage Through Jewelry
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Your Order Has Been Delivered! - ${data.orderNumber}
      
      Hello ${data.customerName},
      
      Your order has been successfully delivered! We hope you love your new jewelry.
      
      Please consider leaving a review to help other customers discover our beautiful pieces.
      
      Thank you for supporting African craftsmanship!
    `

    return { subject, html, text }
  }

  private getOrderConfirmedTemplate(data: OrderEmailData): EmailTemplate {
    const subject = `Order Confirmed - ${data.orderNumber} | TAC Accessories`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmed</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .item:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 18px; color: #c89b3c; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Payment received – your order is locked in</p>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Great news! Your order ${data.orderNumber} has been confirmed. Payment has been received and we are preparing your items.</p>
            <div class="order-details">
              <h3>Order Summary</h3>
              <p><strong>Order #:</strong> ${data.orderNumber}</p>
              <p><strong>Date:</strong> ${data.orderDate}</p>
              <h4>Items:</h4>
              ${data.items.map((item) => `<div class="item"><span>${item.name} (x${item.quantity})</span><span>$${(item.price * item.quantity).toFixed(2)}</span></div>`).join('')}
              <div class="item"><span>Subtotal:</span><span>$${data.subtotal.toFixed(2)}</span></div>
              <div class="item total"><span>Total:</span><span>$${data.total.toFixed(2)}</span></div>
            </div>
            <p>We will notify you when your order ships.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing TAC Accessories!</p>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">TAC Accessories - Celebrating African Heritage Through Jewelry</p>
          </div>
        </div>
      </body>
      </html>
    `
    const text = `Order Confirmed - ${data.orderNumber}\n\nHello ${data.customerName},\n\nYour order ${data.orderNumber} has been confirmed. Payment received. We will notify you when your order ships.\n\nThank you for choosing TAC Accessories!`
    return { subject, html, text }
  }

  private getOrderProcessingTemplate(data: OrderEmailData): EmailTemplate {
    const subject = `We're Preparing Your Order - ${data.orderNumber} | TAC Accessories`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Processing</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order In Progress</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">We're carefully preparing your jewelry</p>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Your order ${data.orderNumber} is now being processed. Our team is preparing your items with care.</p>
            <p>You will receive another email with tracking information once your order has shipped.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing TAC Accessories!</p>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">TAC Accessories - Celebrating African Heritage Through Jewelry</p>
          </div>
        </div>
      </body>
      </html>
    `
    const text = `We're Preparing Your Order - ${data.orderNumber}\n\nHello ${data.customerName},\n\nYour order ${data.orderNumber} is now being processed. You will receive tracking information once it ships.\n\nThank you for choosing TAC Accessories!`
    return { subject, html, text }
  }

  private getOrderCancelledTemplate(data: OrderEmailData & { note?: string }): EmailTemplate {
    const subject = `Order Cancelled - ${data.orderNumber} | TAC Accessories`
    const noteHtml = data.note ? `<p><strong>Note from our team:</strong> ${data.note}</p>` : ''
    const noteText = data.note ? `\n\nNote from our team: ${data.note}` : ''
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancelled</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Order ${data.orderNumber}</p>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Your order ${data.orderNumber} has been cancelled.</p>
            ${noteHtml}
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing TAC Accessories!</p>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">TAC Accessories - Celebrating African Heritage Through Jewelry</p>
          </div>
        </div>
      </body>
      </html>
    `
    const text = `Order Cancelled - ${data.orderNumber}\n\nHello ${data.customerName},\n\nYour order ${data.orderNumber} has been cancelled.${noteText}\n\nIf you have any questions, please contact our support team.\n\nThank you for choosing TAC Accessories!`
    return { subject, html, text }
  }

  private getOrderRefundedTemplate(data: OrderEmailData & { note?: string }): EmailTemplate {
    const subject = `Order Refunded - ${data.orderNumber} | TAC Accessories`
    const noteHtml = data.note ? `<p><strong>Note from our team:</strong> ${data.note}</p>` : ''
    const noteText = data.note ? `\n\nNote from our team: ${data.note}` : ''
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Refunded</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .refund-amount { font-size: 24px; font-weight: bold; color: #c89b3c; margin: 16px 0; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Refund Processed</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Order ${data.orderNumber}</p>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Your refund for order ${data.orderNumber} has been processed.</p>
            <p class="refund-amount">Refund amount: $${data.total.toFixed(2)}</p>
            <p>The funds will appear in your original payment method within 5–10 business days, depending on your bank.</p>
            ${noteHtml}
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing TAC Accessories!</p>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">TAC Accessories - Celebrating African Heritage Through Jewelry</p>
          </div>
        </div>
      </body>
      </html>
    `
    const text = `Order Refunded - ${data.orderNumber}\n\nHello ${data.customerName},\n\nYour refund for order ${data.orderNumber} has been processed. Refund amount: $${data.total.toFixed(2)}. The funds will appear in your original payment method within 5–10 business days.${noteText}\n\nIf you have any questions, please contact our support team.\n\nThank you for choosing TAC Accessories!`
    return { subject, html, text }
  }

  private getWelcomeTemplate(customerName: string): EmailTemplate {
    const subject = 'Welcome to TAC Accessories! 🎉'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
          .button { display: inline-block; background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to TAC Accessories!</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Celebrating African Heritage Through Jewelry</p>
          </div>
          
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>Welcome to our family! We're thrilled to have you join us in celebrating African heritage through beautiful, handcrafted jewelry.</p>
            
            <p>As a new member, you'll enjoy:</p>
            <ul>
              <li>Exclusive access to new collections</li>
              <li>Special member discounts</li>
              <li>Insured delivery</li>
              <li>Priority customer support</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="#" class="button">Start Shopping</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing TAC Accessories!</p>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">
              TAC Accessories - Celebrating African Heritage Through Jewelry
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Welcome to TAC Accessories!
      
      Hello ${customerName},
      
      Welcome to our family! We're thrilled to have you join us in celebrating African heritage through beautiful, handcrafted jewelry.
      
      As a new member, you'll enjoy:
      - Exclusive access to new collections
      - Special member discounts
      - Insured delivery
      - Priority customer support
      
      Start shopping now!
      
      Thank you for choosing TAC Accessories!
    `

    return { subject, html, text }
  }

  private getPasswordResetTemplate(resetLink: string): EmailTemplate {
    const subject = 'Reset Your Password - TAC Accessories'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
          .button { display: inline-block; background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Secure your account</p>
          </div>
          
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p><strong>Note:</strong> This link will expire in 24 hours for security reasons.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing TAC Accessories!</p>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">
              TAC Accessories - Celebrating African Heritage Through Jewelry
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Reset Your Password - TAC Accessories
      
      Password Reset Request
      
      We received a request to reset your password. Click the link below to create a new password:
      
      ${resetLink}
      
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
      
      Note: This link will expire in 24 hours for security reasons.
      
      Thank you for choosing TAC Accessories!
    `

    return { subject, html, text }
  }

  private getMfaOtpTemplate(code: string): EmailTemplate {
    const subject = 'Your sign-in code - TAC Accessories'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign-in code</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .code { font-size: 28px; font-weight: 700; letter-spacing: 0.25em; color: #1a1a1a; background: #f8f9fa; padding: 16px 24px; border-radius: 8px; display: inline-block; margin: 16px 0; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your sign-in code</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">TAC Accessories</p>
          </div>
          <div class="content">
            <p>Use this code to complete sign-in:</p>
            <p class="code">${code}</p>
            <p>This code expires in 15 minutes. If you didn't request it, you can ignore this email.</p>
          </div>
          <div class="footer">
            <p style="font-size: 12px; color: #888;">TAC Accessories - Celebrating African Heritage Through Jewelry</p>
          </div>
        </div>
      </body>
      </html>
    `
    const text = `Your sign-in code - TAC Accessories\n\nUse this code to complete sign-in: ${code}\n\nThis code expires in 15 minutes. If you didn't request it, you can ignore this email.`
    return { subject, html, text }
  }

  private getSignupOtpTemplate(code: string): EmailTemplate {
    const subject = 'Verify your email - TAC Accessories'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4e4ba; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #c89b3c 0%, #cd7f32 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .code { font-size: 28px; font-weight: 700; letter-spacing: 0.25em; color: #1a1a1a; background: #f8f9fa; padding: 16px 24px; border-radius: 8px; display: inline-block; margin: 16px 0; }
          .footer { background-color: #1a1a1a; color: #ffffff; padding: 30px 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify your email</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">TAC Accessories</p>
          </div>
          <div class="content">
            <p>Thanks for signing up! Use this code to verify your email and complete your registration:</p>
            <p class="code">${code}</p>
            <p>This code expires in 15 minutes. If you didn't create an account, you can ignore this email.</p>
          </div>
          <div class="footer">
            <p style="font-size: 12px; color: #888;">TAC Accessories - Celebrating African Heritage Through Jewelry</p>
          </div>
        </div>
      </body>
      </html>
    `
    const text = `Verify your email - TAC Accessories\n\nThanks for signing up! Use this code to verify your email: ${code}\n\nThis code expires in 15 minutes. If you didn't create an account, you can ignore this email.`
    return { subject, html, text }
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
  }

  private async simulateApiCall(endpoint: string, data: any): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('Email API call:', endpoint, data)

    // Mock successful response
    return { success: true, id: 'email-' + Math.random().toString(36).substr(2, 9) }
  }
}

// Utility functions
export function getEmailConfig(): EmailConfig {
  return {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@tacaccessories.com',
    fromName: process.env.APP_NAME || 'TAC Accessories'
  }
}

// React hook for email functionality
export function useEmail() {
  const config = getEmailConfig()
  const emailService = new EmailService(config)

  const sendOrderConfirmation = async (data: OrderEmailData) => {
    return emailService.sendOrderConfirmation(data)
  }

  const sendOrderShipped = async (data: OrderEmailData) => {
    return emailService.sendOrderShipped(data)
  }

  const sendOrderDelivered = async (data: OrderEmailData) => {
    return emailService.sendOrderDelivered(data)
  }

  const sendWelcomeEmail = async (customerName: string, customerEmail: string) => {
    return emailService.sendWelcomeEmail(customerName, customerEmail)
  }

  const sendPasswordReset = async (customerEmail: string, resetLink: string) => {
    return emailService.sendPasswordResetEmail(customerEmail, resetLink)
  }

  return {
    sendOrderConfirmation,
    sendOrderShipped,
    sendOrderDelivered,
    sendWelcomeEmail,
    sendPasswordReset
  }
}