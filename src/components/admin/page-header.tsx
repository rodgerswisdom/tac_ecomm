import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AdminPageHeaderProps {
  title: string
  breadcrumb?: string[]
  description?: string
  actions?: ReactNode
  toolbar?: ReactNode
  className?: string
}

export function AdminPageHeader({
  title,
  breadcrumb,
  description,
  actions,
  toolbar,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("space-y-4 border-b border-border/70 pb-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          {breadcrumb && breadcrumb.length > 0 ? (
            <p className="text-xs font-medium text-muted-foreground">{breadcrumb.join(" > ")}</p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {toolbar ? <div className="flex flex-wrap items-center gap-3">{toolbar}</div> : null}
    </div>
  )
}
