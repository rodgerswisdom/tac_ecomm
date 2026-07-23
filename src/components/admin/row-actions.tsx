'use client'

import { useState, useTransition, type ComponentProps } from "react"
import Link from "next/link"
import { Eye, PenSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { adminToast } from "@/lib/admin/feedback"
import type { ActionResult } from "@/lib/admin/action-result"

type AdminFormActionResult = void | ActionResult

interface DeleteConfig {
  action: (formData: FormData) => Promise<AdminFormActionResult>
  fields: Record<string, string>
  resourceLabel?: string
  confirmTitle?: string
  confirmDescription?: string
  confirmButtonLabel?: string
  orderCount?: number
  showArchiveOption?: boolean
  archiveAction?: (formData: FormData) => Promise<AdminFormActionResult>
}

interface RowActionsProps {
  viewHref?: string
  viewLinkProps?: Omit<ComponentProps<typeof Link>, "href">
  editHref?: string
  editLinkProps?: Omit<ComponentProps<typeof Link>, "href">
  deleteConfig?: DeleteConfig
  containerClassName?: string
  buttonClassName?: string
  deleteButtonClassName?: string
  viewContent?: React.ReactNode
  modalTitle?: string
}

export function RowActions({
  viewHref,
  viewLinkProps,
  editHref,
  editLinkProps,
  deleteConfig,
  containerClassName,
  buttonClassName,
  deleteButtonClassName,
  viewContent,
  modalTitle,
}: RowActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!deleteConfig || isPending) return
    setError(null)
    startTransition(async () => {
      try {
        const formData = new FormData()
        Object.entries(deleteConfig.fields).forEach(([key, value]) => {
          formData.append(key, value)
        })
        const result = await deleteConfig.action(formData)
        if (result?.error) {
          setError(result.error)
          adminToast.error(result.error)
          return
        }
        adminToast.success(`Deleted ${deleteConfig.resourceLabel ?? "item"}.`)
        setDialogOpen(false)
      } catch (err) {
        const message = "Unable to delete item"
        setError(message)
        adminToast.error(message)
        console.error(err)
      }
    })
  }

  const handleArchive = () => {
    if (!deleteConfig?.archiveAction || isPending) return
    setError(null)
    startTransition(async () => {
      try {
        const formData = new FormData()
        Object.entries(deleteConfig.fields).forEach(([key, value]) => {
          formData.append(key, value)
        })
        const result = await deleteConfig.archiveAction!(formData)
        if (result?.error) {
          setError(result.error)
          adminToast.error(result.error)
          return
        }
        adminToast.success(`Archived ${deleteConfig.resourceLabel ?? "item"}.`)
        setDialogOpen(false)
      } catch (err) {
        const message = "Unable to archive item"
        setError(message)
        adminToast.error(message)
        console.error(err)
      }
    })
  }

  const deleteButton = deleteConfig ? (
    <Dialog open={dialogOpen} onOpenChange={(next) => (!isPending ? setDialogOpen(next) : null)}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 text-rose-500 hover:text-rose-600", deleteButtonClassName)}
          aria-label="Delete"
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{deleteConfig.confirmTitle ?? "Delete item?"}</DialogTitle>
          <DialogDescription className="whitespace-pre-wrap">
            {deleteConfig.confirmDescription ??
              `This will permanently remove ${deleteConfig.resourceLabel ?? "this record"}.`}
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          {deleteConfig.showArchiveOption && deleteConfig.archiveAction ? (
            <Button type="button" onClick={handleArchive} disabled={isPending}>
              {isPending ? "Working..." : "Archive instead"}
            </Button>
          ) : null}
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending
              ? "Deleting..."
              : deleteConfig.confirmButtonLabel ??
                (deleteConfig.showArchiveOption ? "Delete anyway" : "Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null

  return (
    <div className={cn("ml-auto flex w-fit items-center gap-1", containerClassName)}>
      {viewHref && !viewContent ? (
        <Button asChild variant="ghost" size="icon" className={cn("h-8 w-8", buttonClassName)} aria-label="View">
          <Link href={viewHref} {...viewLinkProps}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ) : viewContent ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", buttonClassName)} aria-label="View Quick Summary">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{modalTitle ?? "Quick View"}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {viewContent}
            </div>
            <DialogFooter className="mt-6">
              {editHref && (
                <Button asChild className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-lg shadow-brand-teal/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  <Link href={editHref}>Edit Details</Link>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
      {editHref ? (
        <Button asChild variant="ghost" size="icon" className={cn("h-8 w-8", buttonClassName)} aria-label="Edit">
          <Link href={editHref} {...editLinkProps}>
            <PenSquare className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}
      {deleteButton}
    </div>
  )
}
