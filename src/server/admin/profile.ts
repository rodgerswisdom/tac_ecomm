'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash, compare } from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type ProfileFormState = {
    status: "idle" | "loading" | "success" | "error"
    message?: string
    errors?: Record<string, string[]>
}

export async function updateProfileAction(
    prevState: ProfileFormState,
    formData: FormData
): Promise<ProfileFormState> {
    const session = await auth()
    if (!session?.user?.id) {
        return { status: "error", message: "Unauthorized" }
    }

    const validatedFields = profileSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
    })

    if (!validatedFields.success) {
        return {
            status: "error",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, email } = validatedFields.data

    try {
        // Check if email is already taken by another user
        if (email !== session.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })
            if (existingUser) {
                return { status: "error", message: "Email already in use" }
            }
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { name, email },
        })

        revalidatePath("/admin/profile")
        return { status: "success", message: "Profile updated successfully" }
    } catch (error) {
        console.error("Profile update error:", error)
        return { status: "error", message: "Something went wrong" }
    }
}

export async function updatePasswordAction(
    prevState: ProfileFormState,
    formData: FormData
): Promise<ProfileFormState> {
    const session = await auth()
    if (!session?.user?.id) {
        return { status: "error", message: "Unauthorized" }
    }

    const validatedFields = passwordSchema.safeParse({
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    })

    if (!validatedFields.success) {
        return {
            status: "error",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { currentPassword, newPassword } = validatedFields.data

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user || !user.passwordHash) {
            return { status: "error", message: "User not found" }
        }

        const isPasswordValid = await compare(currentPassword, user.passwordHash)
        if (!isPasswordValid) {
            return { status: "error", message: "Incorrect current password" }
        }

        const newPasswordHash = await hash(newPassword, 12)
        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash: newPasswordHash },
        })

        return { status: "success", message: "Password updated successfully" }
    } catch (error) {
        console.error("Password update error:", error)
        return { status: "error", message: "Something went wrong" }
    }
}
