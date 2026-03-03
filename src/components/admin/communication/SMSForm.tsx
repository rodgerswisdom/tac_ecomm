"use client"

import { useActionState, useEffect, useState } from "react"
import { sendBulkSmsAction } from "@/server/admin/communication"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"

export function SMSForm() {
    const [state, action, isPending] = useActionState(sendBulkSmsAction, { status: "idle" })
    const [charCount, setCharCount] = useState(0)

    useEffect(() => {
        if (state.status === "success") {
            toast.success(state.message)
            const form = document.getElementById("sms-form") as HTMLFormElement
            form?.reset()
            setCharCount(0)
        } else if (state.status === "error") {
            toast.error(state.message)
        }
    }, [state])

    const maxChars = 160
    const smsCount = Math.ceil(charCount / maxChars) || 1

    return (
        <Card className="border-[#2d3b34]/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-emerald-50/30 border-b border-emerald-100/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Bulk SMS Blast</CardTitle>
                        <CardDescription>Send instant text messages to customer mobile numbers.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <form id="sms-form" action={action} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="recipientType">Target Audience</Label>
                        <Select name="recipientType" defaultValue="ALL_USERS">
                            <SelectTrigger className="rounded-xl border-[#d8b685]/30">
                                <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL_USERS">All Users with Phone Numbers</SelectItem>
                                <SelectItem value="CUSTOMERS_ONLY">Previous Customers with Phone Numbers</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="message">Text Message</Label>
                            <span className={cn(
                                "text-xs font-bold",
                                charCount > maxChars ? "text-amber-600" : "text-muted-foreground"
                            )}>
                                {charCount} / {maxChars} ({smsCount} SMS)
                            </span>
                        </div>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="e.g. Your favorite store is now live with the Summer collection! Check it out at tac.com"
                            required
                            rows={4}
                            className="rounded-xl border-[#d8b685]/30 resize-none"
                            onChange={(e) => setCharCount(e.target.value.length)}
                        />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            Standard SMS is 160 characters. Longer messages will be split.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-12 rounded-xl bg-[#2d3b34] text-[#edece0] hover:bg-[#1f2824] transition-all shadow-lg shadow-[#2d3b34]/10"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Dispatching Messages...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Bulk SMS
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ")
}
