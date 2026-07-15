"use server"

import { Prisma } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"
import { assertAdmin } from "./auth"
import type { ActionResult } from "./users"

const categorySchema = z.object({
    id: z.string().cuid().optional(),
    name: z.string().min(2),
    description: z.string().optional().nullable(),
    image: z.string().url().optional().nullable(),
    parentId: z.string().cuid().optional().nullable(),
    showOnHomepage: z.coerce.boolean().optional().default(false),
    homepageOrder: z.coerce.number().int().min(0).optional().default(0),
    slug: z
        .string()
        .min(2)
        .max(80)
        .regex(/^[a-z0-9-]+$/i, "Slug can only contain letters, numbers, and dashes")
        .optional()
        .nullable(),
})

function parseShowOnHomepage(value: FormDataEntryValue | null) {
    return value === "on" || value === "true"
}

function resolveHomepageFields(parentId: string | null | undefined, showOnHomepage: boolean, homepageOrder: number) {
    if (parentId) {
        return { showOnHomepage: false, homepageOrder: 0 }
    }
    return { showOnHomepage, homepageOrder }
}

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

function normalizeImage(value: FormDataEntryValue | null) {
    const trimmed = value?.toString().trim()
    return trimmed ? trimmed : null
}

function revalidateCategoryPaths(slug?: string | null, categoryId?: string) {
    revalidatePath("/admin/categories")
    if (categoryId) {
        revalidatePath(`/admin/categories/${categoryId}`)
    }
    revalidatePath("/")
    revalidatePath("/collections")
    if (slug) {
        revalidatePath(`/collections/${slug}`)
    }
}

export async function getCategories() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            parent: { select: { id: true, name: true } },
            _count: { select: { products: true, children: true } },
        },
    })

    return ensureCategorySlugRecords(categories)
}


export async function getCategoryOptions() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { parent: { select: { name: true, slug: true } } },
    })

    return categories
        .filter((category) => category.parentId !== null)
        .map((category) => ({
            id: category.id,
            name: category.parent
                ? `${category.parent.name} / ${category.name}`
                : category.name,
            slug: category.slug,
            parentSlug: category.parent?.slug ?? null,
        }))
}

export async function getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            parent: { select: { id: true, name: true } },
            _count: { select: { products: true, children: true } },
        },
    })

    return category ? ensureCategorySlugRecord(category) : null
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

type CategoryRecord = Prisma.CategoryGetPayload<{
    include: {
        parent: { select: { id: true, name: true } }
        _count: { select: { products: true, children: true } }
    }
}>

async function ensureCategorySlugRecords<T extends CategoryRecord>(categories: T[]): Promise<T[]> {
    return Promise.all(categories.map((category) => ensureCategorySlugRecord(category) as Promise<T>))
}

async function ensureCategorySlugRecord<T extends CategoryRecord>(category: T): Promise<T> {
    if (category.slug) {
        return category
    }

    const slug = await resolveCategorySlug(category.name, undefined, category.id)
    await prisma.category.update({ where: { id: category.id }, data: { slug } })

    return { ...category, slug } as T
}

export async function createCategoryAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
    await assertAdmin()

    const parsed = categorySchema.safeParse({
        name: formData.get("name")?.toString() ?? "",
        description: formData.get("description")?.toString(),
        image: normalizeImage(formData.get("image")),
        parentId: formData.get("parentId")?.toString() || undefined,
        showOnHomepage: parseShowOnHomepage(formData.get("showOnHomepage")),
        homepageOrder: formData.get("homepageOrder")?.toString() ?? "0",
        slug: normalizeSlug(formData.get("slug")),
    })

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid category data" }
    }

    const slug = await resolveCategorySlug(parsed.data.name, parsed.data.slug ?? undefined)
    const homepageFields = resolveHomepageFields(
        parsed.data.parentId,
        parsed.data.showOnHomepage ?? false,
        parsed.data.homepageOrder ?? 0,
    )

    try {
        const created = await prisma.category.create({
            data: {
                ...parsed.data,
                ...homepageFields,
                slug,
            },
        })
        revalidateCategoryPaths(slug, created.id)
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return { error: "Category slug must be unique" }
        }
        return { error: "Failed to create category" }
    }

    return { success: true }
}

export async function updateCategoryAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
    await assertAdmin()

    const parsed = categorySchema.safeParse({
        id: formData.get("id")?.toString(),
        name: formData.get("name")?.toString() ?? "",
        description: formData.get("description")?.toString(),
        image: normalizeImage(formData.get("image")),
        parentId: formData.get("parentId")?.toString() || undefined,
        showOnHomepage: parseShowOnHomepage(formData.get("showOnHomepage")),
        homepageOrder: formData.get("homepageOrder")?.toString() ?? "0",
        slug: normalizeSlug(formData.get("slug")),
    })

    if (!parsed.success || !parsed.data.id) {
        return { error: parsed.success ? "Category id is required" : parsed.error.issues[0]?.message }
    }

    const slug = await resolveCategorySlug(parsed.data.name, parsed.data.slug ?? undefined, parsed.data.id)
    const homepageFields = resolveHomepageFields(
        parsed.data.parentId,
        parsed.data.showOnHomepage ?? false,
        parsed.data.homepageOrder ?? 0,
    )

    try {
        await prisma.category.update({
            where: { id: parsed.data.id },
            data: {
                ...parsed.data,
                ...homepageFields,
                slug,
            },
        })
        revalidateCategoryPaths(slug, parsed.data.id)
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return { error: "Category slug must be unique" }
        }
        return { error: "Failed to update category" }
    }

    return { success: true }
}

export async function deleteCategoryAction(formData: FormData) {
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

    revalidateCategoryPaths(category.slug, categoryId)
}

export async function toggleCategoryHomepageAction(
    _prev: ActionResult | undefined,
    formData: FormData,
): Promise<ActionResult> {
    await assertAdmin()

    const categoryId = formData.get("categoryId")?.toString()
    if (!categoryId) {
        return { error: "Category id is required" }
    }

    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true, slug: true, parentId: true, showOnHomepage: true },
    })

    if (!category) {
        return { error: "Category not found" }
    }

    if (category.parentId) {
        return { error: "Only main categories can appear on the homepage" }
    }

    try {
        await prisma.category.update({
            where: { id: categoryId },
            data: { showOnHomepage: !category.showOnHomepage },
        })
        revalidateCategoryPaths(category.slug, categoryId)
    } catch {
        return { error: "Failed to update homepage visibility" }
    }

    return { success: true }
}
