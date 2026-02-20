// Email notification system using Resend

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

      if (this.config.apiKey) {
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
      } else {
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
