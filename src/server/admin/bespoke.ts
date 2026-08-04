'use server'

import { BespokeRequestStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { assertAdmin } from '@/server/admin/auth'

export type BespokeFilters = {
  status?: BespokeRequestStatus
  search?: string
  page?: number
  pageSize?: number
}

export async function getBespokeRequests(filters: BespokeFilters = {}) {
  await assertAdmin()
  const page = Math.max(filters.page ?? 1, 1)
  const pageSize = Math.min(filters.pageSize ?? 20, 50)

  const where: { status?: BespokeRequestStatus; OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }> } = {}
  if (filters.status) where.status = filters.status
  if (filters.search?.trim()) {
    const q = filters.search.trim()
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [requests, total] = await Promise.all([
    prisma.bespokeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.bespokeRequest.count({ where }),
  ])

  return {
    requests,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  }
}

export async function getBespokeRequestById(id: string) {
  await assertAdmin()
  return prisma.bespokeRequest.findUnique({
    where: { id },
  })
}

const statusSchema = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'QUOTED', 'COMPLETED', 'CANCELLED'] as const

export async function updateBespokeRequestStatus(
  id: string,
  data: { status: BespokeRequestStatus; adminNotes?: string | null }
) {
  await assertAdmin()
  if (!statusSchema.includes(data.status)) {
    throw new Error('Invalid status')
  }
  return prisma.bespokeRequest.update({
    where: { id },
    data: {
      status: data.status,
      ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes || null }),
    },
  })
}

export async function getBespokeCatalogProducts(filters: {
  search?: string
  page?: number
  pageSize?: number
} = {}) {
  await assertAdmin()
  const page = Math.max(filters.page ?? 1, 1)
  const pageSize = Math.min(filters.pageSize ?? 20, 50)
  const search = filters.search?.trim()

  const where = {
    OR: [{ isBespoke: true }, { productType: "BESPOKE" as const }],
    ...(search
      ? {
          AND: [
            {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { sku: { contains: search, mode: "insensitive" as const } },
              ],
            },
          ],
        }
      : {}),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        stock: true,
        isActive: true,
        isDraft: true,
        isArchived: true,
        isBespoke: true,
        productType: true,
        updatedAt: true,
        images: {
          take: 1,
          orderBy: { order: "asc" },
          select: { url: true },
        },
        category: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize) || 1,
  }
}

export type UpdateBespokeStatusFormState = { status: 'idle' | 'success' | 'error'; message?: string }

export async function updateBespokeStatusAction(
  _prev: UpdateBespokeStatusFormState,
  formData: FormData
): Promise<UpdateBespokeStatusFormState> {
  try {
    await assertAdmin()
    const id = formData.get('id')
    const status = formData.get('status')
    const adminNotes = formData.get('adminNotes')
    if (typeof id !== 'string' || !id || typeof status !== 'string' || !statusSchema.includes(status as BespokeRequestStatus)) {
      return { status: 'error', message: 'Invalid request' }
    }
    await updateBespokeRequestStatus(id, {
      status: status as BespokeRequestStatus,
      adminNotes: adminNotes != null ? String(adminNotes).trim() || null : undefined,
    })
    return { status: 'success', message: 'Request updated' }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update'
    return { status: 'error', message }
  }
}
