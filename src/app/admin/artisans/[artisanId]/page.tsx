import { notFound } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/page-header"
import { getArtisanById, updateArtisanAction } from "@/server/admin/artisans"
import { ArtisanForm } from "../ArtisanForm"

interface EditArtisanPageProps {
  params: Promise<{ artisanId: string }>
}

export default async function EditArtisanPage({ params }: EditArtisanPageProps) {
  const { artisanId } = await params
  const artisan = await getArtisanById(artisanId)

  if (!artisan) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Edit ${artisan.name}`}
        description="Update artisan details and story."
        breadcrumb={[
          { label: "Artisans", href: "/admin/artisans" },
          { label: artisan.name, href: `/admin/artisans/${artisan.id}` },
        ]}
      />

      <ArtisanForm artisan={artisan} action={updateArtisanAction} title="Edit Artisan Profile" />
    </div>
  )
}
