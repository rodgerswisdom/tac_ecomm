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
  updateImageSchema,
} from "./products"
import type { CreateProductFormState } from "./products"
import type { ActionResult } from "@/lib/admin/action-result"
import { logAdminAction } from "./audit"
import { queueProductSync } from "@/lib/zoho"
import { notifyBackInStockIfRestocked } from "@/lib/stock-notify"

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
  const bespokeCatalog = booleanFromForm(formData.get("bespokeCatalog"))
  const returnToRaw = optionalString(formData.get("returnTo"))

  const payload = {
    name: formValues.name,
    description: formValues.description,
    shortDescription: optionalString(formData.get("shortDescription")),
    price: formData.get("price"),
    comparePrice: optionalString(formData.get("comparePrice")),
    stock: formData.get("stock"),
    sku: formValues.sku,
    categoryId: formValues.categoryId,
    productType: bespokeCatalog
      ? ProductType.BESPOKE
      : (formValues.productType as ProductType) || ProductType.READY_TO_WEAR,
    isActive,
    isFeatured: booleanFromForm(formData.get("isFeatured")),
    isBespoke: bespokeCatalog || booleanFromForm(formData.get("isBespoke")),
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
      alt: asset.alt?.trim() || `${created.name} image ${index + 1}`,
      description: asset.description?.trim() || null,
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
    : bespokeCatalog
      ? "Bespoke product published. It appears in Bespoke & Limited Edition only."
      : "Product published successfully and is now live."

  const safeReturnTo =
    returnToRaw &&
    returnToRaw.startsWith("/admin/") &&
    !returnToRaw.startsWith("//")
      ? returnToRaw
      : null

  redirect(
    buildAdminFlashUrl(safeReturnTo ?? `/admin/products/${created.id}`, {
      type: "success",
      message,
    })
  )
}

export async function updateProductAction(formData: FormData): Promise<ActionResult> {
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
    isBespoke: formData.getAll("isBespoke").some((value) => booleanFromForm(value)),
  }

  const parsed = productUpdateSchema.safeParse(payload)

  if (!parsed.success || !parsed.data.id) {
    return {
      error: parsed.success ? "Product id is required" : parsed.error.issues[0]?.message ?? "Invalid product data",
    }
  }

  const slug = await resolveProductSlug(parsed.data.name, undefined, parsed.data.id)

  let sku: string
  try {
    sku = await resolveProductSku(parsed.data.name, parsed.data.sku, parsed.data.id)
  } catch (error) {
    if (error instanceof SkuConflictError) {
      return { error: error.message }
    }
    if (error instanceof Error && error.message === "Unable to generate product SKU") {
      return { error: "Enter a product name or SKU to continue." }
    }
    throw error
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: parsed.data.id },
      select: { stock: true, isArchived: true, productType: true },
    })

    if (!existing) {
      return { error: "Product not found" }
    }

    const nextProductType = resolveProductTypeForBespoke(
      existing.productType,
      parsed.data.isBespoke,
    )

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
        isBespoke: parsed.data.isBespoke,
        productType: nextProductType,
        sku,
        slug,
      },
      select: { id: true, isActive: true, isDraft: true, isArchived: true, zohoItemId: true, stock: true },
    })

    if (existing.stock <= 0 && updated.stock > 0) {
      void notifyBackInStockIfRestocked(updated.id).catch((error) => {
        console.error("Failed to send back-in-stock emails:", error)
      })
    }

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
      return { error: "SKU already exists. Please use a unique SKU." }
    }
    throw error
  }

  revalidateProductRoute(parsed.data.id)
  return { success: true }
}

export async function deleteProductAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const productId = formData.get("productId")?.toString()

  if (!productId) {
    return { error: "Product id is required" }
  }

  try {
    await prisma.product.delete({ where: { id: productId } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      revalidateProductRoute(productId)
      return { success: true }
    }
    console.error(error)
    return { error: "Failed to delete product" }
  }
  revalidateProductRoute(productId)
  return { success: true }
}

export async function duplicateProductAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const productId = formData.get("productId")?.toString()

  if (!productId) {
    return { error: "Product id is required" }
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  })

  if (!product) {
    return { error: "Product not found" }
  }

  try {
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
          description: image.description,
          order: image.order,
        })),
      })
    }

    revalidateProductRoute(duplicated.id)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to duplicate product" }
  }
}

export async function archiveProductAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const productId = formData.get("productId")?.toString()

  if (!productId) {
    return { error: "Product id is required" }
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isArchived: true, isActive: false },
    })
    revalidateProductRoute(productId)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to archive product" }
  }
}

