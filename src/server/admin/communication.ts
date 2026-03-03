"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { EmailService, getEmailConfig } from "@/lib/email"
import { SMSService, getSMSConfig } from "@/lib/sms"
import { assertAdmin } from "./auth"
import { revalidatePath } from "next/cache"
import { logAdminAction } from "./audit"

const bulkEmailSchema = z.object({
    subject: z.string().min(3).max(100),
    content: z.string().min(10),
    recipientType: z.enum(["ALL_USERS", "NEWSLETTER_SUBSCRIBERS", "CUSTOMERS_ONLY"]),
})

const bulkSmsSchema = z.object({
    message: z.string().min(5).max(160),
    recipientType: z.enum(["ALL_USERS", "CUSTOMERS_ONLY"]), // Usually users with phone numbers
})

export type CommunicationFormState = {
    status: "idle" | "success" | "error"
    message?: string
    recipientsCount?: number
}

export async function sendBulkEmailAction(
    _prevState: CommunicationFormState,
    formData: FormData
): Promise<CommunicationFormState> {
    try {
        await assertAdmin()
    } catch (error) {
        return { status: "error", message: "Unauthorized" }
    }

    const parsed = bulkEmailSchema.safeParse({
        subject: formData.get("subject"),
        content: formData.get("content"),
        recipientType: formData.get("recipientType"),
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        }
    }

    try {
        let recipients: string[] = []

        if (parsed.data.recipientType === "ALL_USERS") {
            const users = await prisma.user.findMany({ select: { email: true } })
            recipients = users.map(u => u.email)
        } else if (parsed.data.recipientType === "NEWSLETTER_SUBSCRIBERS") {
            const subs = await prisma.newsletter.findMany({
                where: { isActive: true },
                select: { email: true }
            })
            recipients = subs.map(s => s.email)
        } else if (parsed.data.recipientType === "CUSTOMERS_ONLY") {
            const customers = await prisma.order.findMany({
                distinct: ['userId'],
                select: { user: { select: { email: true } } }
            })
            recipients = customers.map(c => c.user.email)
        }

        if (recipients.length === 0) {
            return { status: "error", message: "No recipients found for the selected category" }
        }

        const emailService = new EmailService(getEmailConfig())

        // In a real world scenario, you'd use a queue/worker for this
        // For now we'll do them in parallel with a limit or sequentially
        // Using a simple loop for reliability in this context
        let successCount = 0
        for (const email of recipients) {
            const sent = await emailService.sendEmail({
                to: email,
                subject: parsed.data.subject,
                html: wrapInTemplate(parsed.data.content, parsed.data.subject),
            })
            if (sent) successCount++
        }

        await logAdminAction(
            "BULK_EMAIL" as any,
            "Communication",
            "bulk-email",
            `Sent email "${parsed.data.subject}" to ${successCount} recipients (${parsed.data.recipientType})`
        )

        return {
            status: "success",
            message: `Bulk email sent successfully to ${successCount} recipients`,
            recipientsCount: successCount
        }
    } catch (error) {
        console.error("Bulk Email Action Error:", error)
        return { status: "error", message: "Failed to process bulk emails" }
    }
}

export async function sendBulkSmsAction(
    _prevState: CommunicationFormState,
    formData: FormData
): Promise<CommunicationFormState> {
    try {
        await assertAdmin()
    } catch (error) {
        return { status: "error", message: "Unauthorized" }
    }

    const parsed = bulkSmsSchema.safeParse({
        message: formData.get("message"),
        recipientType: formData.get("recipientType"),
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        }
    }

    try {
        let phoneNumbers: string[] = []

        // Fetch unique phone numbers from address book
        const addresses = await prisma.address.findMany({
            where: {
                phone: { not: null },
                ...(parsed.data.recipientType === "CUSTOMERS_ONLY" ? {
                    orders: { some: {} }
                } : {})
            },
            select: { phone: true },
            distinct: ['phone']
        })

        phoneNumbers = addresses
            .map(a => a.phone)
            .filter((p): p is string => !!p)

        if (phoneNumbers.length === 0) {
            return { status: "error", message: "No phone numbers found for the selected category" }
        }

        const smsService = new SMSService(getSMSConfig())
        const result = await smsService.sendSMS({
            to: phoneNumbers,
            message: parsed.data.message
        })

        if (!result.success) {
            return { status: "error", message: result.error || "Failed to send SMS" }
        }

        await logAdminAction(
            "BULK_SMS" as any,
            "Communication",
            "bulk-sms",
            `Sent SMS to ${result.recipientsCount} recipients (${parsed.data.recipientType})`
        )

        return {
            status: "success",
            message: `Bulk SMS sent successfully to ${result.recipientsCount} recipients`,
            recipientsCount: result.recipientsCount
        }
    } catch (error) {
        console.error("Bulk SMS Action Error:", error)
        return { status: "error", message: "Failed to process bulk SMS" }
    }
}

function wrapInTemplate(content: string, subject: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8ebd2; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; border: 1px solid #f8ebd2; border-top: none; border-radius: 0 0 8px 8px; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #999; }
        .button { display: inline-block; padding: 12px 24px; background: #4a2b28; color: #f2dcb8; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #4a2b28; margin: 0;">TAC Accessories</h1>
        </div>
        <div class="content">
          <h2 style="color: #4a2b28;">${subject}</h2>
          <div style="white-space: pre-wrap;">${content}</div>
          <div style="text-align: center;">
            <a href="${process.env.APP_URL || 'https://tacaccessories.com'}" class="button">Visit Our Store</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TAC Accessories. All rights reserved.</p>
          <p>You received this email because you're a valued customer or subscriber.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
