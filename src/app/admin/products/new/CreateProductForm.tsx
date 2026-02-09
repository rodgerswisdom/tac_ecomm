"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProductMediaFields } from "./ProductMediaFields"
import { createProductInitialState, type CreateProductFormState } from "@/server/admin/products"
import { createProductAction } from "@/server/admin/product-actions"
import { generateSlug } from "@/lib/utils"

const PRODUCT_TYPES = [
  { value: "READY_TO_WEAR", label: "Ready to wear" },
  { value: "BESPOKE", label: "Bespoke" },
  { value: "CORPORATE_GIFT", label: "Corporate gift" },
  { value: "MATCHING_SET", label: "Matching set" },
] as const

const AUTOSAVE_KEY = "admin:new-product:draft"
const LAST_CATEGORY_STORAGE_KEY = "admin:last-category"
const SHORT_DESCRIPTION_LIMIT = 160
const MARKUP_MULTIPLIER = 1.18

type FormValues = CreateProductFormState["values"]

const baseValues: FormValues = {
  name: "",
  sku: "",
  description: "",
  shortDescription: "",
  categoryId: "",
  price: "0",
  comparePrice: "",
  stock: "1",
  productType: PRODUCT_TYPES[0]?.value ?? "READY_TO_WEAR",
  artisanId: "",
  weight: "",
  dimensions: "",
  customSlug: "",
}

type FormValueKey = keyof FormValues

const deriveComparePrice = (priceValue: string) => {
  const numericPrice = parseFloat(priceValue)
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return ""
  return (numericPrice * MARKUP_MULTIPLIER).toFixed(2)
}

const buildSkuFromName = (name: string) => {
  if (!name) return ""
  const normalized = generateSlug(name).replace(/-/g, "").toUpperCase()
  if (!normalized) return ""
  const prefix = normalized.slice(0, 5).padEnd(5, "X")
  const yearSuffix = new Date().getFullYear().toString().slice(-2)
  return `${prefix}-${yearSuffix}`
}

type CreateProductFormProps = {
  categories: Array<{ id: string; name: string }>
}

type AutosaveState = { status: "idle" | "saving" | "saved"; timestamp?: number }

