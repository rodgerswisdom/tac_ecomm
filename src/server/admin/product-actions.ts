"use server"

import { Prisma, ProductType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { buildAdminFlashUrl } from "@/lib/admin/feedback"
import { assertAdmin } from "./auth"
import {
  productInputSchema,
  productUpdateSchema,
  collectFormValues,
  optionalString,
  optionalNumber,
  booleanFromForm,
  buildFieldErrors,
  validateMediaPayload,
  resolveProductSlug,
  resolveProductSku,
  SkuConflictError,
  generateDuplicateSku,
  variantSchema,
  imageSchema,
} from "./products"
import type { CreateProductFormState } from "./products"
import { logAdminAction } from "./audit"
import { queueProductSync } from "@/lib/zoho"
import { archiveFieldsForStock, syncProductArchiveForStock } from "@/lib/admin/product-archive"

export async function createProductAction(
  _prevState: CreateProductFormState,
  formData: FormData
): Promise<CreateProductFormState> {
  await assertAdmin()

  const intentValue = formData.get("intent")?.toString()
  const intent = intentValue === "draft" ? "draft" : "publish"
  const isDraft = intent === "draft"
  const isActive = !isDraft
  const formValues = collectFormValues(formData)
  const proposedSlug = optionalString(formData.get("customSlug"))

  const payload = {
    name: formValues.name,
    description: formValues.description,
    shortDescription: optionalString(formData.get("shortDescription")),
    price: formData.get("price"),
    comparePrice: optionalString(formData.get("comparePrice")),
    stock: formData.get("stock"),
    sku: formValues.sku,
    categoryId: formValues.categoryId,
    productType: (formValues.productType as ProductType) || ProductType.READY_TO_WEAR,
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
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid product data",
      fieldErrors: buildFieldErrors(parsed.error.issues),
      values: formValues,
    }
  }

  const mediaValidation = validateMediaPayload(formData.get("mediaPayload"))
  if (!mediaValidation.success) {
    return {
      status: "error",
      message: mediaValidation.error,
      fieldErrors: { media: mediaValidation.error },
      values: formValues,
    }
  }

  const slug = await resolveProductSlug(parsed.data.name, proposedSlug)

  let sku: string
  try {
    sku = await resolveProductSku(parsed.data.name, parsed.data.sku.trim() || undefined)
  } catch (error) {
    if (error instanceof SkuConflictError) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: { sku: error.message },
        values: formValues,
      }
    }
    if (error instanceof Error && error.message === "Unable to generate product SKU") {
      return {
        status: "error",
        message: error.message,
        fieldErrors: { sku: "Enter a product name or SKU to continue." },
        values: formValues,
      }
    }
    throw error
  }

  let created: { id: string; name: string }
  try {
    created = await prisma.product.create({
      data: {
        ...parsed.data,
        ...archiveFieldsForStock(parsed.data.stock, isDraft),
        sku,
        shortDescription: parsed.data.shortDescription ?? null,
        materials: [],
        slug,
        isDraft,
      },
      select: { id: true, name: true },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "SKU already exists. Please use a unique SKU.",
        fieldErrors: { sku: "SKU already exists. Please use a unique SKU." },
        values: formValues,
      }
    }
    throw error
  }

  await prisma.productImage.createMany({
    data: mediaValidation.items.map((asset, index) => ({
      productId: created.id,
      url: asset.url,
      alt: `${created.name} image ${index + 1}`,
      order: index,
    })),
  })

  // Queue Zoho sync for published products
  if (!isDraft && process.env.ZOHO_SYNC_ENABLED === 'true') {
    try {
      await queueProductSync(created.id, 'create')
    } catch (error) {
      console.error('Failed to queue product sync:', error)
      // Don't fail the product creation if sync queueing fails
    }
  }

  revalidateProductRoute(created.id)

  const message = isDraft
    ? "Draft saved successfully."
    : "Product published successfully and is now live."
  redirect(
    buildAdminFlashUrl(`/admin/products/${created.id}`, { type: "success", message })
  )
}

export async function updateProductAction(formData: FormData) {
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
    weight: optionalNumber(formData.get("weight")),
    dimensions: optionalString(formData.get("dimensions")),
  }

  const parsed = productUpdateSchema.safeParse(payload)

  if (!parsed.success || !parsed.data.id) {
    throw new Error(parsed.success ? "Product id is required" : parsed.error.issues[0]?.message)
  }

  const slug = await resolveProductSlug(parsed.data.name, undefined, parsed.data.id)

  let sku: string
  try {
    sku = await resolveProductSku(parsed.data.name, parsed.data.sku, parsed.data.id)
  } catch (error) {
    if (error instanceof SkuConflictError) {
      throw new Error(error.message)
    }
    if (error instanceof Error && error.message === "Unable to generate product SKU") {
      throw new Error("Enter a product name or SKU to continue.")
    }
    throw error
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: parsed.data.id },
      select: { stock: true, isArchived: true },
    })

    if (!existing) {
      throw new Error("Product not found")
    }

    const stockJustDepleted = existing.stock > 0 && parsed.data.stock <= 0
    const archiveUpdate = stockJustDepleted
      ? archiveFieldsForStock(parsed.data.stock, false)
      : {}

    const updated = await prisma.product.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        comparePrice: parsed.data.comparePrice ?? null,
        stock: parsed.data.stock,
        categoryId: parsed.data.categoryId,
        weight: parsed.data.weight ?? null,
        dimensions: parsed.data.dimensions ?? null,
        ...archiveUpdate,
        sku,
        slug,
      },
      select: { id: true, isActive: true, isDraft: true, isArchived: true, zohoItemId: true },
    })

    // Queue Zoho sync for active products that are already synced
    if (
      updated.isActive &&
      !updated.isDraft &&
      !updated.isArchived &&
      updated.zohoItemId &&
      process.env.ZOHO_SYNC_ENABLED === "true"
    ) {
      try {
        await queueProductSync(updated.id, 'update')
      } catch (error) {
        console.error('Failed to queue product sync:', error)
        // Don't fail the product update if sync queueing fails
      }
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("SKU already exists. Please use a unique SKU.")
    }
    throw error
  }

  revalidateProductRoute(parsed.data.id)
}

