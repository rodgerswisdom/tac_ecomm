import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Prisma, ProductType } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"
import { generateSlug } from "@/lib/utils"

const productInputSchema = z.object({
    id: z.string().cuid().optional(),
    name: z.string().min(2, "Name is required"),
    description: z.string().min(10, "Description is required"),
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

const variantSchema = z.object({
    productId: z.string().cuid(),
    name: z.string().min(1),
    value: z.string().min(1),
    price: z.coerce.number().nonnegative().optional(),
    stock: z.coerce.number().int().nonnegative().optional().default(0),
    sku: z.string().optional().nullable(),
})

const imageSchema = z.object({
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

async function resolveProductSlug(name: string, proposedSlug?: string, existingId?: string) {
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

async function generateDuplicateSku(baseSku: string) {
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

function booleanFromForm(value: FormDataEntryValue | null) {
    if (value == null) return false
    const normalized = value.toString().toLowerCase()
    return normalized === "true" || normalized === "on" || normalized === "1"
}

function optionalString(value: FormDataEntryValue | null) {
    if (value == null) return undefined
    const trimmed = value.toString().trim()
    return trimmed.length > 0 ? trimmed : undefined
}

function optionalNumber(value: FormDataEntryValue | null) {
    const raw = optionalString(value)
    if (raw == null) return undefined
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : undefined
}

function parseGalleryUrls(value: FormDataEntryValue | null) {
    const raw = optionalString(value)
    if (!raw) return []

    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
            return parsed.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
        }
    } catch {
        if (raw.startsWith("http")) {
            return [raw]
        }
    }

    return []
}

function revalidateProductRoute(productId?: string) {
    revalidatePath("/admin/products")
    if (productId) {
        revalidatePath(`/admin/products/${productId}`)
    }
}

export async function createProductAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const intent = formData.get("intent")?.toString()
    const isActive = intent ? intent === "publish" : booleanFromForm(formData.get("isActive"))
    const primaryImageUrl = optionalString(formData.get("primaryImageUrl"))
    const galleryImageUrls = parseGalleryUrls(formData.get("galleryImageUrls"))

    const payload = {
        name: formData.get("name")?.toString() ?? "",
        description: formData.get("description")?.toString() ?? "",
        price: formData.get("price"),
        comparePrice: optionalString(formData.get("comparePrice")),
        stock: formData.get("stock"),
        sku: formData.get("sku")?.toString() ?? "",
        categoryId: formData.get("categoryId")?.toString() ?? "",
        productType: (formData.get("productType") as ProductType) || ProductType.READY_TO_WEAR,
        isActive,
        isFeatured: booleanFromForm(formData.get("isFeatured")),
        isBespoke: booleanFromForm(formData.get("isBespoke")),
        isCorporateGift: booleanFromForm(formData.get("isCorporateGift")),
        artisanId: optionalString(formData.get("artisanId")),
        weight: optionalNumber(formData.get("weight")),
        dimensions: optionalString(formData.get("dimensions")),
    }

    const parsed = productInputSchema.safeParse(payload)

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid product data")
    }

    const slug = await resolveProductSlug(parsed.data.name)

    const created = await prisma.product.create({
        data: {
            ...parsed.data,
            slug,
        },
    })

    const imageUrls = Array.from(
        new Set([...(primaryImageUrl ? [primaryImageUrl] : []), ...galleryImageUrls])
    )

    if (imageUrls.length > 0) {
        await prisma.productImage.createMany({
            data: imageUrls.map((url, index) => ({
                productId: created.id,
                url,
                alt: `${created.name} image ${index + 1}`,
                order: index,
            })),
        })
    }

    revalidateProductRoute(created.id)

    const statusParam = intent === "publish" ? "published" : "draft"
    redirect(`/admin/products/${created.id}?status=${statusParam}`)
}

export async function updateProductAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const payload = {
        id: formData.get("id")?.toString(),
        name: formData.get("name")?.toString() ?? "",
        description: formData.get("description")?.toString() ?? "",
        price: formData.get("price"),
        comparePrice: optionalString(formData.get("comparePrice")),
        stock: formData.get("stock"),
        sku: formData.get("sku")?.toString() ?? "",
        categoryId: formData.get("categoryId")?.toString() ?? "",
        productType: (formData.get("productType") as ProductType) || ProductType.READY_TO_WEAR,
        isActive: booleanFromForm(formData.get("isActive")),
        isFeatured: booleanFromForm(formData.get("isFeatured")),
        isBespoke: booleanFromForm(formData.get("isBespoke")),
        isCorporateGift: booleanFromForm(formData.get("isCorporateGift")),
        artisanId: optionalString(formData.get("artisanId")),
        weight: optionalNumber(formData.get("weight")),
        dimensions: optionalString(formData.get("dimensions")),
    }

    const parsed = productInputSchema.safeParse(payload)

    if (!parsed.success || !parsed.data.id) {
        throw new Error(parsed.success ? "Product id is required" : parsed.error.issues[0]?.message)
    }

    const slug = await resolveProductSlug(parsed.data.name, undefined, parsed.data.id)

    await prisma.product.update({
        where: { id: parsed.data.id },
        data: {
            ...parsed.data,
            slug,
        },
    })

    revalidateProductRoute(parsed.data.id)
}

export async function deleteProductAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const productId = formData.get("productId")?.toString()

    if (!productId) {
        throw new Error("Product id is required")
    }

    try {
        await prisma.product.delete({ where: { id: productId } })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            throw new Error("Product cannot be deleted while linked to orders or cart items")
        }
        throw error
    }
    revalidateProductRoute(productId)
}

