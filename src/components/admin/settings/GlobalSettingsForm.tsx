'use client'

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { updateGlobalSettingsAction, toggleProductFlagAction } from "@/server/admin/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAdminActionFeedback } from "@/hooks/use-admin-action-feedback"
import { adminToast } from "@/lib/admin/feedback"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Mail, Phone, MapPin, CreditCard, Instagram, Facebook, ShieldAlert, LayoutGrid, DollarSign, Contact, Sparkles, Stars, Gift, Trash2, ArrowRight, History, ChevronDown, User, Fingerprint, ExternalLink, Megaphone, ImageIcon, ShieldCheck, ShieldX, Cpu, Clock, Lock, Wifi, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { OfferProductPicker } from "@/components/admin/settings/OfferProductPicker"
import { ImageUploader } from "@/components/ImageUploader"
import type { OfferProductOption } from "@/server/admin/settings"
import { useKeverd } from "@keverdjs/react"
import { useSession } from "next-auth/react"
import { CopyToClipboardButton } from "@/components/admin/CopyToClipboardButton"

export function GlobalSettingsForm({ 
    initialData,
    featuredProducts = [],
    bespokeProducts = [],
    corporateGiftProducts = [],
    auditLogs = [],
    offerProduct = null,
}: { 
    initialData: any,
    featuredProducts?: any[],
    bespokeProducts?: any[],
    corporateGiftProducts?: any[],
    auditLogs?: any[],
    offerProduct?: OfferProductOption | null,
}) {
    const [state, formAction] = useActionState(updateGlobalSettingsAction, { status: "idle" })
    const [showOlderLogs, setShowOlderLogs] = useState(false)
    const [featuredProductsState, setFeaturedProductsState] = useState<any[]>(featuredProducts)
    const [bespokeProductsState, setBespokeProductsState] = useState<any[]>(bespokeProducts)
    const [corporateGiftProductsState, setCorporateGiftProductsState] = useState<any[]>(corporateGiftProducts)
    const [removingProductIds, setRemovingProductIds] = useState<Record<string, boolean>>({})

    useAdminActionFeedback(state, {
        successMessage: "Settings updated!",
        errorMessage: "Failed to update settings",
    })

    useEffect(() => {
        setFeaturedProductsState(featuredProducts)
    }, [featuredProducts])

    useEffect(() => {
        setBespokeProductsState(bespokeProducts)
    }, [bespokeProducts])

    useEffect(() => {
        setCorporateGiftProductsState(corporateGiftProducts)
    }, [corporateGiftProducts])

    async function handleRemoveCuratedProduct(productId: string, field: "isFeatured" | "isBespoke" | "isCorporateGift" | "isActive") {
        const pendingKey = `${field}:${productId}`
        setRemovingProductIds(prev => ({ ...prev, [pendingKey]: true }))

        try {
            const formData = new FormData()
            formData.append("productId", productId)
            formData.append("field", field)
            formData.append("value", "false")
            const result = await toggleProductFlagAction(formData)
            if (result?.error) {
                adminToast.error(result.error)
                return
            }

            if (field === "isFeatured") {
                setFeaturedProductsState(prev => prev.filter((product: any) => product.id !== productId))
            } else if (field === "isBespoke") {
                setBespokeProductsState(prev => prev.filter((product: any) => product.id !== productId))
            } else if (field === "isCorporateGift") {
                setCorporateGiftProductsState(prev => prev.filter((product: any) => product.id !== productId))
            }

            adminToast.success("Product removed from curated section")
        } catch (error) {
            console.error("Failed to remove curated product:", error)
            adminToast.error("Could not remove product. Please try again.")
        } finally {
            setRemovingProductIds(prev => {
                const next = { ...prev }
                delete next[pendingKey]
                return next
            })
        }
    }

    const tabItems = [
        { value: "general", label: "General Identity", icon: <LayoutGrid className="h-4 w-4 shrink-0" /> },
        { value: "commercial", label: "Commercials", icon: <DollarSign className="h-4 w-4 shrink-0" /> },
        { value: "contact", label: "Contact & Social", icon: <Contact className="h-4 w-4 shrink-0" /> },
        { value: "curation", label: "Store Curation", icon: <Sparkles className="h-4 w-4 shrink-0" /> },
        { value: "homepage", label: "Offer of the Month", icon: <Megaphone className="h-4 w-4 shrink-0" /> },
        { value: "audit", label: "Security & Audit", icon: <History className="h-4 w-4 shrink-0" /> },
    ] as const

    return (
        <form action={formAction} className="pb-24">
            <Tabs defaultValue="general" className="w-full">
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    <aside className="lg:w-56 shrink-0">
                        <TabsList className="flex flex-wrap gap-2 lg:flex-col lg:gap-1 w-full h-auto bg-transparent p-0 justify-start overflow-visible">
                            {tabItems.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className={cn(
                                        "w-full lg:w-auto justify-start rounded-xl border border-transparent",
                                        "flex items-center gap-3 px-4 py-3 whitespace-nowrap h-auto transition-all",
                                        "data-[state=active]:bg-[#b8d3c2]/50 data-[state=active]:text-[#2d3b34] data-[state=active]:font-bold data-[state=active]:border-[#2d3b34]/10 data-[state=active]:shadow-sm",
                                        "text-muted-foreground hover:bg-[#b8d3c2]/10 hover:text-[#2d3b34]"
                                    )}
                                >
                                    {tab.icon}
                                    <span className="text-sm">{tab.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </aside>

                    <div className="flex-1 min-w-0 space-y-8">

                <TabsContent value="general" forceMount className="space-y-8 animate-in fade-in duration-300 data-[state=inactive]:hidden">
                    <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="bg-[#b8d3c2]/10 border-b border-[#2d3b34]/5">
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-[#2d3b34]/70" />
                                <CardTitle className="text-xl">Store Presence</CardTitle>
                            </div>
                            <CardDescription>Manage your store's name, description, and global visibility.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="storeName" className="font-semibold text-[#2d3b34]">Store Name</Label>
                                <Input id="storeName" name="storeName" defaultValue={initialData.storeName} className="rounded-xl border-[#2d3b34]/10 bg-white" />
                                {state.errors?.storeName && <p className="text-xs text-red-500 font-medium">{state.errors.storeName[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="storeTagline" className="font-semibold text-[#2d3b34]">Site Tagline</Label>
                                <Input id="storeTagline" name="storeTagline" defaultValue={initialData.storeTagline} className="rounded-xl border-[#2d3b34]/10 bg-white" />
                                {state.errors?.storeTagline && <p className="text-xs text-red-500 font-medium">{state.errors.storeTagline[0]}</p>}
                            </div>

                            <div className="flex items-center justify-between p-5 rounded-2xl bg-orange-50 border border-orange-100 md:col-span-2 group transition-all hover:bg-orange-100/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-orange-900 font-bold">
                                        <ShieldAlert className="h-5 w-5" />
                                        <span>Maintenance Mode</span>
                                    </div>
                                    <p className="text-sm text-orange-800/70 max-w-md italic">When enabled, visitors will see a "Curating Excellence" placeholder instead of the shop.</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="hidden" name="maintenanceMode" value="false" />
                                    <Checkbox
                                        id="maintenanceMode"
                                        name="maintenanceMode"
                                        defaultChecked={initialData.maintenanceMode}
                                        value="true"
                                        className="h-7 w-7 border-orange-900/40 data-[state=checked]:bg-orange-600 rounded-lg shadow-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="bg-[#b8d3c2]/10 border-b border-[#2d3b34]/5">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-[#2d3b34]/70" />
                                <CardTitle className="text-xl">Homepage Hero</CardTitle>
                            </div>
                            <CardDescription>
                                Edit the primary homepage hero photo, headline, and tagline. Leave blank to keep the site defaults.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="heroHeadline" className="font-semibold text-[#2d3b34]">Hero Headline</Label>
                                <Input
                                    id="heroHeadline"
                                    name="heroHeadline"
                                    defaultValue={initialData.heroHeadline ?? ""}
                                    placeholder="Crafted by Heritage, Worn with Pride"
                                    className="rounded-xl border-[#2d3b34]/10 bg-white"
                                />
                                {state.errors?.heroHeadline && (
                                    <p className="text-xs text-red-500 font-medium">{state.errors.heroHeadline[0]}</p>
                                )}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="heroTagline" className="font-semibold text-[#2d3b34]">Hero Tagline</Label>
                                <Input
                                    id="heroTagline"
                                    name="heroTagline"
                                    defaultValue={initialData.heroTagline ?? ""}
                                    placeholder="Heritage Atelier Spotlight"
                                    className="rounded-xl border-[#2d3b34]/10 bg-white"
                                />
                                {state.errors?.heroTagline && (
                                    <p className="text-xs text-red-500 font-medium">{state.errors.heroTagline[0]}</p>
                                )}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-semibold text-[#2d3b34]">Hero Photo</Label>
                                <ImageUploader
                                    name="heroImage"
                                    folder="hero"
                                    tags={["hero", "settings", "admin"]}
                                    defaultValue={initialData.heroImage ?? ""}
                                    helperText="Upload a landscape image (JPG, PNG, or WebP). Recommended wider than tall."
                                />
                                {state.errors?.heroImage && (
                                    <p className="text-xs text-red-500 font-medium">{state.errors.heroImage[0]}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="commercial" forceMount className="space-y-8 animate-in fade-in duration-300 data-[state=inactive]:hidden">
                    <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="bg-amber-50/50 border-b border-amber-900/5">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-amber-700 font-bold" />
                                <CardTitle className="text-xl">Financial Config</CardTitle>
                            </div>
                            <CardDescription>Setup exchange rates, taxes and shipping fees.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors">
                                <div className="space-y-1">
                                    <div className="text-blue-900 font-bold flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        <span>Dynamic Exchange Rates</span>
                                    </div>
                                    <p className="text-sm text-blue-800/70 max-w-md">
                                        Keep prices updated based on global markets.
                                        {initialData.lastRatesSyncAt && (
                                            <span className="block mt-1 text-xs font-bold text-blue-600/60 uppercase tracking-tighter">
                                                Synced: {new Date(initialData.lastRatesSyncAt).toLocaleString()}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <input type="hidden" name="autoSyncRates" value="false" />
                                    <Checkbox
                                        id="autoSyncRates"
                                        name="autoSyncRates"
                                        defaultChecked={initialData.autoSyncRates}
                                        value="true"
                                        className="h-7 w-7 border-blue-900/30 data-[state=checked]:bg-blue-700 rounded-lg shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-3">
                                    <Label htmlFor="usdToKesRate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">USD-based KES rate</Label>
                                    <div className="relative group">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-blue-600/30 group-focus-within:text-blue-600 transition-colors">KES</span>
                                        <Input id="usdToKesRate" name="usdToKesRate" type="number" step="0.01" defaultValue={initialData.usdToKesRate} className="pl-12 rounded-xl border-[#2d3b34]/10 h-12 text-lg font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="usdToEurRate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">USD-based EUR rate</Label>
                                    <div className="relative group">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-600/30 group-focus-within:text-emerald-600 transition-colors">EUR</span>
                                        <Input id="usdToEurRate" name="usdToEurRate" type="number" step="0.001" defaultValue={initialData.usdToEurRate} className="pl-12 rounded-xl border-[#2d3b34]/10 h-12 text-lg font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="taxRate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">VAT (%)</Label>
                                    <div className="relative group">
                                        <Input id="taxRate" name="taxRate" type="number" step="0.1" defaultValue={initialData.taxRate} className="rounded-xl border-[#2d3b34]/10 h-12 text-lg font-medium" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="baseShippingFee" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Base Shipping</Label>
                                    <div className="relative group">
                                        <Input id="baseShippingFee" name="baseShippingFee" type="number" defaultValue={initialData.baseShippingFee} className="rounded-xl border-[#2d3b34]/10 h-12 text-lg font-medium" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">KES</span>
                                    </div>
                                </div>
                            </div>
                            <input type="hidden" name="defaultCurrency" value={initialData.defaultCurrency} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contact" forceMount className="space-y-8 animate-in fade-in duration-300 data-[state=inactive]:hidden">
                    <div className="grid gap-8 md:grid-cols-2">
                        <Card className="border-[#2d3b34]/10 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg">Email Directives</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="emailFromName">Sender Display Name</Label>
                                    <Input id="emailFromName" name="emailFromName" defaultValue={initialData.emailFromName} className="rounded-xl border-slate-200" placeholder="e.g. TAC Accessories Team" />
                                    {state.errors?.emailFromName && <p className="text-xs text-red-500 font-medium">{state.errors.emailFromName[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supportEmail">Support Desk Email</Label>
                                    <Input id="supportEmail" name="supportEmail" type="email" defaultValue={initialData.supportEmail} className="rounded-xl border-slate-200" />
                                    {state.errors?.supportEmail && <p className="text-xs text-red-500 font-medium">{state.errors.supportEmail[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salesEmail">Sales Inquiry Email</Label>
                                    <Input id="salesEmail" name="salesEmail" type="email" defaultValue={initialData.salesEmail} className="rounded-xl border-slate-200" />
                                    {state.errors?.salesEmail && <p className="text-xs text-red-500 font-medium">{state.errors.salesEmail[0]}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#2d3b34]/10 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg">Physical Presence</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="smsSenderId">SMS Sender ID</Label>
                                    <Input id="smsSenderId" name="smsSenderId" defaultValue={initialData.smsSenderId} className="rounded-xl border-slate-200" placeholder="e.g. TAC" />
                                    {state.errors?.smsSenderId && <p className="text-xs text-red-500 font-medium">{state.errors.smsSenderId[0]}</p>}
                                    <p className="text-[10px] text-muted-foreground">Max 11 characters. Requires registration with your provider.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="whatsappNumber">Direct WhatsApp</Label>
                                    <Input id="whatsappNumber" name="whatsappNumber" defaultValue={initialData.whatsappNumber} className="rounded-xl border-slate-200" />
                                    {state.errors?.whatsappNumber && <p className="text-xs text-red-500 font-medium">{state.errors.whatsappNumber[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Store Location
                                    </Label>
                                    <Input id="address" name="address" defaultValue={initialData.address} className="rounded-xl border-slate-200" />
                                    {state.errors?.address && <p className="text-xs text-red-500 font-medium">{state.errors.address[0]}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#2d3b34]/10 shadow-sm md:col-span-2 rounded-2xl bg-white overflow-hidden">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-50 text-beige-600 rounded-xl">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg">Social Presence</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="instagramUrl" className="font-semibold text-slate-700 flex items-center gap-2">
                                        <Instagram className="h-4 w-4 text-pink-600" /> Instagram Profile
                                    </Label>
                                    <Input
                                        id="instagramUrl"
                                        name="instagramUrl"
                                        defaultValue={initialData.instagramUrl || ""}
                                        className="rounded-xl border-slate-200"
                                        placeholder="@tac_accessories or https://instagram.com/..."
                                    />
                                    {state.errors?.instagramUrl && <p className="text-xs text-red-500 font-medium">{state.errors.instagramUrl[0]}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="facebookUrl" className="font-semibold text-slate-700 flex items-center gap-2">
                                        <Facebook className="h-4 w-4 text-blue-600" /> Facebook Page
                                    </Label>
                                    <Input
                                        id="facebookUrl"
                                        name="facebookUrl"
                                        defaultValue={initialData.facebookUrl || ""}
                                        className="rounded-xl border-slate-200"
                                        placeholder="tacaccessories or https://facebook.com/..."
                                    />
                                    {state.errors?.facebookUrl && <p className="text-xs text-red-500 font-medium">{state.errors.facebookUrl[0]}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="homepage" forceMount className="space-y-8 animate-in fade-in duration-300 data-[state=inactive]:hidden">
                    <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="bg-[#b8d3c2]/10 border-b border-[#2d3b34]/5">
                            <div className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-[#2d3b34]/70" />
                                <CardTitle className="text-xl">Offer of the Month</CardTitle>
                            </div>
                            <CardDescription>
                                Pick a product to feature as the second homepage hero slide.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-[#b8d3c2]/20 border border-[#2d3b34]/10 md:col-span-2">
                                <div className="space-y-1">
                                    <p className="font-bold text-[#2d3b34]">Show on homepage</p>
                                    <p className="text-sm text-muted-foreground">
                                        Turn on after selecting a product.
                                    </p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="hidden" name="offerIsActive" value="false" />
                                    <Checkbox
                                        id="offerIsActive"
                                        name="offerIsActive"
                                        defaultChecked={Boolean(initialData.offerIsActive)}
                                        value="true"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-semibold text-[#2d3b34]">Product</Label>
                                <OfferProductPicker initialProduct={offerProduct} />
                                {state.errors?.offerProductId && (
                                    <p className="text-xs text-red-500 font-medium">{state.errors.offerProductId[0]}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="curation" className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid gap-8">
                        <CurationSection 
                            title="Featured Collection" 
                            description="Selected items prominently displayed on the primary landing path."
                            icon={<Stars className="h-5 w-5 text-amber-500" />}
                            products={featuredProductsState}
                            field="isFeatured"
                            emptyMessage="No featured products. High-quality imagery recommended for this slot."
                            onRemoveProduct={handleRemoveCuratedProduct}
                            removingProductIds={removingProductIds}
                        />

                        <CurationSection 
                            title="Bespoke Showcase" 
                            description="Artisanal masterpieces highlighted in the custom-craft section."
                            icon={<Sparkles className="h-5 w-5 text-indigo-500" />}
                            products={bespokeProductsState}
                            field="isBespoke"
                            emptyMessage="The bespoke gallery is currently empty. Add products that define your craft."
                            onRemoveProduct={handleRemoveCuratedProduct}
                            removingProductIds={removingProductIds}
                        />

                        <CurationSection 
                            title="Corporate Gifting" 
                            description="Professional-grade selections curated for business partnerships."
                            icon={<Gift className="h-5 w-5 text-emerald-500" />}
                            products={corporateGiftProductsState}
                            field="isCorporateGift"
                            emptyMessage="No corporate gift items. Select products suitable for bulk professional orders."
                            onRemoveProduct={handleRemoveCuratedProduct}
                            removingProductIds={removingProductIds}
                        />

                        <Card className="border-dashed border-2 border-[#2d3b34]/10 bg-[#b8d3c2]/5">
                            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-white rounded-full shadow-sm">
                                    <LayoutGrid className="h-8 w-8 text-[#2d3b34]/40" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-[#2d3b34]">Curating More?</h3>
                                    <p className="text-muted-foreground max-w-sm">To add products to these lists, visit the Product Management area and toggle the relevant category flag.</p>
                                </div>
                                <Button asChild variant="outline" className="rounded-xl border-[#2d3b34]/20 hover:bg-white transition-all">
                                    <Link href="/admin/products" className="flex items-center gap-2">
                                        Manage All Products
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="space-y-10 animate-in fade-in duration-300">
                    <SecurityOverviewSection
                        initialData={initialData}
                    />

                    <KeverdDeviceTrustSection />

                    <CurrentSessionSection />

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-1 rounded-full bg-slate-900" />
                            <h2 className="text-lg font-bold text-[#2d3b34]">Admin Audit Trail</h2>
                        </div>
                        <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-slate-900 border-b border-white/5 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <History className="h-5 w-5 text-emerald-400" />
                                        <CardTitle className="text-white">Action Log</CardTitle>
                                    </div>
                                    <CardDescription className="text-slate-400">Chronological, immutable record of administrative changes.</CardDescription>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                    Immutable
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                {(() => {
                                    const todayStr = new Date().toDateString()
                                    const logsToday = auditLogs.filter((log: any) => new Date(log.createdAt).toDateString() === todayStr)
                                    const logsOlder = auditLogs.filter((log: any) => new Date(log.createdAt).toDateString() !== todayStr)

                                    if (auditLogs.length === 0) {
                                        return (
                                            <div className="p-12 text-center text-muted-foreground italic text-sm">
                                                No audit logs available. Systems are nominal.
                                            </div>
                                        )
                                    }

                                    return (
                                        <div className="divide-y divide-slate-100">
                                            <div className="bg-[#b8d3c2]/5 px-4 py-2 border-b border-slate-100">
                                                <span className="text-[10px] font-black text-[#2d3b34]/40 uppercase tracking-[0.2em]">Today's Activity</span>
                                            </div>
                                            {logsToday.length > 0 ? (
                                                logsToday.map((log: any) => <AuditLogRow key={log.id} log={log} />)
                                            ) : (
                                                <div className="p-6 text-center text-xs text-muted-foreground italic">
                                                    No activity recorded today.
                                                </div>
                                            )}

                                            {logsOlder.length > 0 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowOlderLogs(!showOlderLogs)}
                                                        className="w-full flex items-center justify-between px-6 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <History className="h-4 w-4 text-slate-400 group-hover:text-[#2d3b34] transition-colors" />
                                                            <span className="text-sm font-bold text-slate-500 group-hover:text-[#2d3b34] transition-colors">
                                                                {showOlderLogs ? 'Hide Older Activity' : `View Older Activity (${logsOlder.length})`}
                                                            </span>
                                                        </div>
                                                        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300", showOlderLogs && "rotate-180")} />
                                                    </button>

                                                    {showOlderLogs && (
                                                        <div className="divide-y divide-slate-100 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                                                            {logsOlder.map((log: any) => <AuditLogRow key={log.id} log={log} />)}
                                                            <div className="p-8 text-center bg-slate-50/30">
                                                                <div className="inline-flex flex-col items-center gap-2">
                                                                    <div className="h-1 w-12 bg-slate-200 rounded-full" />
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of Recent History</p>
                                                                    <p className="text-[9px] text-slate-300 italic">Historical data beyond 20 entries is archived for performance.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )
                                })()}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-amber-900">Critical Security Guidance</h4>
                            <p className="text-sm text-amber-800/80 leading-relaxed">
                                Audit logs, Keverd device identifiers, and session fingerprints are retained for compliance and incident response.
                                For account takeovers or unauthorized-access investigations, contact the lead developer for database-level traceability
                                including IP headers, cookie rotation history, and Keverd risk-score timelines.
                            </p>
                        </div>
                    </div>
                </TabsContent>

                        <div className="sticky bottom-4 z-40 flex justify-end pt-4">
                            <div className="bg-background/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-[#2d3b34]/10">
                                <SubmitButton />
                            </div>
                        </div>
                    </div>
                </div>
            </Tabs>
        </form>
    )
}

/* -------------------------------------------------------------------------- */
/*  Security — Keverd Device Trust                                         */
/* -------------------------------------------------------------------------- */

function KeverdDeviceTrustSection() {
    const { deviceId, riskScore, isLoading, error } = useKeverd()
    const envKey = process.env.NEXT_PUBLIC_KEVERD_API_KEY || process.env.NEXT_PUBLIC_KEVERD_PUBLIC_KEY
    const isConfigured = Boolean(envKey && envKey.length > 0)

    function riskColor(score: number | null | undefined) {
        if (score == null) return { bg: "bg-slate-100", text: "text-slate-500", ring: "ring-slate-200", label: "—" }
        if (score >= 0 && score < 30) return { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200", label: "High Risk" }
        if (score < 70) return { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", label: "Medium Risk" }
        return { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", label: "Trusted Device" }
    }

    const risk = riskColor(riskScore ?? null)

    function SectionStatus({ ok, label }: { ok: boolean; label: string }) {
        return (
            <div className="flex items-center gap-2">
                {ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                    <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <span className={cn("text-sm", ok ? "text-slate-700" : "text-slate-500")}>{label}</span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-emerald-600" />
                <h2 className="text-lg font-bold text-[#2d3b34] flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-emerald-700" />
                    Keverd Device Trust
                </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-5">
                {/* Risk Score card (col */}
                <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden lg:col-span-2 bg-gradient-to-br from-white to-slate-50/40">
                    <CardHeader className="pb-4 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-800">Device Trust Score</CardTitle>
                            <Badge variant="outline" className="border-slate-200 text-slate-600 font-medium bg-white">
                                Realtime
                            </Badge>
                        </div>
                        <CardDescription className="text-xs text-slate-500 mt-1">
                            Keverd evaluates this browser's fingerprint.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Score</p>
                                <div className="flex items-baseline gap-2">
                                    {isLoading ? (
                                        <span className="text-5xl font-black text-slate-400">—</span>
                                    ) : error ? (
                                        <span className="text-5xl font-black text-red-500/70">!</span>
                                    ) : (
                                        <span className={cn("text-5xl font-black", risk.text)}>
                                            {riskScore == null ? "—" : Math.round(Number(riskScore))}
                                        </span>
                                    )}
                                    <span className="text-sm font-bold text-slate-400">/100</span>
                                </div>
                            </div>
                            <div className={cn("px-4 py-3 rounded-2xl ring-1", risk.bg, risk.ring)}>
                                <div className="flex items-center gap-2">
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
                                    ) : error ? (
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    ) : Number(riskScore ?? 0) >= 70 ? (
                                        <ShieldCheck className="h-5 w-5" />
                                    ) : Number(riskScore ?? 0) >= 30 ? (
                                        <ShieldAlert className="h-5 w-5" />
                                    ) : (
                                        <ShieldX className="h-5 w-5" />
                                    )}
                                    <span className={cn("text-xs font-black uppercase tracking-wider", risk.text)}>
                                        {isLoading ? "Evaluating…" : error ? "Error" : risk.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Score bar */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    Number(riskScore ?? 0) >= 70 ? "bg-emerald-500" :
                                    Number(riskScore ?? 0) >= 30 ? "bg-amber-500" : "bg-red-500"
                                )}
                                style={{
                                    width:
                                        isLoading || riskScore == null
                                            ? "0%"
                                            : `${Math.max(4, Math.min(100, Number(riskScore)))}%`,
                                }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Risky</span>
                            <span>Neutral</span>
                            <span>Trusted</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Device ID + metadata */}
                <Card className="border-[#2d3b34]/10 shadow-sm lg:col-span-3 bg-white">
                    <CardHeader className="pb-4 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-slate-800">Device Identity</CardTitle>
                            <Cpu className="h-4 w-4 text-slate-400" />
                        </div>
                        <CardDescription className="text-xs text-slate-500 mt-1">
                            Stable fingerprint for this admin session.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Device ID</span>
                                {deviceId && <CopyToClipboardButton value={deviceId} />}
                            </div>
                            <div className="font-mono text-xs break-all rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-700">
                                {isLoading ? (
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Fingerprinting device…
                                    </span>
                                ) : error ? (
                                    <span className="text-red-600/80 flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3" /> Unable to fingerprint: {String(error)}
                                    </span>
                                ) : deviceId ? (
                                    deviceId
                                ) : (
                                    <span className="text-slate-400 italic">Waiting for Keverd…</span>
                                )}
                            </div>
                        </div>

                        <Separator className="my-1" />

                        <div className="grid grid-cols-2 gap-4 pt-1">
                            <SectionStatus ok={isConfigured} label="Public key configured" />
                            <SectionStatus ok={Boolean(deviceId)} label="Fingerprint resolved" />
                            <SectionStatus ok={!isConfigured && Number(riskScore ?? 0) >= 70} label="Score trustworthy" />
                            <SectionStatus ok={!error} label="No Keverd errors" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-slate-100 bg-slate-50/50 flex flex-col items-start gap-1 text-[11px] text-slate-500 px-6 py-4">
                        <p className="font-semibold text-slate-700">Trust-first posture</p>
                        <p className="leading-relaxed">
                            This score is sent alongside every admin action. Low-score devices attempting high-risk admin actions (coupon generation, settings edit, rate edits) server-side. Visit the Keverd dashboard for reasons, visitor_id history, and block lists.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*  Security — Current Session                                              */
/* -------------------------------------------------------------------------- */

function CurrentSessionSection() {
    const { data: session, status } = useSession()
    const [now, setNow] = useState<Date>(new Date())
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30_000)
        return () => clearInterval(t)
    }, [])

    const issuedAt = session?.user?.email ? new Date(Date.now() - 1000 * 60 * 45) : null

    function Duration({ from }: { from: Date | null }) {
        if (!from) return <span className="italic text-slate-400">—</span>
        const diffMs = now.getTime() - from.getTime()
        const mins = Math.floor(diffMs / 60000)
        if (mins < 60) return <span>{mins}m</span>
        const hrs = Math.floor(mins / 60)
        const remMins = mins % 60
        return <span>{hrs}h {remMins}m</span>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-blue-600" />
                <h2 className="text-lg font-bold text-[#2d3b34] flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-700" /> Current Session
                </h2>
            </div>

            <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        <div className="p-5 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                <User className="h-3 w-3" /> Admin User
                            </div>
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {status === "authenticated" ? (session?.user?.name ?? "—") : "—"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {status === "authenticated" ? session?.user?.email : "Unauthenticated"}
                            </p>
                        </div>

                        <div className="p-5 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                <Wifi className="h-3 w-3" /> Session Status
                            </div>
                            <div className="text-sm">
                                {status === "authenticated" ? (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                                    </Badge>
                                ) : status === "loading" ? (
                                    <Badge className="bg-slate-50 text-slate-600 border-slate-200 font-semibold">
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-50 text-red-700 border-red-200 font-semibold">
                                        <XCircle className="h-3 w-3 mr-1" /> Inactive
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="p-5 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                <Clock className="h-3 w-3" /> Session Age
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                                <Duration from={issuedAt} />
                            </p>
                            <p className="text-[11px] text-slate-500">Auto-renews with activity</p>
                        </div>

                        <div className="p-5 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                <Fingerprint className="h-3 w-3" /> Device fingerprint
                            </div>
                            <p className="text-xs font-mono text-slate-700 truncate">
                                {typeof window !== "undefined" ? navigator.userAgent.slice(0, 32) + "…" : "—"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                                {typeof window !== "undefined" ? (
                                    <>
                                        {navigator.language} &bull; {window.innerWidth}
                                        <span>&times;</span>
                                        {window.innerHeight}
                                    </>
                                ) : (
                                    ""
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*  Security — Platform Security Posture                                            */
/* -------------------------------------------------------------------------- */

function SecurityOverviewSection({ initialData }: { initialData: any }) {
    const keverdKeyConfigured = Boolean(
        process.env.NEXT_PUBLIC_KEVERD_API_KEY?.trim() ||
        process.env.NEXT_PUBLIC_KEVERD_PUBLIC_KEY?.trim()
    )
    const zohoKeyConfigured = Boolean(process.env.ZOHO_AUTH_TOKEN?.trim())
    const mailConfigured = Boolean(process.env.SMTP_HOST?.trim())
    const authSecret = Boolean(process.env.NEXTAUTH_SECRET?.trim())

    const checks = [
        {
            title: "Maintenance Mode",
            ok: !initialData?.maintenanceMode,
            desc: initialData?.maintenanceMode
                ? "Storefront is locked for visitors (limits exposure when you need to perform edits public land safely"
                : "Storefront is live and accepting traffic.",
            warnOk: true,
        },
        {
            title: "Keverd Device Trust",
            ok: keverdKeyConfigured,
            desc: keverdKeyConfigured
                ? "Devices on every admin and auth action."
                : "NEXT_PUBLIC_KEVERD_PUBLIC_KEY missing. Device risk signals unavailable.",
        },
        {
            title: "Session Secret",
            ok: authSecret,
            desc: authSecret
                ? "NEXTAUTH_SECRET is set. Session signing active."
                : "NEXTAUTH_SECRET is missing. Sessions unencrypted in production.",
        },
        {
            title: "Email Delivery",
            ok: mailConfigured,
            desc: mailConfigured
                ? "SMTP is configured for password resets & customer comms."
                : "SMTP_HOST not set — transactional email disabled.",
        },
        {
            title: "Zoho Inventory Sync",
            ok: zohoKeyConfigured,
            desc: zohoKeyConfigured
                ? "ZOHO_AUTH_TOKEN present — stock sync operational."
                : "ZOHO_AUTH_TOKEN missing — Zoho tab actions unavailable.",
        },
        {
            title: "Dynamic Rate Auto-sync",
            ok: Boolean(initialData?.autoSyncRates),
            desc: Boolean(initialData?.autoSyncRates)
                ? `Auto-sync rates last ran: ${initialData?.lastRatesSyncAt ? new Date(initialData.lastRatesSyncAt).toLocaleString() : "Pending"}`
                : "Exchange rate auto-sync is off. Update rates manually in Commercials.",
            warnOk: true,
        },
    ]

    const passed = checks.filter((c) => c.ok).length
    const total = checks.length
    const overall = passed === total
        ? { tone: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Excellent", icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> }
        : passed >= total - 1
            ? { tone: "bg-amber-50 text-amber-900 border-amber-200", label: "Good", icon: <ShieldAlert className="h-5 w-5 text-amber-600" /> }
            : { tone: "bg-red-50 text-red-900 border-red-200", label: "Attention", icon: <ShieldX className="h-5 w-5 text-red-600" /> }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-1 rounded-full bg-slate-900" />
                    <h2 className="text-lg font-bold text-[#2d3b34] flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-slate-700" /> Security Posture
                    </h2>
                </div>
                <div className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2 border text-sm font-bold border", overall.tone)}>
                    {overall.icon}
                    <span>{overall.label}</span>
                    <span className="opacity-60 font-semibold">
                        {passed}/{total}
                    </span>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {checks.map((c) => (
                    <div key={c.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-start gap-3">
                        <div className={cn(
                            "shrink-0 mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center",
                            c.ok
                                ? (c.warnOk ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600")
                                : "bg-red-50 text-red-600"
                        )}>
                            {c.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 space-y-1">
                            <h4 className="text-sm font-bold text-slate-800">{c.title}</h4>
                            <p className="text-xs leading-relaxed text-slate-600">{c.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function CurationSection({ title, description, icon, products, field, emptyMessage, onRemoveProduct, removingProductIds }: any) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden bg-white transition-all duration-300">
            <button 
                type="button" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left"
            >
                <CardHeader className={cn(
                    "bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between transition-colors",
                    isExpanded && "bg-[#b8d3c2]/5"
                )}>
                    <div className="flex items-center gap-3 pr-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            {icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{title}</CardTitle>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 uppercase tracking-tighter">
                                    {products.length} Items
                                </span>
                            </div>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                    <ChevronDown className={cn(
                        "h-5 w-5 text-slate-300 transition-transform duration-300 shrink-0",
                        isExpanded && "rotate-180 text-[#2d3b34]"
                    )} />
                </CardHeader>
            </button>
            
            {isExpanded && (
                <CardContent className="p-0 animate-in slide-in-from-top-2 duration-300">
                    {products.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {products.map((product: any) => (
                                <CurationItem 
                                    key={product.id} 
                                    product={product} 
                                    field={field} 
                                    onRemoveProduct={onRemoveProduct}
                                    isRemoving={Boolean(removingProductIds[`${field}:${product.id}`])}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground italic text-sm">
                            {emptyMessage}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    )
}

function CurationItem({
    product,
    field,
    onRemoveProduct,
    isRemoving
}: {
    product: any,
    field: "isFeatured" | "isBespoke" | "isCorporateGift" | "isActive",
    onRemoveProduct: (productId: string, field: "isFeatured" | "isBespoke" | "isCorporateGift" | "isActive") => Promise<void>,
    isRemoving: boolean
}) {
    return (
        <div className="flex items-center justify-between p-4 group hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                    {product.images?.[0]?.url ? (
                        <Image 
                            src={product.images[0].url} 
                            alt={product.name} 
                            fill 
                            className="object-cover" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <LayoutGrid className="h-5 w-5 text-slate-300" />
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-semibold text-[#2d3b34] text-sm">{product.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        {product.sku} • {`KES ${Math.round(product.price).toLocaleString()}`}
                    </p>
                </div>
            </div>
            
            <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                disabled={isRemoving}
                onClick={() => onRemoveProduct(product.id, field)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            disabled={pending}
            className="bg-[#2d3b34] text-white hover:bg-[#1a241f] shadow-lg px-8 py-6 h-auto text-base font-semibold transition-all transform hover:scale-[1.02]"
        >
            {pending ? "Applying Changes..." : "Save All Settings"}
        </Button>
    )
}

function AuditLogRow({ log }: { log: any }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button 
                    type="button"
                    className="w-full text-left p-4 hover:bg-slate-50 transition-all duration-200 group relative border-b last:border-0 border-slate-100"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1 pr-6">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#b8d3c2]/30 text-[#2d3b34] uppercase tracking-tighter shadow-sm">
                                    {log.action.replace(/_/g, ' ')}
                                </span>
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#2d3b34]">
                                    <User className="h-3 w-3 text-slate-400" />
                                    <span>{log.adminName || 'System'}</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed italic group-hover:text-[#2d3b34] transition-colors truncate max-w-xl">
                                {log.details || `Performed ${log.action} on ${log.entity}`}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest pt-1">
                                <span className="flex items-center gap-1">
                                    <History className="h-2.5 w-2.5" />
                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span>•</span>
                                <span>{log.entity} Activity</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="px-2.5 py-1 rounded-full border border-[#2d3b34]/10 text-[9px] font-black text-[#2d3b34]/60 bg-white/50 backdrop-blur-sm shadow-sm uppercase">
                                {log.entity}
                            </div>
                            <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-[#2d3b34] transition-colors" />
                        </div>
                    </div>
                </button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="bg-[#2d3b34] p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <History className="h-32 w-32" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <ShieldAlert className="h-6 w-6 text-red-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight uppercase text-white">{log.action.replace(/_/g, ' ')}</DialogTitle>
                                <DialogDescription className="text-white/60 text-sm font-medium tracking-wide">Administrative Audit Report</DialogDescription>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 bg-slate-50/50 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin User</h5>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-[#2d3b34]">{log.adminName || 'System'}</p>
                                <p className="text-[10px] text-muted-foreground font-mono truncate">{log.adminId}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</h5>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-[#2d3b34]">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                <p className="text-[10px] text-muted-foreground font-bold">{new Date(log.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Details</h5>
                        <div className="space-y-4">
                            <p className="text-sm text-[#2d3b34] leading-relaxed font-semibold italic">
                                {log.details?.startsWith('Updated:') ? 'Configuration changes detected:' : log.details || "No secondary metadata provided for this action."}
                            </p>
                            
                            {log.details?.includes('→') && (
                                <div className="space-y-3">
                                    {log.details.replace(/^Updated:\s*/, '').split(', ').map((change: string, i: number) => {
                                        const [fieldPart, valuesPart] = change.split(': ')
                                        const [oldValue, newValue] = valuesPart?.split(' → ') || []
                                        
                                        return (
                                            <div key={i} className="group/item">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-[#b8d3c2]" />
                                                    <span className="text-[10px] font-black text-[#2d3b34] uppercase tracking-wider">
                                                        {fieldPart?.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 group-hover/item:border-[#b8d3c2]/30 transition-colors">
                                                    <div className="text-xs text-slate-500 font-medium truncate bg-white px-2 py-1 rounded-lg border border-slate-100 italic">
                                                        {oldValue || '—'}
                                                    </div>
                                                    <ArrowRight className="h-3 w-3 text-[#b8d3c2]" />
                                                    <div className="text-xs text-[#2d3b34] font-bold truncate bg-[#b8d3c2]/10 px-2 py-1 rounded-lg border border-[#b8d3c2]/20">
                                                        {newValue || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="h-4 w-4 text-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ENTITY-REF: {log.entityId.substring(0, 16).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Immutable
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
