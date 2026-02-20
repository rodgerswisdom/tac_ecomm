"use client"

import { useState, useTransition } from "react"
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

interface ProductImage {
    id: string
    url: string
    alt: string | null
    order: number | null
}

interface ImageSortableGalleryProps {
    productId: string
    initialImages: ProductImage[]
    onDeleteAction: (formData: FormData) => Promise<void>
    onReorderAction: (productId: string, imageIds: string[]) => Promise<void>
}

export function ImageSortableGallery({
    productId,
    initialImages,
    onDeleteAction,
    onReorderAction,
}: ImageSortableGalleryProps) {
    const [items, setItems] = useState(initialImages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
    const [isPending, startTransition] = useTransition()

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

                // Trigger server update
                startTransition(async () => {
                    try {
                        await onReorderAction(productId, newItems.map(i => i.id))
                    } catch (error) {
                        console.error("Failed to reorder images:", error)
                        // Rollback on error if needed, but for now we just log
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((image, index) => (
                        <SortableImage
                            key={image.id}
                            image={image}
                            index={index}
                            isPending={isPending}
                            onDeleteAction={onDeleteAction}
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
}: {
    image: ProductImage
    index: number
    isPending: boolean
    onDeleteAction: (formData: FormData) => Promise<void>
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
            className="group relative rounded-lg border border-border bg-white p-2 shadow-sm"
        >
            <div className="relative h-40 w-full overflow-hidden rounded-md bg-muted">
                <Image
                    src={image.url}
                    alt={image.alt ?? "Product image"}
                    fill
                    sizes="200px"
                    className="object-cover"
                />

                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute left-2 top-2 cursor-grab rounded-md bg-white/90 p-1.5 text-muted-foreground shadow-sm hover:text-foreground active:cursor-grabbing"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Delete Form */}
                <form
                    action={onDeleteAction}
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
                </form>
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {index === 0 ? "Primary" : `Position ${index + 1}`}
                </span>
            </div>
        </div>
    )
}
