import { Suspense } from "react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ZohoLogsClient } from "./ZohoLogsClient"
import { getZohoSyncLogs } from "@/server/admin/zoho"
import { Card, CardContent } from "@/components/ui/card"
import type { ZohoSyncStatus, ZohoEntityType } from "@/server/admin/zoho"

export const metadata = {
  title: "Zoho Sync Logs | Admin",
  description: "View Zoho Books synchronization logs",
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    entityType?: string
  }>
}

async function ZohoLogsLoader({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const status = params.status as ZohoSyncStatus | undefined
  const entityType = params.entityType as ZohoEntityType | undefined

  const logsData = await getZohoSyncLogs({
    page,
    limit: 20,
    status,
    entityType,
  })

  return <ZohoLogsClient initialData={logsData} />
}

function LoadingFallback() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ZohoLogsPage({ searchParams }: PageProps) {
  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Sync Logs"
        description="View detailed synchronization history and errors"
        breadcrumb={[
          { label: "Dashboard", href: "/admin/overview" },
          { label: "Zoho Sync", href: "/admin/zoho" },
          { label: "Logs" },
        ]}
      />

      <Suspense fallback={<LoadingFallback />}>
        <ZohoLogsLoader searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