export async function duplicateProductAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const productId = formData.get("productId")?.toString()

    if (!productId) {
        throw new Error("Product id is required")
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true },
    })

    if (!product) {
        throw new Error("Product not found")
    }

    const duplicateName = `${product.name} Copy`
    const slug = await resolveProductSlug(duplicateName)
    const sku = await generateDuplicateSku(product.sku)

    const duplicated = await prisma.product.create({
        data: {
            name: duplicateName,
            slug,
            description: product.description,
            shortDescription: product.shortDescription,
            price: product.price,
            comparePrice: product.comparePrice,
            sku,
            stock: product.stock,
            weight: product.weight,
            dimensions: product.dimensions,
            color: product.color,
            size: product.size,
            isActive: false,
            isFeatured: product.isFeatured,
            isDigital: product.isDigital,
            isBespoke: product.isBespoke,
            isCorporateGift: product.isCorporateGift,
            productType: product.productType,
            categoryId: product.categoryId,
            artisanId: product.artisanId,
            communityImpact: product.communityImpact,
            sourcingStory: product.sourcingStory,
            materials: product.materials,
            origin: product.origin,
            subcategory: product.subcategory,
        },
    })

    if (product.images.length > 0) {
        await prisma.productImage.createMany({
            data: product.images.map((image) => ({
                productId: duplicated.id,
                url: image.url,
                alt: image.alt,
                order: image.order,
            })),
        })
    }

    revalidateProductRoute(duplicated.id)
}

export async function archiveProductAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const productId = formData.get("productId")?.toString()

    if (!productId) {
        throw new Error("Product id is required")
    }

    await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
    })

    revalidateProductRoute(productId)
}

export async function addVariantAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const parsed = variantSchema.safeParse({
        productId: formData.get("productId")?.toString(),
        name: formData.get("name")?.toString() ?? "",
        value: formData.get("value")?.toString() ?? "",
        price: optionalString(formData.get("price")),
        stock: formData.get("stock") ?? 0,
        sku: formData.get("sku")?.toString() || undefined,
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid variant data")
    }

    await prisma.productVariant.create({ data: parsed.data })
    revalidateProductRoute(parsed.data.productId)
}

export async function deleteVariantAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const variantId = formData.get("variantId")?.toString()

    if (!variantId) {
        throw new Error("Variant id is required")
    }

    const deleted = await prisma.productVariant.delete({ where: { id: variantId }, select: { productId: true } })
    revalidateProductRoute(deleted.productId)
}

export async function addProductImageAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const parsed = imageSchema.safeParse({
        productId: formData.get("productId")?.toString(),
        url: formData.get("url")?.toString() ?? "",
        alt: formData.get("alt")?.toString() || undefined,
        order: formData.get("order") ?? 0,
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid image data")
    }

    await prisma.productImage.create({ data: parsed.data })
    revalidateProductRoute(parsed.data.productId)
}

export async function deleteProductImageAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const imageId = formData.get("imageId")?.toString()
    if (!imageId) {
        throw new Error("Image id is required")
    }

    const deleted = await prisma.productImage.delete({ where: { id: imageId }, select: { productId: true } })
    revalidateProductRoute(deleted.productId)
}
