"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { normalizeMpesaCode } from "@/lib/manual-payment"
import { cn } from "@/lib/utils"

type MpesaCodeFormProps = {
  orderId: string
  /** Shown when staff rejected the previous code, so the customer knows why they're here again. */
  rejectedCode?: string | null
  rejectionReason?: string | null
}

/** "I've paid": the customer's acknowledgement for a Paybill order is their M-Pesa confirmation code. */
export function MpesaCodeForm({ orderId, rejectedCode, rejectionReason }: MpesaCodeFormProps) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const normalized = normalizeMpesaCode(code)
    if (!normalized) {
      setError("Enter the 10-character code from your M-Pesa message, e.g. SGH4K2ABCD.")
      document.getElementById("mpesa-code")?.focus()
      return
    }
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/order/manual-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, code: normalized }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setError(data.error || "We couldn't save your code. Please try again.")
        return
      }
      setDone(true)
      router.refresh()
    } catch {
      setError("We couldn't save your code. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <p role="status" className="flex items-center justify-center gap-2 text-sm font-medium text-brand-teal">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Thanks — we&apos;ve received your code.
      </p>
    )
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-2xl border border-brand-teal/25 bg-white/90 p-5 text-left shadow-sm sm:p-6"
    >
      <h2 className="font-heading text-xl text-brand-umber">Already paid?</h2>
      {rejectedCode ? (
        <p role="alert" className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          We couldn&apos;t find payment <span className="font-mono font-semibold">{rejectedCode}</span> on our
          statement.{rejectionReason ? ` ${rejectionReason}` : ""} Please check the code on your M-Pesa message and
          enter it again.
        </p>
      ) : (
        <p className="mt-1 text-sm text-brand-umber/75">
          Enter the confirmation code from your M-Pesa message. We&apos;ll hold your items while our team checks the
          payment.
        </p>
      )}
      <label htmlFor="mpesa-code" className="mt-4 block text-sm font-medium text-brand-umber/80">
        M-Pesa confirmation code
      </label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
        <input
          id="mpesa-code"
          name="mpesaCode"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            if (error) setError("")
          }}
          placeholder="e.g. SGH4K2ABCD"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={14}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "mpesa-code-error" : undefined}
          className={cn(
            "h-12 flex-1 rounded-lg border bg-white px-3 font-mono text-base tracking-widest text-brand-umber focus:outline-none focus:ring-2 focus:ring-brand-teal/40",
            error ? "border-red-400" : "border-brand-umber/25",
          )}
        />
        <Button type="submit" disabled={submitting} className="h-12 px-6">
          {submitting ? "Sending…" : "I've paid"}
        </Button>
      </div>
      {error ? (
        <p id="mpesa-code-error" role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </form>
  )
}
