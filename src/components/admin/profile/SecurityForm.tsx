'use client'

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { updatePasswordAction, type ProfileFormState } from "@/server/admin/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const initialState: ProfileFormState = { status: "idle" }

export function SecurityForm() {
    const [state, formAction] = useActionState(updatePasswordAction, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.status === "success") {
            toast.success(state.message || "Password updated!")
            formRef.current?.reset()
        } else if (state.status === "error" && state.message) {
            toast.error(state.message)
        }
    }, [state])

    return (
        <Card className="border-red-100 shadow-sm border-2">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-red-900">Security & Password</CardTitle>
                <p className="text-sm text-red-600/70">Ensure your account is protected with a strong password.</p>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">Current Password</Label>
                        <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            placeholder="••••••••"
                            className="border-gray-200 focus-visible:ring-red-500/20"
                        />
                        {state.errors?.currentPassword && (
                            <p className="text-xs text-red-500 font-medium">{state.errors.currentPassword[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">New Password</Label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="••••••••"
                            className="border-gray-200 focus-visible:ring-red-500/20"
                        />
                        {state.errors?.newPassword && (
                            <p className="text-xs text-red-500 font-medium">{state.errors.newPassword[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="border-gray-200 focus-visible:ring-red-500/20"
                        />
                        {state.errors?.confirmPassword && (
                            <p className="text-xs text-red-500 font-medium">{state.errors.confirmPassword[0]}</p>
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
            className="bg-red-600 text-white hover:bg-red-700 transition-all min-w-[140px]"
        >
            {pending ? "Updating..." : "Update Password"}
        </Button>
    )
}
