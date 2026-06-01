import type { PaymentMethod, PaymentStatus } from '@prisma/client'
import { getStoreContactDetails } from '@/lib/store-contact'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatInvoiceKes(amount: number): string {
  return `KES ${Math.round(amount).toLocaleString()}`
}

export type InvoiceLineItem = {
  index: number
  description: string
  sku: string
  quantity: number
  unitPrice: string
  lineTotal: string
}

export type InvoiceAddressBlock = {
  lines: string[]
}

export type InvoicePaymentInfo = {
  methodLabel: string
  statusLabel: string
  statusTone: 'paid' | 'pending' | 'failed' | 'neutral'
  transactionId: string | null
  receiptNumber: string | null
}

export type InvoiceDocumentData = {
  orderId: string
  invoiceNumber: string
  issueDate: string
  currency: string
  paymentStatusLabel: string
  paymentStatusTone: 'paid' | 'pending' | 'failed' | 'neutral'
  store: {
    name: string
    tagline: string
    email: string
    phone: string
    address: string
    website: string
  }
  billTo: {
    name: string
    email: string
    phone: string | null
  }
  shipTo: InvoiceAddressBlock
  payment: InvoicePaymentInfo
  lineItems: InvoiceLineItem[]
  totals: {
    subtotal: string
    shipping: string
    tax: string
    total: string
  }
}

type OrderDetail = NonNullable<Awaited<ReturnType<typeof import('@/server/admin/orders').getOrderDetail>>>

type StoreSettings = {
  storeName?: string | null
  storeTagline?: string | null
  salesEmail?: string | null
  supportEmail?: string | null
  whatsappNumber?: string | null
  address?: string | null
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PAYPAL: 'PayPal',
  PESAPAL: 'M-Pesa',
  TUMA: 'M-Pesa',
  CREDIT_CARD: 'Credit / Debit Card',
  BANK_TRANSFER: 'Bank Transfer',
}

function mapPaymentStatusTone(status: PaymentStatus): InvoicePaymentInfo['statusTone'] {
  switch (status) {
    case 'COMPLETED':
      return 'paid'
    case 'PENDING':
      return 'pending'
    case 'FAILED':
    case 'CANCELLED':
      return 'failed'
    default:
      return 'neutral'
  }
}

function formatPaymentStatus(status: PaymentStatus): string {
  return status.replace(/_/g, ' ')
}

function parseGatewayResponse(raw: string | null | undefined): Record<string, unknown> | null {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function extractReceiptNumber(gateway: Record<string, unknown> | null): string | null {
  if (!gateway) return null
  const receipt = gateway.mpesa_receipt_number
  return typeof receipt === 'string' && receipt.trim() ? receipt.trim() : null
}

function formatAddressLines(address: OrderDetail['shippingAddress']): string[] {
  if (!address) return ['—']
  const lines: string[] = []
  const name = `${address.firstName} ${address.lastName}`.trim()
  if (name) lines.push(name)
  if (address.company?.trim()) lines.push(address.company.trim())
  lines.push(address.address1)
  if (address.address2?.trim()) lines.push(address.address2.trim())
  const cityLine = [
    address.city,
    address.state ? `${address.state}` : '',
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ')
  if (cityLine) lines.push(cityLine)
  if (address.country) lines.push(address.country)
  if (address.phone?.trim()) lines.push(address.phone.trim())
  return lines
}

function resolvePaymentMethodLabel(method: PaymentMethod | string | null | undefined): string {
  if (!method) return 'Unspecified'
  const upper = method.toUpperCase() as PaymentMethod
  return PAYMENT_METHOD_LABELS[upper] ?? method.replace(/_/g, ' ')
}

export function buildInvoiceDocumentData(
  order: OrderDetail,
  settings: StoreSettings | null | undefined,
  website = 'https://www.tacaccessories.co.ke'
): InvoiceDocumentData {
  const storeName = settings?.storeName?.trim() || 'TAC Accessories'
  const storeTagline = settings?.storeTagline?.trim() || 'The African Gallery Experience'
  const storeAddress = settings?.address?.trim() || 'Nairobi, Kenya'
  const { email: storeEmail, phone: storePhone } = getStoreContactDetails({
    salesEmail: settings?.salesEmail,
    supportEmail: settings?.supportEmail,
    whatsappNumber: settings?.whatsappNumber,
  })

  const shipping = order.shippingAddress
  const billToName = shipping
    ? `${shipping.firstName} ${shipping.lastName}`.trim()
    : order.user?.name?.trim() || 'Customer'
  const billToEmail = order.user?.email?.trim() || ''
  const billToPhone = shipping?.phone?.trim() || null

  const latestPayment = order.payments[0] ?? null
  const gateway = parseGatewayResponse(latestPayment?.gatewayResponse)
  const receiptNumber = extractReceiptNumber(gateway)
  const transactionId = latestPayment?.transactionId?.trim() || null

  const paymentMethodLabel = resolvePaymentMethodLabel(
    latestPayment?.method ?? (order.paymentMethod as PaymentMethod | null)
  )
  const paymentStatus = latestPayment?.status ?? order.paymentStatus
  const paymentStatusTone = mapPaymentStatusTone(paymentStatus)

  return {
    orderId: order.id,
    invoiceNumber: order.orderNumber,
    issueDate: dateFormatter.format(new Date(order.createdAt)),
    currency: 'KES',
    paymentStatusLabel: formatPaymentStatus(paymentStatus),
    paymentStatusTone,
    store: {
      name: storeName,
      tagline: storeTagline,
      email: storeEmail,
      phone: storePhone,
      address: storeAddress,
      website,
    },
    billTo: {
      name: billToName,
      email: billToEmail,
      phone: billToPhone,
    },
    shipTo: {
      lines: formatAddressLines(shipping),
    },
    payment: {
      methodLabel: paymentMethodLabel,
      statusLabel: formatPaymentStatus(paymentStatus),
      statusTone: paymentStatusTone,
      transactionId,
      receiptNumber,
    },
    lineItems: order.items.map((item, index) => ({
      index: index + 1,
      description: item.product?.name ?? 'Product',
      sku: item.product?.sku?.trim() || '—',
      quantity: item.quantity,
      unitPrice: formatInvoiceKes(item.price),
      lineTotal: formatInvoiceKes(item.price * item.quantity),
    })),
    totals: {
      subtotal: formatInvoiceKes(order.subtotal),
      shipping: formatInvoiceKes(order.shipping),
      tax: formatInvoiceKes(order.tax),
      total: formatInvoiceKes(order.total),
    },
  }
}
