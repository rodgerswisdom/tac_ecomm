import { Prisma } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import { assertAdmin } from "./auth"

const categorySchema = z.object({
    id: z.string().cuid().optional(),
    name: z.string().min(2),
    description: z.string().optional().nullable(),
    image: z.string().url().optional().nullable(),
    parentId: z.string().cuid().optional().nullable(),
    slug: z
        .string()
        .min(2)
        .max(80)
        .regex(/^[a-z0-9-]+$/i, "Slug can only contain letters, numbers, and dashes")
        .optional()
        .nullable(),
})

function normalizeSlug(value: FormDataEntryValue | null) {
    const raw = value?.toString().trim().toLowerCase()
    if (!raw) return undefined
    const cleaned = raw
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    return cleaned || undefined
}

export async function getCategories() {
    return prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            parent: { select: { id: true, name: true } },
            _count: { select: { products: true, children: true } },
        },
    })
}

export async function getCategoryOptions() {
    return prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
}

async function resolveCategorySlug(name: string, proposedSlug?: string, existingId?: string) {
    const base = generateSlug(proposedSlug || name)
    if (!base) throw new Error("Unable to generate category slug")

    let suffix = 0
    let candidate = base
    while (true) {
        const match = await prisma.category.findUnique({ where: { slug: candidate } })
        if (!match || match.id === existingId) {
            return candidate
        }
        suffix += 1
        candidate = `${base}-${suffix}`
    }
}

export async function createCategoryAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const parsed = categorySchema.safeParse({
        name: formData.get("name")?.toString() ?? "",
        description: formData.get("description")?.toString(),
        image: formData.get("image")?.toString(),
        parentId: formData.get("parentId")?.toString() || undefined,
        slug: normalizeSlug(formData.get("slug")),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid category data")
    }

    const slug = await resolveCategorySlug(parsed.data.name, parsed.data.slug ?? undefined)

    await prisma.category.create({
        data: {
            ...parsed.data,
            slug,
        },
    })

    revalidatePath("/admin/categories")
}

export async function updateCategoryAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const parsed = categorySchema.safeParse({
        id: formData.get("id")?.toString(),
        name: formData.get("name")?.toString() ?? "",
        description: formData.get("description")?.toString(),
        image: formData.get("image")?.toString(),
        parentId: formData.get("parentId")?.toString() || undefined,
        slug: normalizeSlug(formData.get("slug")),
    })

    if (!parsed.success || !parsed.data.id) {
        throw new Error(parsed.success ? "Category id is required" : parsed.error.issues[0]?.message)
    }

    const slug = await resolveCategorySlug(parsed.data.name, parsed.data.slug ?? undefined, parsed.data.id)

    await prisma.category.update({
        where: { id: parsed.data.id },
        data: {
            ...parsed.data,
            slug,
        },
    })

    revalidatePath("/admin/categories")
}

export async function deleteCategoryAction(formData: FormData) {
    "use server"

    await assertAdmin()

    const categoryId = formData.get("categoryId")?.toString()
    if (!categoryId) throw new Error("Category id is required")

    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { _count: { select: { products: true, children: true } } },
    })

    if (!category) {
        throw new Error("Category not found")
    }

    if (category._count.products > 0) {
        throw new Error("Cannot delete a category that still has products")
    }

    if (category._count.children > 0) {
        throw new Error("Reassign or delete child categories first")
    }

    try {
        await prisma.category.delete({ where: { id: categoryId } })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            throw new Error("Category is still referenced and cannot be deleted")
        }
        throw error
    }

    revalidatePath("/admin/categories")
}
