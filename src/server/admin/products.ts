import { Prisma, ProductType } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import { getCloudinaryConfig } from "@/lib/cloudinary"

export const productInputSchema = z.object({
    id: z.string().cuid().optional(),
    name: z.string().min(2, "Name is required"),
    description: z.string().min(10, "Description is required"),
    shortDescription: z.string().max(240).optional().nullable(),
    price: z.coerce.number().positive(),
    comparePrice: z.coerce.number().positive().optional().nullable(),
    stock: z.coerce.number().int().nonnegative(),
    sku: z.string().min(1, "SKU is required"),
    categoryId: z.string().min(1, "Category is required"),
    productType: z.nativeEnum(ProductType).default(ProductType.READY_TO_WEAR),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isBespoke: z.boolean().default(false),
    isCorporateGift: z.boolean().default(false),
    artisanId: z.string().optional().nullable(),
    weight: z.coerce.number().nonnegative().optional().nullable(),
    dimensions: z.string().max(120).optional().nullable(),
})

export const variantSchema = z.object({
    productId: z.string().cuid(),
    name: z.string().min(1),
    value: z.string().min(1),
    price: z.coerce.number().nonnegative().optional(),
    stock: z.coerce.number().int().nonnegative().optional().default(0),
    sku: z.string().optional().nullable(),
})

export const imageSchema = z.object({
    productId: z.string().cuid(),
    url: z.string().url(),
    alt: z.string().optional().nullable(),
    order: z.coerce.number().int().nonnegative().optional().default(0),
})

export type ProductSortOption = "recent" | "priceAsc" | "priceDesc" | "stockAsc" | "stockDesc"

export type ProductListFilters = {
    search?: string
    categoryId?: string
    page?: number
    pageSize?: number
    sort?: ProductSortOption
}

const formValueFields = [
    "name",
    "sku",
    "description",
    "shortDescription",
    "categoryId",
    "price",
    "comparePrice",
    "stock",
    "productType",
    "artisanId",
    "weight",
    "dimensions",
    "customSlug",
] as const

const extraErrorFields = ["media"] as const

type FormValueField = (typeof formValueFields)[number]
type ProductFormField = FormValueField | (typeof extraErrorFields)[number]
export type ProductFormValues = Record<FormValueField, string>

export type CreateProductFormState = {
    status: "idle" | "error"
    message?: string
    fieldErrors: Partial<Record<ProductFormField, string>>
    values: ProductFormValues
}

export const createProductInitialState: CreateProductFormState = {
    status: "idle",
    fieldErrors: {},
    values: formValueFields.reduce<ProductFormValues>((acc, field) => {
        acc[field] = ""
        return acc
    }, {} as ProductFormValues),
}

const MAX_MEDIA_BYTES = 6 * 1024 * 1024
const ALLOWED_MEDIA_FORMATS = ["jpg", "jpeg", "png", "gif", "webp"]

function resolveProductSort(
    sort?: ProductSortOption
): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
        case "priceAsc":
            return { price: "asc" }
        case "priceDesc":
            return { price: "desc" }
        case "stockAsc":
            return [{ stock: "asc" }, { updatedAt: "desc" }]
        case "stockDesc":
            return [{ stock: "desc" }, { updatedAt: "desc" }]
        case "recent":
        default:
            return { updatedAt: "desc" }
    }
}

export async function getProductList(filters: ProductListFilters = {}) {
    const page = Math.max(filters.page ?? 1, 1)
    const pageSize = Math.min(filters.pageSize ?? 10, 50)
    const orderBy = resolveProductSort(filters.sort)

    const whereFilters: Prisma.ProductWhereInput[] = []

    if (filters.search) {
        whereFilters.push({
            OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { sku: { contains: filters.search, mode: "insensitive" } },
            ],
        })
    }

    if (filters.categoryId) {
        whereFilters.push({ categoryId: filters.categoryId })
    }

    const where = whereFilters.length ? { AND: whereFilters } : undefined

    const [items, total] = await prisma.$transaction([
        prisma.product.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                category: { select: { name: true } },
                images: { orderBy: { order: "asc" }, take: 1 },
                _count: { select: { variants: true, images: true, orderItems: true } },
            },
        }),
        prisma.product.count({ where }),
    ])

    return {
        items,
        total,
        page,
        pageSize,
        sort: filters.sort ?? "recent",
        pageCount: Math.ceil(total / pageSize),
    }
}

export async function getProductDetail(productId: string) {
    return prisma.product.findUnique({
        where: { id: productId },
        include: {
            category: true,
            variants: { orderBy: { name: "asc" } },
            images: { orderBy: { order: "asc" } },
        },
    })
}

