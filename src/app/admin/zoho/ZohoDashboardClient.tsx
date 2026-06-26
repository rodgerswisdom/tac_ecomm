"use client"

import { useState } from "react"
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Trash2, RotateCcw, Package, Users, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/admin/stats-card"
import { SimpleBarChart } from "@/components/admin/trend-chart"
import type { ZohoStatsData } from "@/server/admin/zoho"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { syncAllExistingProducts, syncAllExistingCustomers, syncAllExistingOrders } from "@/server/admin/zoho"

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
  const [syncProgress, setSyncProgress] = useState<string>("")

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    setSyncProgress("Initializing sync pipeline...")
    
    let processing = true
    let totalProcessed = 0
    let totalSucceeded = 0
    let totalFailed = 0

    try {
      while (processing) {
        // Hit the API to process a small, safe chunk of 5 items
        const response = await fetch("/api/zoho/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
        
        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: response.statusText }))
          throw new Error(data.error || "Network connection dropped mid-transit.")
        }
        
        const data = await response.json()
        
        if (data.skipped) {
          setSyncProgress(`Skipped: ${data.message}`)
          processing = false
          break
        }

        const { processed = 0, succeeded = 0, failed = 0, remaining = 0 } = data.stats ?? {}
        
        totalProcessed += processed
        totalSucceeded += succeeded
        totalFailed += failed

        // Update the progress string to show real-time changes
        setSyncProgress(
          `Syncing: Processed ${totalProcessed} items (${totalSucceeded} success, ${totalFailed} failed). ${remaining} items remaining in queue...`
        )

        // Refresh the page data router in the background so dashboard cards visually update
        router.refresh()

        // If there are no items left in the queue, break out of the loop safely
        if (remaining === 0 || processed === 0) {
          processing = false
          setSyncProgress(`🎉 Sync pipeline clear! Completed ${totalProcessed} entries securely.`)
          alert(`Queue processing complete!\nTotal items run: ${totalProcessed}\n✅ Succeeded: ${totalSucceeded}\n❌ Failed: ${totalFailed}`)
        }

        // Optional: Add a 300ms pause on the client side to avoid hammering your own database too fast
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setSyncProgress(`Pipeline halted: ${errorMessage}`)
      alert(`Sync interrupted: ${errorMessage}`)
      console.error("Streaming sync error:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAuthenticate = () => {
    window.location.href = "/api/zoho/auth"
  }

  const handleBulkSyncProducts = async () => {
    if (!confirm("This will queue all unsynced products for sync. Continue?")) return
    
    setIsSyncing(true)
    try {
      const result = await syncAllExistingProducts()
      if (result.success) {
        alert(`✅ ${result.message}\n\nThe sync queue will process these automatically.`)
        router.refresh()
      }
    } catch (error) {
      alert("Failed to queue products for sync")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleBulkSyncCustomers = async () => {
    if (!confirm("This will queue all unsynced customers for sync. Continue?")) return
    
    setIsSyncing(true)
    try {
      const result = await syncAllExistingCustomers()
      if (result.success) {
        alert(`✅ ${result.message}`)
        router.refresh()
      }
    } catch (error) {
      alert("Failed to queue customers for sync")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleBulkSyncOrders = async () => {
    if (!confirm("This will queue all unsynced orders for sync. Continue?")) return
    
    setIsSyncing(true)
    try {
      const result = await syncAllExistingOrders()
      if (result.success) {
        alert(`✅ ${result.message}`)
        router.refresh()
      }
    } catch (error) {
      alert("Failed to queue orders for sync")
    } finally {
      setIsSyncing(false)
    }
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
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">General Actions</h4>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleManualSync}
                    disabled={isSyncing || !connectionStatus.connected}
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
                    {isSyncing ? "Syncing Pipeline..." : "Process Queue Now"}
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
                {syncProgress && (
                  <p className="text-xs font-mono text-muted-foreground bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                    {syncProgress}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Bulk Sync Existing Data</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Queue all existing unsynced items for synchronization to Zoho Books
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleBulkSyncProducts}
                  disabled={isSyncing || !connectionStatus.connected}
                  variant="secondary"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Sync All Products
                </Button>
                <Button
                  onClick={handleBulkSyncCustomers}
                  disabled={isSyncing || !connectionStatus.connected}
                  variant="secondary"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Sync All Customers
                </Button>
                <Button
                  onClick={handleBulkSyncOrders}
                  disabled={isSyncing || !connectionStatus.connected}
                  variant="secondary"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Sync All Orders
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

