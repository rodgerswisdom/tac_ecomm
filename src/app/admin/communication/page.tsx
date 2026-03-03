import { requireAdmin } from "@/server/admin/auth"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailForm } from "@/components/admin/communication/EmailForm"
import { SMSForm } from "@/components/admin/communication/SMSForm"
import { Mail, MessageSquare } from "lucide-react"

export default async function CommunicationPage() {
    await requireAdmin()
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <AdminPageHeader
                title="Communication"
                description="Manage bulk outreach to your customers and newsletter subscribers."
                breadcrumb={[
                    { label: "Overview", href: "/admin/overview" },
                    { label: "Communication", href: "/admin/communication" }
                ]}
            />

            <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md h-12 p-1 bg-[#b8d3c2]/20 rounded-xl">
                    <TabsTrigger
                        value="email"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#2d3b34] data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                    >
                        <Mail className="h-4 w-4" />
                        Bulk Email
                    </TabsTrigger>
                    <TabsTrigger
                        value="sms"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#2d3b34] data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Bulk SMS
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8 grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <TabsContent value="email" className="mt-0 ring-offset-background focus-visible:outline-none">
                            <EmailForm />
                        </TabsContent>

                        <TabsContent value="sms" className="mt-0 ring-offset-background focus-visible:outline-none">
                            <SMSForm />
                        </TabsContent>
                    </div>

                    <aside className="lg:col-span-4 space-y-6">
                        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm">
                            <h3 className="font-bold text-amber-900 mb-2">💡 Quick Tips</h3>
                            <ul className="text-sm text-amber-800/80 space-y-3">
                                <li className="flex gap-2">
                                    <span className="text-amber-500 font-bold">•</span>
                                    Personalize subjects to increase open rates.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-500 font-bold">•</span>
                                    Keep SMS short and include a clear call to action.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-500 font-bold">•</span>
                                    Segment your audience to send more relevant content.
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Compliance</h3>
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400">Important</span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Ensure you have explicit permission to contact the recipients. SMS marketing in Kenya requires compliance with CAK guidelines regarding opting out.
                            </p>
                        </div>
                    </aside>
                </div>
            </Tabs>
        </div>
    )
}
