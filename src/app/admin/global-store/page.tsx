import { requireAdmin } from "@/server/admin/auth"
import { getAdminSettingsData } from "@/server/admin/settings"
import { AdminPageHeader } from "@/components/admin/page-header"
import { GlobalSettingsForm } from "@/components/admin/settings/GlobalSettingsForm"

export default async function GlobalStorePage() {
  await requireAdmin()
  const data = await getAdminSettingsData()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Global Store"
        description="Manage store identity, commercial settings, curation, homepage offers, and security audit."
        breadcrumb={[{ label: "Global Store", href: "/admin/global-store" }]}
      />

      <div className="w-full">
        <GlobalSettingsForm
          initialData={data.globalSettings}
          featuredProducts={data.featuredProducts}
          bespokeProducts={data.bespokeProducts}
          corporateGiftProducts={data.corporateGiftProducts}
          auditLogs={data.auditLogs}
          offerProduct={data.offerProduct}
        />
      </div>
    </div>
  )
}
