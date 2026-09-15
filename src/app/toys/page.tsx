import type { Metadata } from "next"
import { SpecialCatalogPage } from "@/components/catalog/SpecialCatalogPage"

export const metadata: Metadata = {
  title: "Toys | TAC Accessories",
  description:
    "Handcrafted toys and play pieces made by African artisans. Shop objects for curiosity, storytelling, and gift-giving.",
  alternates: {
    canonical: "/toys",
  },
}

export default async function ToysPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  return <SpecialCatalogPage kind="toys" searchParams={searchParams} />
}
