"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, RotateCcw, Trash2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ZohoSyncLogWithDetails, ZohoSyncStatus, ZohoEntityType } from "@/server/admin/zoho"
import { cn } from "@/lib/utils"

interface ZohoLogsClientProps {
  initialData: {
    logs: ZohoSyncLogWithDetails[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

type IconComponent = typeof Clock | typeof CheckCircle | typeof XCircle | typeof RotateCcw | typeof AlertCircle

const statusConfig: Record<string, { icon: IconComponent; color: string; label: string }> = {
  // Uppercase (old format)
  PENDING: { icon: Clock, color: "bg-blue-100 text-blue-700 border-blue-200", label: "Pending" },
  SYNCED: { icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-200", label: "Synced" },
  FAILED: { icon: XCircle, color: "bg-red-100 text-red-700 border-red-200", label: "Failed" },
  RETRYING: { icon: RotateCcw, color: "bg-amber-100 text-amber-700 border-amber-200", label: "Retrying" },
  // Lowercase (new format)
  pending: { icon: Clock, color: "bg-blue-100 text-blue-700 border-blue-200", label: "Pending" },
  processing: { icon: RotateCcw, color: "bg-amber-100 text-amber-700 border-amber-200", label: "Processing" },
  success: { icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-200", label: "Success" },
  failed: { icon: XCircle, color: "bg-red-100 text-red-700 border-red-200", label: "Failed" },
}

export function ZohoLogsClient({ initialData }: ZohoLogsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRetrying, setIsRetrying] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const currentStatus = searchParams.get("status") || "all"
  const currentEntityType = searchParams.get("entityType") || "all"

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page") // Reset to page 1 when filtering
    router.push(`/admin/zoho/logs?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/admin/zoho/logs?${params.toString()}`)
  }

  const handleRetry = async (logId: string) => {
    setIsRetrying(logId)
    try {
      const response = await fetch("/api/zoho/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      })
      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to retry sync")
      }
    } catch (error) {
      alert("Failed to retry sync")
    } finally {
      setIsRetrying(null)
    }
  }

  const handleDelete = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return

    setIsDeleting(logId)
    try {
      const response = await fetch("/api/zoho/retry", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      })
      if (response.ok) {
        router.refresh()
      } else {
        alert("Failed to delete log")
      }
    } catch (error) {
      alert("Failed to delete log")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRetryAll = async () => {
    if (!confirm("Retry all failed syncs? This will reset their status to pending.")) return

    try {
      const params = new URLSearchParams()
      if (currentEntityType !== "all") params.set("entityType", currentEntityType)

      const response = await fetch(`/api/zoho/retry?${params.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retryAll: true }),
      })
      if (response.ok) {
        const result = await response.json()
        alert(`Successfully queued ${result.count} syncs for retry`)
        router.refresh()
      } else {
        alert("Failed to retry syncs")
      }
    } catch (error) {
      alert("Failed to retry syncs")
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={currentStatus} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SYNCED">Synced</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="RETRYING">Retrying</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Entity Type</label>
              <Select value={currentEntityType} onValueChange={(v) => handleFilterChange("entityType", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PRODUCT">Products</SelectItem>
                  <SelectItem value="CUSTOMER">Customers</SelectItem>
                  <SelectItem value="ORDER">Orders</SelectItem>
                  <SelectItem value="INVOICE">Invoices</SelectItem>
                  <SelectItem value="PAYMENT">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {currentStatus === "FAILED" && (
              <div className="flex items-end">
                <Button onClick={handleRetryAll} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry All Failed
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sync Logs ({initialData.total})</CardTitle>
            <div className="text-sm text-muted-foreground">
              Page {initialData.page} of {initialData.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialData.logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No sync logs found
            </div>
          ) : (
            <div className="space-y-4">
              {initialData.logs.map((log) => {
                const config = statusConfig[log.status] || {
                  icon: AlertCircle,
                  color: "bg-gray-100 text-gray-700 border-gray-200",
                  label: log.status
                }
                const Icon = config.icon

                return (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <Badge variant="outline">
                            {log.entityType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Priority: {log.priority}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {log.entityDetails?.name && (
                            <p className="text-sm font-medium">{log.entityDetails.name}</p>
                          )}
                          {log.entityDetails?.email && (
                            <p className="text-sm text-muted-foreground">{log.entityDetails.email}</p>
                          )}
                          {log.entityDetails?.orderNumber && (
                            <p className="text-sm font-medium">Order #{log.entityDetails.orderNumber}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {log.entityId}
                          </p>
                        </div>

                        {log.error && (
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-red-800 font-mono">{log.error}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {new Date(log.createdAt).toLocaleString()}</span>
                          {log.processedAt && (
                            <span>Processed: {new Date(log.processedAt).toLocaleString()}</span>
                          )}
                          <span>Attempts: {log.attempts}/{log.maxAttempts}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {log.status === "FAILED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry(log.id)}
                            disabled={isRetrying === log.id}
                          >
                            <RotateCcw className={cn("h-4 w-4", isRetrying === log.id && "animate-spin")} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(log.id)}
                          disabled={isDeleting === log.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {initialData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(initialData.page - 1)}
                disabled={initialData.page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {initialData.page} of {initialData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(initialData.page + 1)}
                disabled={initialData.page === initialData.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
