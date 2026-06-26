/**
 * Zoho Books Contacts (Customers) Service
 * Handles customer synchronization with Zoho Books
 */

import { zohoClient } from '../client'
import { prisma } from '@/lib/prisma'
import type {
  ZohoContact,
  ZohoResponse,
  CreateContactPayload,
  ZohoAddress,
} from '../types'

/**
 * Create contact in Zoho Books
 */
export async function createZohoContact(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
    },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  const defaultAddress = user.addresses[0]

  // Prepare contact payload
  const payload: CreateContactPayload = {
    contact_name: user.name || user.email,
    contact_type: 'customer',
    email: user.email,
  }

  // Add billing/shipping address if available
  if (defaultAddress) {
    const zohoAddress: Partial<ZohoAddress> = {
      address: defaultAddress.address1,
      street2: defaultAddress.address2 || undefined,
      city: defaultAddress.city,
      state: defaultAddress.state,
      zip: defaultAddress.postalCode,
      country: defaultAddress.country,
      phone: defaultAddress.phone || undefined,
    }

    payload.billing_address = zohoAddress
    payload.shipping_address = zohoAddress
  }

  // Create contact in Zoho
  const response = await zohoClient.post<ZohoResponse<{ contact: ZohoContact }>>(
    '/contacts',
    payload
  )

  const zohoContactId = response.contact.contact_id

  // Update user with Zoho ID
  await prisma.user.update({
    where: { id: userId },
    data: {
      zohoContactId,
      zohoSyncStatus: 'synced',
      lastSyncedAt: new Date(),
      syncError: null,
    },
  })

  return zohoContactId
}

/**
 * Update contact in Zoho Books
 */
export async function updateZohoContact(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
    },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  if (!user.zohoContactId) {
    throw new Error(`User not synced to Zoho: ${userId}`)
  }

  const defaultAddress = user.addresses[0]

  // Prepare update payload
  const payload: Partial<CreateContactPayload> = {
    contact_name: user.name || user.email,
    email: user.email,
  }

  if (defaultAddress) {
    const zohoAddress: Partial<ZohoAddress> = {
      address: defaultAddress.address1,
      street2: defaultAddress.address2 || undefined,
      city: defaultAddress.city,
      state: defaultAddress.state,
      zip: defaultAddress.postalCode,
      country: defaultAddress.country,
      phone: defaultAddress.phone || undefined,
    }

    payload.billing_address = zohoAddress
    payload.shipping_address = zohoAddress
  }

  // Update contact in Zoho
  await zohoClient.put<ZohoResponse<{ contact: ZohoContact }>>(
    `/contacts/${user.zohoContactId}`,
    payload
  )

  // Update sync status
  await prisma.user.update({
    where: { id: userId },
    data: {
      zohoSyncStatus: 'synced',
      lastSyncedAt: new Date(),
      syncError: null,
    },
  })
}

/**
 * Get contact from Zoho Books
 */
export async function getZohoContact(contactId: string): Promise<ZohoContact> {
  const response = await zohoClient.get<ZohoResponse<{ contact: ZohoContact }>>(
    `/contacts/${contactId}`
  )
  return response.contact
}

/**
 * Get or create contact (ensures contact exists in Zoho)
 */
export async function ensureZohoContact(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  // If already synced, return existing ID
  if (user.zohoContactId) {
    return user.zohoContactId
  }

  // Create new contact
  return await createZohoContact(userId)
}
