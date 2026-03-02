'use client'

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { updateProfileAction, type ProfileFormState } from "@/server/admin/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const initialState: ProfileFormState = { status: "idle" }

export function ProfileForm({
    initialData
}: {
    initialData: { name: string | null; email: string }
}) {
    const [state, formAction] = useActionState(updateProfileAction, initialState)

    useEffect(() => {
        if (state.status === "success") {
            toast.success(state.message || "Profile updated!")
        } else if (state.status === "error" && state.message) {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Card className="border-[#2d3b34]/10 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-[#2d3b34]">Personal Information</CardTitle>
                <p className="text-sm text-muted-foreground">Update your identity and contact details.</p>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={initialData.name ?? ""}
                            placeholder="Your full name"
                            className="border-[#2d3b34]/20 focus-visible:ring-[#2d3b34]/30"
                        />
                        {state.errors?.name && (
                            <p className="text-xs text-red-500 font-medium">{state.errors.name[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={initialData.email}
                            placeholder="your@email.com"
                            className="border-[#2d3b34]/20 focus-visible:ring-[#2d3b34]/30"
                        />
                        {state.errors?.email && (
                            <p className="text-xs text-red-500 font-medium">{state.errors.email[0]}</p>
                        )}
                    </div>

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            disabled={pending}
            className="bg-[#2d3b34] text-white hover:bg-[#1a241f] transition-all min-w-[140px]"
        >
            {pending ? "Saving Changes..." : "Save Profile"}
        </Button>
    )
}