export async function deleteProductAction(formData: FormData) {
  await assertAdmin()

  const productId = formData.get("productId")?.toString()

  if (!productId) {
    throw new Error("Product id is required")
  }

  try {
    await prisma.product.delete({ where: { id: productId } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      // Idempotent delete: product already removed (stale UI / double-submit).
      revalidateProductRoute(productId)
      return
    }
    throw error
  }
  revalidateProductRoute(productId)
}

export async function duplicateProductAction(formData: FormData) {
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
      isDraft: true,
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
  await assertAdmin()

  const productId = formData.get("productId")?.toString()

  if (!productId) {
    throw new Error("Product id is required")
  }

  await prisma.product.update({
    where: { id: productId },
    data: { isArchived: true, isActive: false },
  })

  revalidateProductRoute(productId)
}

export async function unarchiveProductAction(formData: FormData) {
  await assertAdmin()

  const productId = formData.get("productId")?.toString()

  if (!productId) {
    throw new Error("Product id is required")
  }

  await prisma.product.update({
    where: { id: productId },
    data: { isArchived: false, isActive: true },
  })

  revalidateProductRoute(productId)
}

export async function bulkArchiveProducts(
  ids: string[]
): Promise<{ success?: boolean; error?: string }> {
  await assertAdmin()
  if (ids.length === 0) return { success: true }
  try {
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isArchived: true, isActive: false },
    })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to archive" }
  }
}

export async function bulkUnarchiveProducts(
  ids: string[]
): Promise<{ success?: boolean; error?: string }> {
  await assertAdmin()
  if (ids.length === 0) return { success: true }
  try {
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isArchived: false, isActive: true },
    })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to restore products" }
  }
}

export async function bulkDeleteProducts(
  ids: string[]
): Promise<{ success?: boolean; error?: string }> {
  await assertAdmin()
  if (ids.length === 0) return { success: true }
  try {
    for (const id of ids) {
      try {
        await prisma.product.delete({ where: { id } })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          // Skip missing rows so bulk actions stay resilient.
          continue
        }
        throw error
      }
    }
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete" }
  }
}

export async function addVariantAction(formData: FormData) {
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
  await assertAdmin()

  const variantId = formData.get("variantId")?.toString()

  if (!variantId) {
    throw new Error("Variant id is required")
  }

  const deleted = await prisma.productVariant.delete({ where: { id: variantId }, select: { productId: true } })
  revalidateProductRoute(deleted.productId)
}

export async function addProductImageAction(formData: FormData) {
  await assertAdmin()

  const url = formData.get("url")?.toString()?.trim() ?? ""
  if (!url) {
    throw new Error("Please upload an image or enter an image URL.")
  }

  const parsed = imageSchema.safeParse({
    productId: formData.get("productId")?.toString(),
    url,
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
  await assertAdmin()

  const imageId = formData.get("imageId")?.toString()
  if (!imageId) {
    throw new Error("Image id is required")
  }

  const deleted = await prisma.productImage.delete({ where: { id: imageId }, select: { productId: true } })
  revalidateProductRoute(deleted.productId)
}

export async function reorderImagesAction(productId: string, imageIds: string[]): Promise<void> {
  await assertAdmin()
  if (!productId || !Array.isArray(imageIds) || imageIds.length === 0) return
  await prisma.$transaction(
    imageIds.map((id, index) =>
      prisma.productImage.update({ where: { id, productId }, data: { order: index } })
    )
  )
  revalidateProductRoute(productId)
}

function revalidateProductRoute(productId?: string) {
  revalidatePath("/admin/products")
  if (productId) {
    revalidatePath(`/admin/products/${productId}`)
  }
}

export async function generateSkuAction(name: string): Promise<{ sku: string } | { error: string }> {
  await assertAdmin()

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { error: "Enter a product name to generate a SKU." }
  }

  try {
    const sku = await resolveProductSku(trimmedName)
    return { sku }
  } catch (error) {
    if (error instanceof Error && error.message === "Unable to generate product SKU") {
      return { error: error.message }
    }
    throw error
  }
}
