/**
 * Create-product form state: types and initial state only.
 * Kept in a Prisma-free module so client components can import without pulling in pg/Node.
 */

export const formValueFields = [
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

export const extraErrorFields = ["media"] as const

export type FormValueField = (typeof formValueFields)[number]
export type ProductFormField = FormValueField | (typeof extraErrorFields)[number]
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
