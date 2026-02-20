"use client"

import { useState } from "react"
import { ChevronDown, Trash2, Archive, Copy, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface BulkAction {
    label: string
    icon: React.ReactNode
    action: (ids: string[]) => Promise<{ success?: boolean; error?: string }>
    variant?: "default" | "destructive"
}

interface BulkActionsProps {
    selectedIds: string[]
    onClear: () => void
    resourceName: string
    actions: BulkAction[]
}

export function BulkActions({ selectedIds, onClear, resourceName, actions }: BulkActionsProps) {
    const [isPending, setIsPending] = useState(false)

    if (selectedIds.length === 0) return null

    const handleAction = async (action: (ids: string[]) => Promise<{ success?: boolean; error?: string }>) => {
        setIsPending(true)
        try {
            const result = await action(selectedIds)
            if (result.success) {
                toast.success(`Successfully updated ${selectedIds.length} ${resourceName}s`)
                onClear()
            } else {
                toast.error(result.error || `Failed to update ${resourceName}s`)
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsPending(false)
        }
    }

    return (
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
                            onClick={() => handleAction(item.action)}
                        >
                            {item.icon} {item.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