export async function unarchiveProductAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const productId = formData.get("productId")?.toString()

  if (!productId) {
    return { error: "Product id is required" }
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isArchived: false, isActive: true },
    })
    revalidateProductRoute(productId)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to restore product" }
  }
}

/**
 * Move a product into or out of the Bespoke & Limited Edition catalog.
 * Also keeps productType aligned when it is READY_TO_WEAR or BESPOKE.
 */
export async function setProductBespokeAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const productId = formData.get("productId")?.toString()
  const raw = formData.get("isBespoke")?.toString()
  const isBespoke = raw === "true" || raw === "1" || raw === "on"

  if (!productId) {
    return { error: "Product id is required" }
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, productType: true, isBespoke: true, name: true },
    })

    if (!existing) {
      return { error: "Product not found" }
    }

    const productType = resolveProductTypeForBespoke(existing.productType, isBespoke)

    await prisma.product.update({
      where: { id: productId },
      data: { isBespoke, productType },
    })

    await logAdminAction(
      isBespoke ? "MOVE_TO_BESPOKE" : "MOVE_FROM_BESPOKE",
      "Product",
      productId,
      `${existing.name}: isBespoke ${existing.isBespoke} → ${isBespoke}`,
    )

    revalidateProductRoute(productId)
    return {
      success: true,
      message: isBespoke
        ? "Product moved to Bespoke & Limited Edition."
        : "Product moved to regular collections.",
    }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update bespoke status" }
  }
}

function resolveProductTypeForBespoke(current: ProductType, isBespoke: boolean): ProductType {
  if (isBespoke) {
    if (current === ProductType.READY_TO_WEAR || current === ProductType.MATCHING_SET) {
      return ProductType.BESPOKE
    }
    return current
  }

  if (current === ProductType.BESPOKE) {
    return ProductType.READY_TO_WEAR
  }

  return current
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

export async function addVariantAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const parsed = variantSchema.safeParse({
    productId: formData.get("productId")?.toString(),
    name: formData.get("name")?.toString() ?? "",
    value: formData.get("value")?.toString() ?? "",
    price: optionalString(formData.get("price")),
    stock: formData.get("stock") ?? 0,
    sku: formData.get("sku")?.toString() || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid variant data" }
  }

  try {
    await prisma.productVariant.create({ data: parsed.data })
    revalidateProductRoute(parsed.data.productId)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to add variant" }
  }
}

export async function deleteVariantAction(formData: FormData): Promise<ActionResult> {
  try {
    await assertAdmin()
  } catch {
    return { error: "Unauthorized" }
  }

  const variantId = formData.get("variantId")?.toString()

  if (!variantId) {
    return { error: "Variant id is required" }
  }

  try {
    const deleted = await prisma.productVariant.delete({ where: { id: variantId }, select: { productId: true } })
    revalidateProductRoute(deleted.productId)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete variant" }
  }
}

export async function addProductImageAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin()

  const url = formData.get("url")?.toString()?.trim() ?? ""
  if (!url) {
    return { error: "Please upload an image or enter an image URL." }
  }

  const parsed = imageSchema.safeParse({
    productId: formData.get("productId")?.toString(),
    url,
    alt: formData.get("alt")?.toString() || undefined,
    description: formData.get("description")?.toString()?.trim() || undefined,
    order: formData.get("order") ?? 0,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid image data" }
  }

  await prisma.productImage.create({
    data: {
      productId: parsed.data.productId,
      url: parsed.data.url,
      alt: parsed.data.alt ?? null,
      description: parsed.data.description?.trim() || null,
      order: parsed.data.order ?? 0,
    },
  })
  revalidateProductRoute(parsed.data.productId)
  return { success: true }
}

export async function updateProductImageAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin()

  const parsed = updateImageSchema.safeParse({
    imageId: formData.get("imageId")?.toString(),
    alt: formData.get("alt")?.toString() ?? null,
    description: formData.get("description")?.toString() ?? null,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid image data" }
  }

  const alt = parsed.data.alt?.trim() || null
  const description = parsed.data.description?.trim() || null

  const updated = await prisma.productImage.update({
    where: { id: parsed.data.imageId },
    data: { alt, description },
    select: { productId: true },
  })

  revalidateProductRoute(updated.productId)
  return { success: true }
}

export async function deleteProductImageAction(formData: FormData): Promise<ActionResult> {
  await assertAdmin()

  const imageId = formData.get("imageId")?.toString()
  if (!imageId) {
    return { error: "Image id is required" }
  }

  const deleted = await prisma.productImage.delete({ where: { id: imageId }, select: { productId: true } })
  revalidateProductRoute(deleted.productId)
  return { success: true }
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
  revalidatePath("/admin/bespoke")
  revalidatePath("/admin/settings")
  revalidatePath("/collections")
  revalidatePath("/bespoke")
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
