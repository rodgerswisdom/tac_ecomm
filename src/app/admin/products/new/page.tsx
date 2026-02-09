import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/page-header"
import { CreateProductForm } from "./CreateProductForm"
import { getCategoryOptions } from "@/server/admin/categories"

export default async function NewProductPage() {
  const categories = await getCategoryOptions()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Add new product"
        description="Create a new product and add it to your inventory."
        breadcrumb={[
          { label: "products", href: "/admin/products" },
          { label: "new" },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">Back to products</Link>
          </Button>
        }
        actionsAlignment="end"
      />

      <CreateProductForm categories={categories} />
    </div>
  )
}
