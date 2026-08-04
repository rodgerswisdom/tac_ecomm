'use client'

import { useState, useTransition, type ComponentProps, type ReactNode } from "react"
import Link from "next/link"
import { Eye, MoreHorizontal, PenSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { adminToast } from "@/lib/admin/feedback"
import type { ActionResult } from "@/lib/admin/action-result"

type AdminFormActionResult = void | ActionResult

export interface RowActionItem {
  label: string
  icon?: ReactNode
  href?: string
  linkProps?: Omit<ComponentProps<typeof Link>, "href">
  onSelect?: () => void
  disabled?: boolean
  destructive?: boolean
  separatorBefore?: boolean
}

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
  /** Extra menu items (e.g. Archive, Move to bespoke). Rendered after View/Edit. */
  items?: RowActionItem[]
  containerClassName?: string
  buttonClassName?: string
  /** @deprecated Kept for call-site compatibility; unused with overflow menu. */
  deleteButtonClassName?: string
  viewContent?: ReactNode
  modalTitle?: string
  viewLabel?: string
  editLabel?: string
}

export function RowActions({
  viewHref,
  viewLinkProps,
  editHref,
  editLinkProps,
  deleteConfig,
  items = [],
  containerClassName,
  buttonClassName,
  viewContent,
  modalTitle,
  viewLabel = "View",
  editLabel = "Edit",
}: RowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const hasView = Boolean(viewHref || viewContent)
  const hasEdit = Boolean(editHref)
  const hasDelete = Boolean(deleteConfig)
  const hasAny = hasView || hasEdit || hasDelete || items.length > 0

  if (!hasAny) return null

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
        setDeleteOpen(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to delete item"
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
        setDeleteOpen(false)
      } catch (err) {
        const message = "Unable to archive item"
        setError(message)
        adminToast.error(message)
        console.error(err)
      }
    })
  }

  const renderExtraItem = (item: RowActionItem, index: number) => {
    const className = cn(
      "cursor-pointer gap-2",
      item.destructive && "text-rose-600 focus:text-rose-600",
    )

    return (
      <div key={`${item.label}-${index}`}>
        {item.separatorBefore ? <DropdownMenuSeparator /> : null}
        {item.href ? (
          <DropdownMenuItem asChild disabled={item.disabled} className={className}>
            <Link href={item.href} {...item.linkProps}>
              {item.icon}
              {item.label}
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={item.disabled}
            className={className}
            onSelect={() => item.onSelect?.()}
          >
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        )}
      </div>
    )
  }

  return (
    <div className={cn("ml-auto flex w-fit items-center justify-end", containerClassName)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 text-muted-foreground", buttonClassName)}
            aria-label="Actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[11rem]">
          {viewContent ? (
            <DropdownMenuItem className="cursor-pointer gap-2" onSelect={() => setViewOpen(true)}>
              <Eye className="h-4 w-4" />
              {viewLabel}
            </DropdownMenuItem>
          ) : viewHref ? (
            <DropdownMenuItem asChild className="cursor-pointer gap-2">
              <Link href={viewHref} {...viewLinkProps}>
                <Eye className="h-4 w-4" />
                {viewLabel}
              </Link>
            </DropdownMenuItem>
          ) : null}

          {editHref ? (
            <DropdownMenuItem asChild className="cursor-pointer gap-2">
              <Link href={editHref} {...editLinkProps}>
                <PenSquare className="h-4 w-4" />
                {editLabel}
              </Link>
            </DropdownMenuItem>
          ) : null}

          {items.map(renderExtraItem)}

          {deleteConfig ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-rose-600 focus:text-rose-600"
                onSelect={() => {
                  setError(null)
                  setDeleteOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {viewContent ? (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{modalTitle ?? "Quick View"}</DialogTitle>
            </DialogHeader>
            <div className="py-4">{viewContent}</div>
            <DialogFooter className="mt-6">
              {editHref ? (
                <Button
                  asChild
                  className="w-full rounded-2xl bg-brand-teal py-6 font-black uppercase tracking-widest text-white shadow-lg shadow-brand-teal/20 transition-all duration-300 hover:scale-[1.02] hover:bg-brand-teal/90 active:scale-[0.98]"
                >
                  <Link href={editHref}>Edit Details</Link>
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {deleteConfig ? (
        <Dialog open={deleteOpen} onOpenChange={(next) => (!isPending ? setDeleteOpen(next) : null)}>
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
              <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} disabled={isPending}>
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
      ) : null}
    </div>
  )
}
