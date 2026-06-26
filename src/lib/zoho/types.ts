/**
 * Zoho Books API Type Definitions
 * Based on Zoho Books API v3 documentation
 */

// ============================================
// COMMON TYPES
// ============================================

export interface ZohoResponse<T> {
  code: number
  message: string
  [key: string]: T | number | string
}

export interface ZohoPaginatedResponse<T> {
  code: number
  message: string
  page_context: {
    page: number
    per_page: number
    has_more_page: boolean
    report_name?: string
    applied_filter?: string
    sort_column?: string
    sort_order?: string
  }
  [key: string]: T[] | number | string | object
}

// ============================================
// CONTACT (CUSTOMER) TYPES
// ============================================

export interface ZohoContact {
  contact_id: string
  contact_name: string
  company_name?: string
  contact_type: 'customer' | 'vendor'
  customer_sub_type?: string
  email: string
  phone?: string
  mobile?: string
  website?: string
  billing_address?: ZohoAddress
  shipping_address?: ZohoAddress
  currency_id?: string
  currency_code?: string
  payment_terms?: number
  payment_terms_label?: string
  notes?: string
  created_time: string
  last_modified_time: string
}

export interface ZohoAddress {
  address: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  fax?: string
}

export interface CreateContactPayload {
  contact_name: string
  company_name?: string
  contact_type?: 'customer'
  email?: string
  phone?: string
  mobile?: string
  billing_address?: Partial<ZohoAddress>
  shipping_address?: Partial<ZohoAddress>
  notes?: string
}

// ============================================
// ITEM (PRODUCT) TYPES
// ============================================

export interface ZohoItem {
  item_id: string
  name: string
  sku?: string
  description?: string
  rate: number
  unit?: string
  tax_id?: string
  tax_name?: string
  tax_percentage?: number
  item_type: 'sales' | 'purchases' | 'sales_and_purchases' | 'inventory'
  product_type?: 'goods' | 'service'
  is_taxable: boolean
  tax_exemption_id?: string
  account_id?: string
  account_name?: string
  purchase_account_id?: string
  purchase_account_name?: string
  inventory_account_id?: string
  inventory_account_name?: string
  vendor_id?: string
  vendor_name?: string
  reorder_level?: number
  initial_stock?: number
  initial_stock_rate?: number
  stock_on_hand?: number
  available_stock?: number
  actual_available_stock?: number
  committed_stock?: number
  actual_committed_stock?: number
  available_for_sale_stock?: number
  actual_available_for_sale_stock?: number
  status: 'active' | 'inactive'
  created_time: string
  last_modified_time: string
}

export interface CreateItemPayload {
  name: string
  sku?: string
  description?: string
  rate: number
  unit?: string
  item_type?: 'sales' | 'inventory'
  product_type?: 'goods'
  is_taxable?: boolean
  tax_id?: string
  initial_stock?: number
  initial_stock_rate?: number
  reorder_level?: number
}

export interface UpdateItemPayload extends Partial<CreateItemPayload> {
  item_id: string
}

// ============================================
// SALES ORDER TYPES
// ============================================

export interface ZohoSalesOrder {
  salesorder_id: string
  salesorder_number: string
  reference_number?: string
  date: string
  shipment_date?: string
  delivery_date?: string
  customer_id: string
  customer_name: string
  email?: string
  company_name?: string
  status: 'draft' | 'open' | 'invoiced' | 'void'
  color_code?: string
  current_sub_status_id?: string
  current_sub_status?: string
  line_items: ZohoLineItem[]
  sub_total: number
  discount?: number
  discount_amount?: number
  tax_total: number
  shipping_charge?: number
  adjustment?: number
  adjustment_description?: string
  total: number
  payment_terms?: number
  payment_terms_label?: string
  currency_id?: string
  currency_code?: string
  exchange_rate?: number
  notes?: string
  terms?: string
  billing_address?: ZohoAddress
  shipping_address?: ZohoAddress
  created_time: string
  last_modified_time: string
}

export interface ZohoLineItem {
  line_item_id?: string
  item_id: string
  name?: string
  description?: string
  rate: number
  quantity: number
  unit?: string
  discount?: number
  discount_amount?: number
  tax_id?: string
  tax_name?: string
  tax_type?: string
  tax_percentage?: number
  item_total: number
}

export interface CreateSalesOrderPayload {
  customer_id: string
  salesorder_number?: string
  reference_number?: string
  date: string
  shipment_date?: string
  line_items: Array<{
    item_id: string
    quantity: number
    rate: number
    discount?: number
    tax_id?: string
  }>
  notes?: string
  terms?: string
  shipping_charge?: number
  adjustment?: number
  adjustment_description?: string
}

// ============================================
// INVOICE TYPES
// ============================================

export interface ZohoInvoice {
  invoice_id: string
  invoice_number: string
  date: string
  due_date?: string
  payment_terms?: number
  payment_terms_label?: string
  customer_id: string
  customer_name: string
  email?: string
  status: 'draft' | 'sent' | 'viewed' | 'overdue' | 'paid' | 'void' | 'unpaid' | 'partially_paid'
  color_code?: string
  current_sub_status_id?: string
  current_sub_status?: string
  line_items: ZohoLineItem[]
  sub_total: number
  discount?: number
  discount_amount?: number
  tax_total: number
  shipping_charge?: number
  adjustment?: number
  adjustment_description?: string
  total: number
  balance: number
  payment_made?: number
  currency_id?: string
  currency_code?: string
  exchange_rate?: number
  notes?: string
  terms?: string
  billing_address?: ZohoAddress
  shipping_address?: ZohoAddress
  salesorder_id?: string
  salesorder_number?: string
  created_time: string
  last_modified_time: string
}

export interface CreateInvoiceFromSalesOrderPayload {
  salesorder_id: string
}

export interface CreateInvoicePayload {
  customer_id: string
  invoice_number?: string
  reference_number?: string
  date: string
  due_date?: string
  payment_terms?: number
  line_items: Array<{
    item_id: string
    quantity: number
    rate: number
    discount?: number
    tax_id?: string
  }>
  notes?: string
  terms?: string
  shipping_charge?: number
  adjustment?: number
  adjustment_description?: string
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface ZohoPayment {
  payment_id: string
  payment_number: string
  date: string
  payment_mode: string
  amount: number
  bank_charges?: number
  tax_amount_withheld?: number
  description?: string
  reference_number?: string
  exchange_rate?: number
  customer_id: string
  customer_name: string
  email?: string
  currency_id?: string
  currency_code?: string
  invoices: Array<{
    invoice_id: string
    invoice_number: string
    invoice_amount: number
    amount_applied: number
    balance_amount: number
    date: string
    due_date: string
  }>
  created_time: string
  last_modified_time: string
}

export interface CreatePaymentPayload {
  customer_id: string
  payment_mode: string
  amount: number
  date: string
  reference_number?: string
  description?: string
  invoices: Array<{
    invoice_id: string
    amount_applied: number
  }>
  bank_charges?: number
  tax_amount_withheld?: number
}

// ============================================
// STOCK ADJUSTMENT TYPES
// ============================================

export interface ZohoStockAdjustment {
  adjustment_id: string
  adjustment_number: string
  date: string
  reason?: string
  description?: string
  line_items: Array<{
    item_id: string
    item_name: string
    sku?: string
    quantity_adjusted: number
    warehouse_id?: string
    warehouse_name?: string
  }>
  created_time: string
  last_modified_time: string
}

// ============================================
// ERROR TYPES
// ============================================

export interface ZohoError {
  code: number
  message: string
  errors?: Array<{
    code: string
    message: string
    field?: string
  }>
}

