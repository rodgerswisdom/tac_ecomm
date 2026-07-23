"use client"

import { CategoryImageField } from "@/components/admin/CategoryImageField"

type EditCategoryImageFieldProps = {
  defaultImage?: string | null
}

export function EditCategoryImageField({ defaultImage }: EditCategoryImageFieldProps) {
  return <CategoryImageField defaultImage={defaultImage} />
}