export async function resolveProductSlug(name: string, proposedSlug?: string, existingId?: string) {
    const base = generateSlug(proposedSlug || name)
    if (!base) {
        throw new Error("Unable to generate product slug")
    }

    let suffix = 0
    let candidate = base

    while (true) {
        const match = await prisma.product.findUnique({ where: { slug: candidate } })
        if (!match || match.id === existingId) {
            return candidate
        }
        suffix += 1
        candidate = `${base}-${suffix}`
    }
}

export async function generateDuplicateSku(baseSku: string) {
    const sanitized = baseSku.replace(/\s+/g, "-").toUpperCase()
    let attempt = 0

    while (attempt < 5) {
        const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
        const candidate = `${sanitized}-COPY-${suffix}`
        const existing = await prisma.product.findUnique({ where: { sku: candidate } })
        if (!existing) {
            return candidate
        }
        attempt += 1
    }

    return `${sanitized}-COPY-${Date.now().toString(36).toUpperCase()}`
}

export function booleanFromForm(value: FormDataEntryValue | null) {
    if (value == null) return false
    const normalized = value.toString().toLowerCase()
    return normalized === "true" || normalized === "on" || normalized === "1"
}

export function optionalString(value: FormDataEntryValue | null) {
    if (value == null) return undefined
    const trimmed = value.toString().trim()
    return trimmed.length > 0 ? trimmed : undefined
}

export function optionalNumber(value: FormDataEntryValue | null) {
    const raw = optionalString(value)
    if (raw == null) return undefined
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : undefined
}

export function collectFormValues(formData: FormData): ProductFormValues {
    return formValueFields.reduce<ProductFormValues>((acc, field) => {
        acc[field] = formData.get(field)?.toString() ?? ""
        return acc
    }, {} as ProductFormValues)
}

export function buildFieldErrors(issues: z.ZodIssue[]): Partial<Record<ProductFormField, string>> {
    return issues.reduce<Partial<Record<ProductFormField, string>>>((acc, issue) => {
        const field = issue.path[0]
        if (typeof field === "string" && (formValueFields as readonly string[]).includes(field)) {
            acc[field as ProductFormField] = issue.message
        }
        return acc
    }, {})
}

type MediaPayloadEntry = {
    url: string
    publicId: string
    bytes?: number
    format?: string
    width?: number
    height?: number
}

type MediaValidationResult =
    | { success: true; items: MediaPayloadEntry[] }
    | { success: false; error: string }

export function validateMediaPayload(raw: FormDataEntryValue | null): MediaValidationResult {
    if (!raw) {
        return { success: false, error: "Upload at least one product image." }
    }

    let parsed: unknown
    try {
        parsed = JSON.parse(raw.toString())
    } catch {
        return { success: false, error: "Image payload is malformed. Please re-upload your files." }
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
        return { success: false, error: "Upload at least one product image." }
    }

    const config = getCloudinaryConfig()
    const validated: MediaPayloadEntry[] = []
    const seen = new Set<string>()

    for (const entry of parsed) {
        if (!entry || typeof entry !== "object") {
            return { success: false, error: "One of the images is invalid. Please remove it and try again." }
        }

        const { url, publicId, bytes, format, width, height } = entry as MediaPayloadEntry

        if (!url || typeof url !== "string" || !url.startsWith("https://")) {
            return { success: false, error: "Images must be uploaded through Cloudinary." }
        }

        try {
            const parsedUrl = new URL(url)
            if (parsedUrl.hostname !== "res.cloudinary.com") {
                return { success: false, error: "Images must come from Cloudinary uploads." }
            }
            if (config.cloudName && !parsedUrl.pathname.startsWith(`/${config.cloudName}/`)) {
                return { success: false, error: "Unrecognized Cloudinary account for this upload." }
            }
        } catch {
            return { success: false, error: "One of the uploaded image URLs is invalid." }
        }

        if (!publicId || typeof publicId !== "string") {
            return { success: false, error: "Missing Cloudinary asset ID. Please re-upload the image." }
        }

        if (seen.has(publicId)) {
            continue
        }

        if (typeof bytes !== "number" || bytes <= 0 || bytes > MAX_MEDIA_BYTES) {
            return { success: false, error: "Images must be under 6 MB." }
        }

        if (!format || typeof format !== "string" || !ALLOWED_MEDIA_FORMATS.includes(format.toLowerCase())) {
            return { success: false, error: "Only JPG, PNG, GIF, or WEBP images are allowed." }
        }

        if (typeof width !== "number" || typeof height !== "number" || width <= 0 || height <= 0) {
            return { success: false, error: "Image metadata is incomplete. Please upload again." }
        }

        validated.push({ url, publicId, bytes, format, width, height })
        seen.add(publicId)
    }

    if (validated.length === 0) {
        return { success: false, error: "Please keep at least one uploaded image." }
    }

    return { success: true, items: validated }
}


