"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.url} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight
                  className="h-4 w-4 text-brand-umber/40"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  className="flex items-center gap-1.5 text-brand-umber/70"
                  aria-current="page"
                >
                  {isFirst && <Home className="h-4 w-4" aria-hidden="true" />}
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="flex items-center gap-1.5 text-brand-teal transition-colors hover:text-brand-coral"
                >
                  {isFirst && <Home className="h-4 w-4" aria-hidden="true" />}
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

