"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Trash2, Archive, Copy, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { adminToast } from "@/lib/admin/feedback"

interface BulkAction {
    label: string
    icon: React.ReactNode
    action: (ids: string[]) => Promise<{ success?: boolean; error?: string }>
    variant?: "default" | "destructive"
    confirmDescription?: (selectedIds: string[]) => string | null
}

interface BulkActionsProps {
    selectedIds: string[]
    onClear: () => void
    resourceName: string
    actions: BulkAction[]
}

export function BulkActions({ selectedIds, onClear, resourceName, actions }: BulkActionsProps) {
    const [isPending, setIsPending] = useState(false)
    const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null)
    const router = useRouter()

    if (selectedIds.length === 0) return null

    const runAction = async (action: BulkAction) => {
        setIsPending(true)
        try {
            const result = await action.action(selectedIds)
            if (result.success) {
                adminToast.success(`Successfully updated ${selectedIds.length} ${resourceName}s`)
                onClear()
                router.refresh()
            } else {
                adminToast.error(result.error || `Failed to update ${resourceName}s`)
            }
        } catch {
            adminToast.error("Something went wrong")
        } finally {
            setIsPending(false)
            setConfirmAction(null)
        }
    }

    const handleAction = (action: BulkAction) => {
        const description = action.confirmDescription?.(selectedIds)
        if (description) {
            setConfirmAction(action)
            return
        }
        void runAction(action)
    }

    return (
        <>
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg border border-border animate-in fade-in slide-in-from-top-2">
                <span className="text-sm font-medium">
                    {selectedIds.length} items selected
                </span>
                <Button variant="ghost" size="sm" onClick={onClear} disabled={isPending}>
                    Clear
                </Button>
                <div className="h-4 w-[1px] bg-border mx-1" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2" disabled={isPending}>
                            Bulk Actions <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {actions.map((item, idx) => (
                            <DropdownMenuItem
                                key={idx}
                                className={cn("gap-2", item.variant === "destructive" && "text-destructive focus:text-destructive")}
                                onClick={() => handleAction(item)}
                            >
                                {item.icon} {item.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && !isPending && setConfirmAction(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Confirm bulk delete</DialogTitle>
                        <DialogDescription className="whitespace-pre-wrap">
                            {confirmAction?.confirmDescription?.(selectedIds) ?? "Delete selected items?"}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setConfirmAction(null)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isPending || !confirmAction}
                            onClick={() => confirmAction && void runAction(confirmAction)}
                        >
                            {isPending ? "Deleting..." : "Delete selected"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
