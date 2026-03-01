import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getEmailConfig } from '@/lib/email'
import { EmailService } from '@/lib/email'

const BUDGET_VALUES = ['500-1000', '1000-2500', '2500-5000', '5000+'] as const
const CATEGORY_VALUES = [
  'earrings',
  'rings',
  'bracelets',
  'necklaces',
  'hair-accessories',
  'matching-sets',
] as const

const createBespokeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email'),
  phone: z.string().max(50).optional(),
  vision: z.string().min(1, 'Please describe your vision').max(5000),
  category: z.enum(CATEGORY_VALUES),
  categoryLabel: z.string().min(1).max(100),
  budget: z.enum(BUDGET_VALUES),
  timeline: z.string().min(1).max(50),
  isExpress: z.boolean().default(false),
  expressPremium: z.number().min(0).max(1).default(0),
  photos: z.array(z.string().url()).max(10).default([]),
})

export type CreateBespokeBody = z.infer<typeof createBespokeSchema>

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createBespokeSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors
      const message = Object.entries(first)
        .map(([k, v]) => (Array.isArray(v) ? v[0] : v))
        .filter(Boolean)[0] ?? 'Invalid request'
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }
    const data = parsed.data

    const request = await prisma.bespokeRequest.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        vision: data.vision.trim(),
        category: data.category,
        categoryLabel: data.categoryLabel.trim(),
        budget: data.budget,
        timeline: data.timeline.trim(),
        isExpress: data.isExpress,
        expressPremium: data.expressPremium,
        photoUrls: data.photos,
        status: 'NEW',
      },
    })

    // Notify admin (do not fail the request if email fails)
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && adminEmail.trim() && !adminEmail.toLowerCase().startsWith('your-')) {
      try {
        const emailService = new EmailService(getEmailConfig())
        const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://www.tacaccessories.co.ke'
        const adminLink = `${appUrl.replace(/\/$/, '')}/admin/bespoke/${request.id}`
        const photoList =
          data.photos.length > 0
            ? data.photos.map((url, i) => `<li><a href="${url}">Reference image ${i + 1}</a></li>`).join('')
            : '<li>None</li>'
        await emailService.sendEmail({
          to: adminEmail,
          subject: `New bespoke consultation request from ${data.name} | TAC Accessories`,
          html: `
            <h2>New bespoke consultation request</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || '—'}</p>
            <p><strong>Category:</strong> ${data.categoryLabel}</p>
            <p><strong>Budget:</strong> ${data.budget}</p>
            <p><strong>Timeline:</strong> ${data.timeline}${data.isExpress ? ' (Express)' : ''}</p>
            <p><strong>Vision:</strong></p>
            <p>${data.vision.replace(/\n/g, '<br>')}</p>
            <p><strong>Reference photos:</strong></p>
            <ul>${photoList}</ul>
            <p><a href="${adminLink}">View in admin</a></p>
          `,
        })
      } catch (err) {
        console.error('Bespoke admin notification email failed:', err)
      }
    }

    return NextResponse.json({
      success: true,
      id: request.id,
      message: 'Your consultation request has been received. We\'ll be in touch soon.',
    })
  } catch (error) {
    console.error('Bespoke request creation failed:', error)
    return NextResponse.json(
      { success: false, error: 'Unable to submit your request. Please try again later.' },
      { status: 500 }
    )
  }
}
