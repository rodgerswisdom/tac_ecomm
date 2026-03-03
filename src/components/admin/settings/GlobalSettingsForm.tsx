'use client'

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { updateGlobalSettingsAction, type SettingsFormState } from "@/server/admin/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Mail, Phone, MapPin, CreditCard, Instagram, Facebook, ShieldAlert, LayoutGrid, DollarSign, Contact } from "lucide-react"

export function GlobalSettingsForm({ initialData }: { initialData: any }) {
    const [state, formAction] = useActionState(updateGlobalSettingsAction, { status: "idle" })

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
                </TabsList>

                <TabsContent value="general" className="space-y-8 animate-in fade-in duration-300">
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

                <TabsContent value="commercial" className="space-y-8 animate-in fade-in duration-300">
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

                <TabsContent value="contact" className="space-y-8 animate-in fade-in duration-300">
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
                                    <Label htmlFor="smsSenderId">SMS Sender ID (UPPERCASE)</Label>
                                    <Input id="smsSenderId" name="smsSenderId" defaultValue={initialData.smsSenderId} className="rounded-xl border-slate-200" maxLength={11} placeholder="e.g. TAC" />
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
                                        placeholder="https://instagram.com/tac_accessories"
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
                                        placeholder="https://facebook.com/tacaccessories"
                                    />
                                    {state.errors?.facebookUrl && <p className="text-xs text-red-500 font-medium">{state.errors.facebookUrl[0]}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <div className="sticky bottom-6 flex justify-end">
                    <SubmitButton />
                </div>
            </Tabs>
        </form>
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
