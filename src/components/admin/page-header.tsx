import Link from "next/link"
import { ReactNode } from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminPageHeaderProps {
  title: string
  breadcrumb?: Array<string | { label: string; href?: string }>
  description?: string
  actions?: ReactNode
  toolbar?: ReactNode
  className?: string
  actionsAlignment?: "start" | "center" | "end"
}

export function AdminPageHeader({
  title,
  breadcrumb,
  description,
  actions,
  toolbar,
  className,
  actionsAlignment = "center",
}: AdminPageHeaderProps) {
  const actionsAlignmentClass =
    actionsAlignment === "end" ? "items-end" : actionsAlignment === "start" ? "items-start" : "items-center"

  return (
    <div className={cn("space-y-4 border-b border-border/70 pb-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          {(() => {
            const normalized = (breadcrumb && breadcrumb.length > 0
              ? breadcrumb
              : ["Dashboard"])!.map((item, index) =>
              typeof item === "string"
                ? { label: item, href: index === 0 ? "/admin/overview" : undefined }
                : { ...item, href: item.href ?? (index === 0 ? "/admin/overview" : undefined) }
            )
            if (!normalized.length) return null
            return (
              <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs font-medium tracking-[0.2em] text-muted-foreground">
                <Link
                  href="/admin/overview"
                  className="flex items-center text-muted-foreground transition hover:text-foreground"
                  aria-label="Go to dashboard"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                </Link>
                {normalized.map((item, index) => (
                  <span key={`${item.label}-${index}`} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" aria-hidden="true" />
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={cn(
                          "text-xs font-medium tracking-[0.2em] transition",
                          index === normalized.length - 1 ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          "text-xs font-medium tracking-[0.2em]",
                          index === normalized.length - 1 ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            )
          })()}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className={cn("flex flex-wrap gap-2", actionsAlignmentClass)}>{actions}</div> : null}
      </div>
      {toolbar ? <div className="flex flex-wrap items-center gap-3">{toolbar}</div> : null}
    </div>
  )
}
