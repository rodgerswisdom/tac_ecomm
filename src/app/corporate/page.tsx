import type { Metadata } from "next"
import { SpecialCatalogPage } from "@/components/catalog/SpecialCatalogPage"

export const metadata: Metadata = {
  title: "Corporate | TAC Accessories",
  description:
    "Corporate artisan gifting from TAC Accessories. Curated pieces for teams, clients, and branded hospitality programmes.",
  alternates: {
    canonical: "/corporate",
  },
}

export default async function CorporatePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  return <SpecialCatalogPage kind="corporate" searchParams={searchParams} />
}
