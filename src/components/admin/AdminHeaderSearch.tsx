"use client"

import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

type AdminHeaderSearchProps = {
  className?: string
  defaultValue?: string
  inputId?: string
  placeholder?: string
  size?: "default" | "large"
}

export function AdminHeaderSearch({
  className,
  defaultValue,
  inputId = "admin-header-search",
  placeholder = "Search products by name or SKU…",
  size = "default",
}: AdminHeaderSearchProps) {
  const isLarge = size === "large"

  return (
    <form
      action="/admin/products"
      role="search"
      className={cn(
        "group flex w-full items-center gap-2 rounded-full border border-[#2d3b34]/20 bg-[#eef5f0]/90 text-[#2f3c34] shadow-[inset_0_1px_2px_rgba(45,59,52,0.08)] transition-[box-shadow,border-color,background-color] focus-within:border-[#2d543f] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(45,84,63,0.15),inset_0_1px_2px_rgba(45,59,52,0.06)]",
        isLarge ? "px-5 py-3" : "px-4 py-2",
        className,
      )}
    >
      <Search
        className={cn(
          "shrink-0 text-[#3d5d4a]/60 transition-colors group-focus-within:text-[#2d543f]",
          isLarge ? "h-5 w-5" : "h-4 w-4",
        )}
        aria-hidden
      />
      <input
        id={inputId}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "min-w-0 flex-1 bg-transparent placeholder:text-[#53705f]/80 focus:outline-none",
          isLarge ? "text-base" : "text-sm",
        )}
      />
      {!isLarge ? (
        <kbd className="hidden shrink-0 rounded-md border border-[#2d3b34]/12 bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-[#53705f] lg:inline">
          ↵
        </kbd>
      ) : null}
    </form>
  )
}
