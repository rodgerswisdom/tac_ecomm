import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/admin/page-header"
import { CreateProductForm } from "./CreateProductForm"
import { getCategoryOptions } from "@/server/admin/categories"

interface NewProductPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function parseParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const params = (await searchParams) ?? {}
  const bespokeMode =
    parseParam(params.bespoke) === "1" ||
    parseParam(params.bespoke) === "true" ||
    parseParam(params.from) === "bespoke"

  const categories = await getCategoryOptions()

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={bespokeMode ? "Add bespoke product" : "Add new product"}
        description={
          bespokeMode
            ? "Create a product for Bespoke & Limited Edition. It will appear on the bespoke shop only, not in regular collections."
            : "Create a new product and add it to your inventory."
        }
        breadcrumb={
          bespokeMode
            ? [
                { label: "Bespoke", href: "/admin/bespoke?tab=products" },
                { label: "new" },
              ]
            : [
                { label: "products", href: "/admin/products" },
                { label: "new" },
              ]
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={bespokeMode ? "/admin/bespoke?tab=products" : "/admin/products"}>
              {bespokeMode ? "Back to bespoke" : "Back to products"}
            </Link>
          </Button>
        }
        actionsAlignment="end"
      />

      <CreateProductForm categories={categories} bespokeMode={bespokeMode} />
    </div>
  )
}
