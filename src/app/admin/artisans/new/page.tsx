import { AdminPageHeader } from "@/components/admin/page-header"
import { createArtisanAction } from "@/server/admin/artisans"
import { ArtisanForm } from "../ArtisanForm"

export default function NewArtisanPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Add New Artisan"
        description="Introduce a new craftsperson to the platform."
        breadcrumb={[
          { label: "Artisans", href: "/admin/artisans" },
          { label: "Add New", href: "/admin/artisans/new" },
        ]}
      />

      <ArtisanForm action={createArtisanAction} title="Artisan Profile" />
    </div>
  )
}
