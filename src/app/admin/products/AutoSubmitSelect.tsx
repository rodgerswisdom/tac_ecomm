'use client'

import { useRef } from "react"
import { cn } from "@/lib/utils"

type Option = { label: string; value: string | number }

interface AutoSubmitSelectProps {
  action: string
  name: string
  defaultValue: string
  options: ReadonlyArray<Option>
  hiddenFields?: Record<string, string | number | undefined>
  className?: string
  selectClassName?: string
}

export function AutoSubmitSelect({
  action,
  name,
  defaultValue,
  options,
  hiddenFields = {},
  className,
  selectClassName,
}: AutoSubmitSelectProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const handleChange = () => {
    const form = formRef.current
    if (!form) return
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit()
    } else {
      form.submit()
    }
  }

  return (
    <form ref={formRef} action={action} className={className}>
      <select
        name={name}
        defaultValue={defaultValue}
        className={cn("bg-transparent", selectClassName)}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {Object.entries(hiddenFields).map(([key, value]) =>
        value == null ? null : <input key={key} type="hidden" name={key} value={String(value)} />,
      )}
    </form>
  )
}
