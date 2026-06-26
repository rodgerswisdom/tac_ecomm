"use client"

import { useState } from "react"
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Trash2, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/admin/stats-card"
import { SimpleBarChart } from "@/components/admin/trend-chart"
import type { ZohoStatsData } from "@/server/admin/zoho"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type ConnectionStatus = {
  connected: boolean
  expiresAt?: Date
  message: string
}

interface ZohoDashboardClientProps {
  initialStats: ZohoStatsData
  connectionStatus: ConnectionStatus
}

export function ZohoDashboardClient({
  initialStats,
  connectionStatus,
}: ZohoDashboardClientProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/zoho/sync", {
        method: "POST",
      })
      if (response.ok) {
        alert("Sync triggered successfully. Check the sync logs for progress.")
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Sync failed: ${error.error || "Unknown error"}`)
      }
    } catch (error) {
      alert("Failed to trigger sync")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAuthenticate = () => {
    window.location.href = "/api/zoho/auth"
  }

  // Prepare chart data
  const entityChartData = initialStats.syncsByEntity.map((item) => ({
    name: item.entityType.toLowerCase(),
    synced: item.synced,
    pending: item.pending,
    failed: item.failed,
  }))

  const activityChartData = initialStats.recentActivity.map((item) => ({
    name: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    synced: item.synced,
    failed: item.failed,
  }))

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      <Card className={cn(
        "border-2",
        connectionStatus.connected ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {connectionStatus.connected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              )}
              <div>
                <p className={cn(
                  "font-semibold",
                  connectionStatus.connected ? "text-green-900" : "text-amber-900"
                )}>
                  {connectionStatus.message}
                </p>
                {connectionStatus.connected && connectionStatus.expiresAt && (
                  <p className="text-xs text-green-700">
                    Token expires: {new Date(connectionStatus.expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!connectionStatus.connected && (
                <Button onClick={handleAuthenticate} size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Authenticate
                </Button>
              )}
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Synced"
          value={initialStats.totalSynced}
          subtitle="Successfully synced"
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        />
        <StatsCard
          title="Pending"
          value={initialStats.totalPending}
          subtitle="Waiting in queue"
          icon={<Clock className="h-5 w-5 text-blue-500" />}
        />
        <StatsCard
          title="Failed"
          value={initialStats.totalFailed}
          subtitle="Sync errors"
          icon={<XCircle className="h-5 w-5 text-red-500" />}
        />
        <StatsCard
          title="Retrying"
          value={initialStats.totalRetrying}
          subtitle="Auto-retry in progress"
          icon={<RotateCcw className="h-5 w-5 text-amber-500" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sync Status by Entity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {entityChartData.length > 0 ? (
              <SimpleBarChart
                data={entityChartData.map((d) => ({
                  name: d.name,
                  value: d.synced + d.pending + d.failed,
                  color: d.failed > 0 ? "#ef4444" : d.pending > 0 ? "#3b82f6" : "#10b981",
                }))}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No sync data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (7 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {activityChartData.length > 0 ? (
              <SimpleBarChart
                data={activityChartData.map((d) => ({
                  name: d.name,
                  value: d.synced + d.failed,
                  color: d.failed > d.synced ? "#ef4444" : "#10b981",
                }))}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Entity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Entity Sync Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {initialStats.syncsByEntity.map((entity) => {
              const total = entity.synced + entity.pending + entity.failed
              const syncedPercent = total > 0 ? (entity.synced / total) * 100 : 0
              const pendingPercent = total > 0 ? (entity.pending / total) * 100 : 0
              const failedPercent = total > 0 ? (entity.failed / total) * 100 : 0

              return (
                <div key={entity.entityType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{entity.entityType}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {entity.synced} synced
                      </Badge>
                      {entity.pending > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {entity.pending} pending
                        </Badge>
                      )}
                      {entity.failed > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {entity.failed} failed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    {syncedPercent > 0 && (
                      <div
                        className="bg-green-500"
                        style={{ width: `${syncedPercent}%` }}
                      />
                    )}
                    {pendingPercent > 0 && (
                      <div
                        className="bg-blue-500"
                        style={{ width: `${pendingPercent}%` }}
                      />
                    )}
                    {failedPercent > 0 && (
                      <div
                        className="bg-red-500"
                        style={{ width: `${failedPercent}%` }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleManualSync}
              disabled={isSyncing || !connectionStatus.connected}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
              Trigger Manual Sync
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/zoho/logs")}
            >
              View Sync Logs
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/zoho/settings")}
            >
              Sync Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

