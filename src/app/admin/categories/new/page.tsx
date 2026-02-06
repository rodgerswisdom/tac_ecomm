import { AdminPageHeader } from "@/components/admin/page-header"
import { createCategoryAction, getCategoryOptions } from "@/server/admin/categories"

import { CategorySubmitButton, CreateCategoryForm } from "./CreateCategoryForm"

export default async function NewCategoryPage() {
  const categories = await getCategoryOptions()

  return (
    <div className="space-y-8">
      <CreateCategoryForm
        categories={categories}
        action={createCategoryAction}
        pageHeader={
          <AdminPageHeader
            title="Add new category"
            description="Define taxonomy entries that power storefront navigation."
            breadcrumb={[
              { label: "Categories", href: "/admin/categories" },
              { label: "Add new category", href: "/admin/categories/new" },
            ]}
            actionsAlignment="center"
            actions={<CategorySubmitButton label="Publish category" />}
          />
        }
      />
    </div>
  )
}