export function CreateProductForm({ categories }: CreateProductFormProps) {
  const [state, formAction] = useActionState<CreateProductFormState, FormData>(
    createProductAction,
    createProductInitialState
  )
  const [formValues, setFormValues] = useState<FormValues>(baseValues)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [hasEditedProductType, setHasEditedProductType] = useState(false)
  const [hasEditedSku, setHasEditedSku] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [autosaveState, setAutosaveState] = useState<AutosaveState>({ status: "idle" })
  const [hasPendingMediaUploads, setHasPendingMediaUploads] = useState(false)
  const [showDraftSavedToast, setShowDraftSavedToast] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem(AUTOSAVE_KEY)
      let draftApplied = false
      if (stored) {
        const parsed = JSON.parse(stored) as { values?: Partial<FormValues>; timestamp?: number }
        if (parsed.values) {
          setFormValues((prev) => ({ ...prev, ...parsed.values }))
          draftApplied = true
        }
        if (parsed.timestamp) {
          setAutosaveState({ status: "saved", timestamp: parsed.timestamp })
        }
      }

      if (!draftApplied) {
        const lastCategory = window.localStorage.getItem(LAST_CATEGORY_STORAGE_KEY)
        if (lastCategory) {
          setFormValues((prev) => ({ ...prev, categoryId: lastCategory }))
        }
      }
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!hasInteracted || !isHydrated) return

    setAutosaveState({ status: "saving" })
    const timeout = window.setTimeout(() => {
      const timestamp = Date.now()
      try {
        window.localStorage.setItem(
          AUTOSAVE_KEY,
          JSON.stringify({ values: formValues, timestamp })
        )
        setAutosaveState({ status: "saved", timestamp })
      } catch {
        setAutosaveState({ status: "idle" })
      }
    }, 1200)

    return () => window.clearTimeout(timeout)
  }, [formValues, hasInteracted, isHydrated])

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasInteracted && !hasPendingMediaUploads) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasInteracted, hasPendingMediaUploads])

  useEffect(() => {
    if (typeof window === "undefined") return
    const shouldBlock = hasInteracted || hasPendingMediaUploads
    if (!shouldBlock) return

    const message = "You have unsaved changes. Leave this page?"

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null
      if (!anchor) return
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return
      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#")) return
      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      const confirmLeave = window.confirm(message)
      if (!confirmLeave) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const handlePopState = () => {
      const confirmLeave = window.confirm(message)
      if (!confirmLeave) {
        window.history.forward()
      }
    }

    document.addEventListener("click", handleLinkClick, true)
    window.addEventListener("popstate", handlePopState)

    return () => {
      document.removeEventListener("click", handleLinkClick, true)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [hasInteracted, hasPendingMediaUploads])

  useEffect(() => {
    if (!hasInteracted || autosaveState.status !== "saved" || !autosaveState.timestamp) return
    setShowDraftSavedToast(true)
    const timeout = window.setTimeout(() => setShowDraftSavedToast(false), 2400)
    return () => window.clearTimeout(timeout)
  }, [autosaveState.status, autosaveState.timestamp, hasInteracted])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (state.status !== "idle") return
    window.localStorage.removeItem(AUTOSAVE_KEY)
  }, [state.status])

  const categoryNameLookup = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.name
      return acc
    }, {})
  }, [categories])

  const formattedAutosaveTime = useMemo(() => {
    if (!autosaveState.timestamp) return undefined
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(autosaveState.timestamp))
  }, [autosaveState.timestamp])

  const comparePriceSuggestion = useMemo(() => {
    return deriveComparePrice(formValues.price)
  }, [formValues.price])

  const hasShippingValues = Boolean(formValues.weight || formValues.dimensions)
  const shippingSummaryText = hasShippingValues
    ? `${formValues.weight || "—"} kg · ${formValues.dimensions || "No dimensions"}`
    : null

  const buildShortDescription = (text: string) => {
    const normalized = text.replace(/\s+/g, " ").trim()
    if (!normalized) return ""
    if (normalized.length <= SHORT_DESCRIPTION_LIMIT) return normalized
    const sliced = normalized.slice(0, SHORT_DESCRIPTION_LIMIT)
    const safeSlice = sliced.lastIndexOf(" ") > SHORT_DESCRIPTION_LIMIT / 2 ? sliced.slice(0, sliced.lastIndexOf(" ")) : sliced
    return `${safeSlice.trim()}…`
  }

  const deriveProductTypeFromCategory = (categoryId: string) => {
    const label = categoryNameLookup[categoryId]
    if (!label) return undefined
    const normalized = label.toLowerCase()
    if (normalized.includes("corporate")) return "CORPORATE_GIFT"
    if (normalized.includes("matching") || normalized.includes("set")) return "MATCHING_SET"
    if (normalized.includes("bespoke") || normalized.includes("custom")) return "BESPOKE"
    return undefined
  }

  const handleFieldChange = (field: FormValueKey) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.value
    setFormValues((prev) => {
      let nextValue = value
      const next = { ...prev, [field]: nextValue }
      if (field === "description") {
        next.shortDescription = buildShortDescription(value)
      }
      if (field === "categoryId" && !hasEditedProductType) {
        const derived = deriveProductTypeFromCategory(value)
        if (derived) {
          next.productType = derived
        }
      }
      if (field === "name" && !hasEditedSku) {
        const generatedSku = buildSkuFromName(value)
        if (generatedSku) {
          next.sku = generatedSku
        }
      }
      return next
    })
    if (field === "productType") {
      setHasEditedProductType(true)
    }
    if (field === "sku") {
      setHasEditedSku(true)
    }
    if (field === "categoryId" && typeof window !== "undefined") {
      window.localStorage.setItem(LAST_CATEGORY_STORAGE_KEY, value)
    }
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  const handleGenerateSku = () => {
    const generated = buildSkuFromName(formValues.name || formValues.categoryId || "")
    if (!generated) return
    setFormValues((prev) => ({
      ...prev,
      sku: generated,
    }))
    setHasEditedSku(false)
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  const handleApplyComparePriceSuggestion = () => {
    if (!comparePriceSuggestion) return
    setFormValues((prev) => ({
      ...prev,
      comparePrice: comparePriceSuggestion,
    }))
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  const fieldError = (field: FormValueKey | "media") => state.fieldErrors?.[field]

  return (
    <form action={formAction} className="space-y-8">
      {showDraftSavedToast ? (
        <div
          className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm shadow-lg"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </div>
      ) : null}

      <input type="hidden" name="shortDescription" value={formValues.shortDescription} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="space-y-5 rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground">Basic info</p>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-foreground">
                    <span className="flex items-center gap-1">
                      Title
                      <RequiredMark />
                    </span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formValues.name}
                    onChange={handleFieldChange("name")}
                    required
                    className="h-11 text-base font-medium"
                    placeholder="e.g. Lalibela Arc Ring"
                  />
                  {fieldError("name") ? <p className="text-xs text-rose-600">{fieldError("name")}</p> : null}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="sku" className="text-sm font-semibold text-foreground">
                      <span className="flex items-center gap-1">
                        SKU
                        <RequiredMark />
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[11px] font-semibold tracking-wide text-primary underline-offset-2 hover:underline"
                    >
                      Generate
                    </button>
                  </div>
                  <Input
                    id="sku"
                    name="sku"
                    value={formValues.sku}
                    onChange={handleFieldChange("sku")}
                    required
                    className="h-10 text-sm uppercase tracking-[0.2em]"
                    placeholder="ARC-2024-GOLD"
                  />
                  {fieldError("sku") ? <p className="text-xs text-rose-600">{fieldError("sku")}</p> : null}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-1">
                    Description
                    <RequiredMark />
                  </span>
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formValues.description}
                  onChange={handleFieldChange("description")}
                  placeholder="Describe the inspiration, materials, and finish."
                  minLength={10}
                  required
                  className="min-h-[90px] text-sm"
                />
                {fieldError("description") ? <p className="text-xs text-rose-600">{fieldError("description")}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-semibold text-foreground">
                    <span className="flex items-center gap-1">
                      Price
                      <RequiredMark />
                    </span>
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formValues.price}
                    onChange={handleFieldChange("price")}
                    placeholder="0"
                    required
                    className="h-11 text-base"
                  />
                  {fieldError("price") ? <p className="text-xs text-rose-600">{fieldError("price")}</p> : null}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="comparePrice" className="text-xs font-medium text-muted-foreground">
                      Compare at
                    </label>
                    {comparePriceSuggestion && !formValues.comparePrice ? (
                      <button
                        type="button"
                        onClick={handleApplyComparePriceSuggestion}
                        className="text-[11px] font-semibold uppercase tracking-wide text-primary underline-offset-2 hover:underline"
                      >
                        Use {comparePriceSuggestion}
                      </button>
                    ) : null}
                  </div>
                  <Input
                    id="comparePrice"
                    name="comparePrice"
                    type="number"
                    step="0.01"
                    value={formValues.comparePrice}
                    onChange={handleFieldChange("comparePrice")}
                    placeholder="Optional"
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stock" className="text-sm font-semibold text-foreground">
                    <span className="flex items-center gap-1">
                      Stock
                      <RequiredMark />
                    </span>
                  </label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formValues.stock}
                    onChange={handleFieldChange("stock")}
                    placeholder="1"
                    required
                    className="h-10 text-sm"
                  />
                  {fieldError("stock") ? <p className="text-xs text-rose-600">{fieldError("stock")}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="categoryId" className="text-sm font-semibold text-foreground">
                    <span className="flex items-center gap-1">
                      Category
                      <RequiredMark />
                    </span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formValues.categoryId}
                    onChange={handleFieldChange("categoryId")}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {fieldError("categoryId") ? <p className="text-xs text-rose-600">{fieldError("categoryId")}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="productType" className="text-sm font-semibold text-foreground">
                    Matching set / type
                  </label>
                  <select
                    id="productType"
                    name="productType"
                    value={formValues.productType}
                    onChange={handleFieldChange("productType")}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
                  >
                    {PRODUCT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Promote as</p>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isFeatured" value="true" /> Featured
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isBespoke" value="true" /> Bespoke
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isCorporateGift" value="true" /> Corporate gift
                  </label>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-dashed border-border/70 bg-muted/40 p-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground">Shipping info</p>
                  {shippingSummaryText ? (
                    <p className="text-[11px] text-muted-foreground">Current summary: {shippingSummaryText}</p>
                ) : (
                    <p className="text-[11px] text-muted-foreground">Add measurements to preview shipping details.</p>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="weight" className="text-sm font-medium text-foreground">
                      Weight (kg)
                    </label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      value={formValues.weight}
                      onChange={handleFieldChange("weight")}
                      placeholder="e.g. 2.5"
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dimensions" className="text-sm font-medium text-foreground">
                      Dimensions - units (cm / in)
                    </label>
                    <Input
                      id="dimensions"
                      name="dimensions"
                      value={formValues.dimensions}
                      onChange={handleFieldChange("dimensions")}
                      placeholder="Length × Width × Height"
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Product images</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductMediaFields error={fieldError("media")} onMediaStateChange={setHasPendingMediaUploads} />
            </CardContent>
          </Card>

          <ActionsCard autosaveState={autosaveState} />
        </div>
      </div>
    </form>
  )
}

function ActionsCard({
  autosaveState,
}: {
  autosaveState: AutosaveState
}) {
  const statusLabel = "Ready to publish"
  const isSaving = autosaveState.status === "saving"
  const lastSavedLabel = isSaving
    ? "Saving…"
    : autosaveState.status === "saved" && autosaveState.timestamp
      ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(
          new Date(autosaveState.timestamp)
        )
      : "Not yet saved"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-2 rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <dt>Status</dt>
            <dd className="font-semibold text-foreground">{statusLabel}</dd>
          </div>
          {/* <div className="flex items-center justify-between">
            <dt>Last saved</dt>
            <dd className="font-semibold text-foreground">{lastSavedLabel}</dd>
          </div> */}
        </dl>
        <div className="space-y-3">
          <SaveDraftButton />
          <PublishButton />
          <Button asChild variant="ghost" className="w-full text-muted-foreground">
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SaveDraftButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      name="intent"
      value="draft"
      variant="outline"
      className="w-full border-dashed"
      disabled={pending}
    >
      {pending ? "Working…" : "Save as draft"}
    </Button>
  )
}

function PublishButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      name="intent"
      value="publish"
      className="w-full"
      disabled={pending}
    >
      {pending ? "Publishing…" : "Save and publish"}
    </Button>
  )
}

function RequiredMark() {
  return (
    <>
      <span className="text-sm font-semibold text-rose-600" aria-hidden="true">
        *
      </span>
      <span className="sr-only">(required)</span>
    </>
  )
}
