'use client'

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { updateGlobalSettingsAction, toggleProductFlagAction, type SettingsFormState } from "@/server/admin/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Mail, Phone, MapPin, CreditCard, Instagram, Facebook, ShieldAlert, LayoutGrid, DollarSign, Contact, Sparkles, Stars, Gift, Trash2, ArrowRight, History, ChevronDown, User, Fingerprint, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"

export function GlobalSettingsForm({ 
    initialData,
    featuredProducts = [],
    bespokeProducts = [],
    corporateGiftProducts = [],
    auditLogs = []
}: { 
    initialData: any,
    featuredProducts?: any[],
    bespokeProducts?: any[],
    corporateGiftProducts?: any[],
    auditLogs?: any[]
}) {
    const [state, formAction] = useActionState(updateGlobalSettingsAction, { status: "idle" })
    const [showOlderLogs, setShowOlderLogs] = useState(false)

    useEffect(() => {
        if (state.status === "success") {
            toast.success(state.message || "Settings updated!")
        } else if (state.status === "error") {
            toast.error(state.message || "Failed to update settings")
        }
    }, [state])

    return (
        <form action={formAction} className="pb-10">
            <Tabs defaultValue="general" className="space-y-8">
                <TabsList className="bg-[#b8d3c2]/20 p-1 h-14 rounded-2xl border border-[#2d3b34]/5 shadow-sm">
                    <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#2d3b34] flex items-center gap-2 px-6 h-full transition-all">
                        <LayoutGrid className="h-4 w-4" />
                        <span className="font-medium">General Identity</span>
                    </TabsTrigger>
                    <TabsTrigger value="commercial" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#2d3b34] flex items-center gap-2 px-6 h-full transition-all">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">Commercials</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#2d3b34] flex items-center gap-2 px-6 h-full transition-all">
                        <Contact className="h-4 w-4" />
                        <span className="font-medium">Contact & Social</span>
                    </TabsTrigger>
                    <TabsTrigger value="curation" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#2d3b34] flex items-center gap-2 px-6 h-full transition-all">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-medium">Store Curation</span>
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#2d3b34] flex items-center gap-2 px-6 h-full transition-all">
                        <History className="h-4 w-4" />
                        <span className="font-medium">Security & Audit</span>
                    </TabsTrigger>
                </TabsList>

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
                                    <Label htmlFor="usdToKesRate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">USD → KES</Label>
                                    <div className="relative group">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-blue-600/30 group-focus-within:text-blue-600 transition-colors">KES</span>
                                        <Input id="usdToKesRate" name="usdToKesRate" type="number" step="0.01" defaultValue={initialData.usdToKesRate} className="pl-12 rounded-xl border-[#2d3b34]/10 h-12 text-lg font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="usdToEurRate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">USD → EUR</Label>
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

                <TabsContent value="curation" className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid gap-8">
                        <CurationSection 
                            title="Featured Collection" 
                            description="Selected items prominently displayed on the primary landing path."
                            icon={<Stars className="h-5 w-5 text-amber-500" />}
                            products={featuredProducts}
                            field="isFeatured"
                            emptyMessage="No featured products. High-quality imagery recommended for this slot."
                        />

                        <CurationSection 
                            title="Bespoke Showcase" 
                            description="Artisanal masterpieces highlighted in the custom-craft section."
                            icon={<Sparkles className="h-5 w-5 text-indigo-500" />}
                            products={bespokeProducts}
                            field="isBespoke"
                            emptyMessage="The bespoke gallery is currently empty. Add products that define your craft."
                        />

                        <CurationSection 
                            title="Corporate Gifting" 
                            description="Professional-grade selections curated for business partnerships."
                            icon={<Gift className="h-5 w-5 text-emerald-500" />}
                            products={corporateGiftProducts}
                            field="isCorporateGift"
                            emptyMessage="No corporate gift items. Select products suitable for bulk professional orders."
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

                <TabsContent value="audit" className="space-y-8 animate-in fade-in duration-300">
                    <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-900 border-b border-white/5 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="h-5 w-5 text-red-400" />
                                    <CardTitle className="text-white">Admin Audit Log</CardTitle>
                                </div>
                                <CardDescription className="text-slate-400">Chronological history of administrative actions on the platform.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                    Real-time
                                </span>
                            </div>
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
                                        {/* Today's Section */}
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

                                        {/* Older Section */}
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

                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                            <ShieldAlert className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-amber-900">Security Note</h4>
                            <p className="text-sm text-amber-800/70 leading-relaxed">
                                Audit logs are immutable records of administrative access. For critical security escalations, please contact the lead developer for full database-level traceability.
                            </p>
                        </div>
                    </div>
                </TabsContent>

                <div className="sticky bottom-6 flex justify-end">
                    <SubmitButton />
                </div>
            </Tabs>
        </form>
    )
}

function CurationSection({ title, description, icon, products, field, emptyMessage }: any) {
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

function CurationItem({ product, field }: { product: any, field: string }) {
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
                        {product.sku} • {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
                    </p>
                </div>
            </div>
            
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={async () => {
                    const formData = new FormData()
                    formData.append("productId", product.id)
                    formData.append("field", field)
                    formData.append("value", "false")
                    await toggleProductFlagAction(formData)
                }}
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
