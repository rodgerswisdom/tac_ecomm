import Link from "next/link"
import { notFound } from "next/navigation"
import { BespokeRequestStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { getBespokeRequestById } from "@/server/admin/bespoke"
import { BespokeStatusForm } from "./BespokeStatusForm"

interface BespokeDetailPageProps {
  params: Promise<{ id: string }>
}

const statusVariantMap: Record<BespokeRequestStatus, "success" | "warning" | "danger" | "info"> = {
  NEW: "warning",
  CONTACTED: "info",
  IN_PROGRESS: "info",
  QUOTED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatDate(date: Date | string) {
  return dateFormatter.format(new Date(date))
}

export default async function BespokeDetailPage({ params }: BespokeDetailPageProps) {
  const { id } = await params
  const request = await getBespokeRequestById(id)

  if (!request) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Bespoke request from ${request.name}`}
        breadcrumb={[
          { label: "Bespoke requests", href: "/admin/bespoke" },
          { label: request.name ?? "Details", href: `/admin/bespoke/${request.id}` },
        ]}
        description={`Submitted ${formatDate(request.createdAt)}`}
        toolbar={
          <div className="flex w-full flex-wrap items-center gap-3">
            <StatusBadge
              label={request.status.replace(/_/g, " ")}
              variant={statusVariantMap[request.status] ?? "info"}
            />
            <Button asChild variant="ghost" size="sm" className="ml-auto border border-border">
              <Link href="/admin/bespoke">Back to list</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Request details</CardTitle>
            <p className="text-sm text-muted-foreground">Contact, vision, category, budget, and reference photos.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-semibold">{request.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold">{request.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-semibold">{request.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-semibold">{request.categoryLabel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Budget</p>
                <p className="font-semibold">{request.budget}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Timeline</p>
                <p className="font-semibold">
                  {request.timeline}
                  {request.isExpress ? " (Express)" : ""}
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Vision / requirements</p>
              <div className="mt-1 rounded-lg border border-border bg-muted/20 p-4 text-sm">
                <p className="whitespace-pre-wrap">{request.vision}</p>
              </div>
            </div>

            {request.photoUrls.length > 0 ? (
              <div>
                <p className="text-muted-foreground text-sm mb-2">Reference photos</p>
                <div className="flex flex-wrap gap-3">
                  {request.photoUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-border overflow-hidden w-24 h-24 bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Reference ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {request.adminNotes ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin notes</p>
                <p className="font-medium text-foreground whitespace-pre-wrap">{request.adminNotes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          <Card id="status-update">
            <CardHeader>
              <CardTitle>Update status</CardTitle>
              <p className="text-sm text-muted-foreground">Change status and add internal notes.</p>
            </CardHeader>
            <CardContent>
              <BespokeStatusForm
                requestId={request.id}
                defaultStatus={request.status}
                defaultAdminNotes={request.adminNotes}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
