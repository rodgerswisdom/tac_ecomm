import { Suspense } from "react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ZohoDashboardClient } from "./ZohoDashboardClient"
import { getZohoStats, getZohoConnectionStatus } from "@/server/admin/zoho"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Zoho Books Integration | Admin",
  description: "Manage Zoho Books synchronization",
}

async function ZohoStatsLoader() {
  const [stats, connectionStatus] = await Promise.all([
    getZohoStats(),
    getZohoConnectionStatus(),
  ])

  return (
    <ZohoDashboardClient
      initialStats={stats}
      connectionStatus={connectionStatus}
    />
  )
}

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-96 bg-muted rounded" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ZohoSyncPage() {
  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Zoho Books Integration"
        description="Monitor and manage synchronization with Zoho Books accounting software"
        breadcrumb={[
          { label: "Dashboard", href: "/admin/overview" },
          { label: "Zoho Sync" },
        ]}
      />

      <Suspense fallback={<LoadingFallback />}>
        <ZohoStatsLoader />
      </Suspense>
    </section>
  )
}

