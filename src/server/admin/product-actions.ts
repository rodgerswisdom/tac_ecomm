"use server"

import { Prisma, ProductType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "./auth"
import {
  productInputSchema,
  collectFormValues,
  optionalString,
  optionalNumber,
  booleanFromForm,
  parseMaterialsInput,
  buildFieldErrors,
  validateMediaPayload,
  resolveProductSlug,
  generateDuplicateSku,
  variantSchema,
  imageSchema,
} from "./products"
import type { CreateProductFormState } from "./products"

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
    materials: parseMaterialsInput(formData.get("materials")) ?? [],
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

  const created = await prisma.product.create({
    data: {
      ...parsed.data,
      shortDescription: parsed.data.shortDescription ?? null,
      materials: parsed.data.materials ?? [],
      slug,
      isDraft,
    },
  })

  await prisma.productImage.createMany({
    data: mediaValidation.items.map((asset, index) => ({
      productId: created.id,
      url: asset.url,
      alt: `${created.name} image ${index + 1}`,
      order: index,
    })),
  })

  revalidateProductRoute(created.id)

  const statusParam = isDraft ? "draft" : "published"
  redirect(`/admin/products/${created.id}?status=${statusParam}`)
}

export async function updateProductAction(formData: FormData) {
  await assertAdmin()

  const payload = {
    id: formData.get("id")?.toString(),
    name: formData.get("name")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    shortDescription: optionalString(formData.get("shortDescription")),
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
    materials: parseMaterialsInput(formData.get("materials")),
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

function revalidateProductRoute(productId?: string) {
  revalidatePath("/admin/products")
  if (productId) {
    revalidatePath(`/admin/products/${productId}`)
  }
}
