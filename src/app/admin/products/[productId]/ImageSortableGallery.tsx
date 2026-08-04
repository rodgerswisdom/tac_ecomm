"use client"

import { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminActionForm } from "@/components/admin/AdminActionForm"
import { adminToast } from "@/lib/admin/feedback"
import type { ActionResult } from "@/lib/admin/action-result"

interface ProductImage {
    id: string
    url: string
    alt: string | null
    description?: string | null
    order: number | null
}

interface ImageSortableGalleryProps {
    productId: string
    initialImages: ProductImage[]
    onDeleteAction: (formData: FormData) => Promise<void | ActionResult>
    onUpdateAction: (formData: FormData) => Promise<void | ActionResult>
    onReorderAction: (productId: string, imageIds: string[]) => Promise<void>
    compact?: boolean
}

export function ImageSortableGallery({
    productId,
    initialImages,
    onDeleteAction,
    onUpdateAction,
    onReorderAction,
    compact = false,
}: ImageSortableGalleryProps) {
    const [items, setItems] = useState(initialImages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
    const [isPending, startTransition] = useTransition()

    // Keep local gallery in sync after server refresh (e.g. add/delete image).
    useEffect(() => {
        setItems([...initialImages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
    }, [initialImages])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                const newItems = arrayMove(items, oldIndex, newIndex)

                startTransition(async () => {
                    try {
                        await onReorderAction(productId, newItems.map(i => i.id))
                        adminToast.success("Image order updated.")
                    } catch (error) {
                        adminToast.error(
                            error instanceof Error ? error.message : "Failed to reorder images."
                        )
                    }
                })

                return newItems
            })
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className={compact ? "grid gap-3" : "grid gap-4"}>
                    {items.map((image, index) => (
                        <SortableImage
                            key={image.id}
                            image={image}
                            index={index}
                            isPending={isPending}
                            onDeleteAction={onDeleteAction}
                            onUpdateAction={onUpdateAction}
                            onLocalUpdate={(next) => {
                                setItems((prev) =>
                                    prev.map((item) => (item.id === next.id ? { ...item, ...next } : item)),
                                )
                            }}
                            compact={compact}
                        />
                    ))}
                </div>
            </SortableContext>
            {isPending && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Updating sequence...
                </div>
            )}
        </DndContext>
    )
}

function SortableImage({
    image,
    index,
    isPending,
    onDeleteAction,
    onUpdateAction,
    onLocalUpdate,
    compact = false,
}: {
    image: ProductImage
    index: number
    isPending: boolean
    onDeleteAction: (formData: FormData) => Promise<void | ActionResult>
    onUpdateAction: (formData: FormData) => Promise<void | ActionResult>
    onLocalUpdate: (next: Pick<ProductImage, "id" | "alt" | "description">) => void
    compact?: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative rounded-lg border border-border bg-white p-3 shadow-sm"
        >
            <div className={`flex gap-3 ${compact ? "flex-col" : "flex-col sm:flex-row"}`}>
                <div className={`relative shrink-0 overflow-hidden rounded-md bg-muted ${compact ? "h-36 w-full" : "h-40 w-40"}`}>
                    <Image
                        src={image.url}
                        alt={image.alt ?? "Product image"}
                        fill
                        sizes="200px"
                        className="object-cover"
                    />

                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute left-2 top-2 cursor-grab rounded-md bg-white/90 p-1.5 text-muted-foreground shadow-sm hover:text-foreground active:cursor-grabbing"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>

                    <AdminActionForm
                        action={onDeleteAction}
                        successMessage="Image removed."
                        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                        <input type="hidden" name="imageId" value={image.id} />
                        <Button
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7 rounded-md"
                            disabled={isPending}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </AdminActionForm>
                </div>

                <AdminActionForm
                    action={async (formData) => {
                        const result = await onUpdateAction(formData)
                        if (!result?.error) {
                            onLocalUpdate({
                                id: image.id,
                                alt: formData.get("alt")?.toString() || null,
                                description: formData.get("description")?.toString() || null,
                            })
                        }
                        return result
                    }}
                    successMessage="Design details saved."
                    className="min-w-0 flex-1 space-y-2"
                >
                    <input type="hidden" name="imageId" value={image.id} />
                    <div className="flex items-center justify-between px-0.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {index === 0 ? "Primary design" : `Design ${index + 1}`}
                        </span>
                    </div>
                    <label className="block space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Label (alt)</span>
                        <Input
                            name="alt"
                            defaultValue={image.alt ?? ""}
                            placeholder={`Design ${index + 1}`}
                            className="h-8 text-sm"
                        />
                    </label>
                    <label className="block space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Description</span>
                        <textarea
                            name="description"
                            defaultValue={image.description ?? ""}
                            rows={3}
                            placeholder="Optional. Falls back to the product default description when empty."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </label>
                    <Button type="submit" size="sm" variant="outline" disabled={isPending}>
                        Save design
                    </Button>
                </AdminActionForm>
            </div>
        </div>
    )
}
