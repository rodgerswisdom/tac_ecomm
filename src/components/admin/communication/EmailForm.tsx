"use client"

import { useActionState, useEffect } from "react"
import { sendBulkEmailAction } from "@/server/admin/communication"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mail, Send } from "lucide-react"
import { toast } from "sonner"

export function EmailForm() {
    const [state, action, isPending] = useActionState(sendBulkEmailAction, { status: "idle" })

    useEffect(() => {
        if (state.status === "success") {
            toast.success(state.message)
            const form = document.getElementById("email-form") as HTMLFormElement
            form?.reset()
        } else if (state.status === "error") {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-blue-50/30 border-b border-blue-100/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Bulk Email Blast</CardTitle>
                        <CardDescription>Reach your subscribers and customers via email.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <form id="email-form" action={action} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="recipientType">Target Audience</Label>
                        <Select name="recipientType" defaultValue="ALL_USERS">
                            <SelectTrigger className="rounded-xl border-[#d8b685]/30">
                                <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL_USERS">All Registered Users</SelectItem>
                                <SelectItem value="NEWSLETTER_SUBSCRIBERS">Newsletter Subscribers Only</SelectItem>
                                <SelectItem value="CUSTOMERS_ONLY">Previous Customers Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Email Subject</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="e.g. New Collection Arrived! 🏺"
                            required
                            className="rounded-xl border-[#d8b685]/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Message Content (Rich text/HTML supported via template)</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder="Write your email content here..."
                            required
                            rows={10}
                            className="rounded-xl border-[#d8b685]/30 resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            Tip: Content will be wrapped in the TAC Accessories brand template.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-12 rounded-xl bg-[#4a2b28] text-[#f2dcb8] hover:bg-[#3d221f] transition-all shadow-lg shadow-[#4a2b28]/10"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing Deliveries...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Bulk Email
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
