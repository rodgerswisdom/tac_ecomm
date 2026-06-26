import { AdminPageHeader } from "@/components/admin/page-header"
import { getZohoConnectionStatus } from "@/server/admin/zoho"
import { ZohoSettingsClient } from "./ZohoSettingsClient"

export const metadata = {
  title: "Zoho Settings | Admin",
  description: "Configure Zoho Books integration settings",
}

export default async function ZohoSettingsPage() {
  const connectionStatus = await getZohoConnectionStatus()

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Zoho Integration Settings"
        description="Configure and manage your Zoho Books connection"
        breadcrumb={[
          { label: "Dashboard", href: "/admin/overview" },
          { label: "Zoho Sync", href: "/admin/zoho" },
          { label: "Settings" },
        ]}
      />

      <ZohoSettingsClient connectionStatus={connectionStatus} />
    </section>
  )
}
