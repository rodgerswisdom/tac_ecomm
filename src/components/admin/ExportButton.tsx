"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ExportButtonProps {
    action: () => Promise<string>
    filename: string
    label?: string
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
    className?: string
}

export function ExportButton({
    action,
    filename,
    label = "Export CSV",
    variant = "outline",
    className
}: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        try {
            setIsExporting(true)
            const csvContent = await action()

            if (!csvContent) {
                toast.error("No data to export.")
                return
            }

            // Create blob and download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success("Export successful!")
        } catch (error) {
            console.error("Export failed:", error)
            toast.error("Failed to generate export. Please try again.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            variant={variant}
            className={className}
        >
            {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            {label}
        </Button>
    )
}
