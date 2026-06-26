"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, AlertCircle } from "lucide-react"

interface ConnectionStatus {
  connected: boolean
  expiresAt?: Date
  message: string
}

interface ZohoSettingsClientProps {
  connectionStatus: ConnectionStatus
}

export function ZohoSettingsClient({ connectionStatus }: ZohoSettingsClientProps) {
  const handleAuthenticate = () => {
    window.location.href = "/api/zoho/auth"
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Current Zoho Books authentication status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={connectionStatus.connected ? "default" : "destructive"}>
              {connectionStatus.connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          {connectionStatus.expiresAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Token Expires:</span>
              <span className="text-sm text-muted-foreground">
                {new Date(connectionStatus.expiresAt).toLocaleString()}
              </span>
            </div>
          )}
          <div className="pt-4 border-t">
            <Button
              onClick={handleAuthenticate}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {connectionStatus.connected ? "Re-authenticate" : "Authenticate with Zoho"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Configuration</CardTitle>
          <CardDescription>Automatic synchronization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sync Queue Processing:</span>
              <Badge variant="outline">Every 15 minutes</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Background job processes pending syncs in batches of 10
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Stock Level Sync:</span>
              <Badge variant="outline">Hourly</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Updates product stock levels from Zoho Books (50 products per run)
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Retry Attempts:</span>
              <Badge variant="outline">3 attempts</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Failed syncs retry with exponential backoff (5s, 10s, 20s)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Center Configuration</CardTitle>
          <CardDescription>Zoho Books API endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Center:</span>
              <Badge>US</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Using United States data center endpoints
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium">API Endpoint:</span>
            <code className="block text-xs bg-muted p-2 rounded">
              https://www.zohoapis.com/books/v3
            </code>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium">Auth Endpoint:</span>
            <code className="block text-xs bg-muted p-2 rounded">
              https://accounts.zoho.com
            </code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Priority Order</CardTitle>
          <CardDescription>Entity synchronization sequence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 justify-center">1</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Products</p>
                <p className="text-xs text-muted-foreground">Synced as Items in Zoho Books</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 justify-center">2</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Customers</p>
                <p className="text-xs text-muted-foreground">Synced as Contacts in Zoho Books</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 justify-center">3</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Orders</p>
                <p className="text-xs text-muted-foreground">Synced as Sales Orders in Zoho Books</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 justify-center">4</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Invoices</p>
                <p className="text-xs text-muted-foreground">Created from Sales Orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 justify-center">5</Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">Payments</p>
                <p className="text-xs text-muted-foreground">Recorded against Invoices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-900">Important Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-800">
          <ul className="list-disc list-inside space-y-1">
            <li>All syncs are queued and processed asynchronously to avoid Vercel timeout issues</li>
            <li>Dependencies are automatically resolved (e.g., customers sync before orders)</li>
            <li>Rate limiting: 100 requests per minute to Zoho Books API</li>
            <li>Failed syncs are automatically retried up to 3 times with exponential backoff</li>
            <li>Manual syncs can be triggered from the main Zoho dashboard</li>
            <li>OAuth tokens are automatically refreshed when they expire</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

// Made with Bob
