"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { cn, formatPrice } from "@/lib/utils"
import { Trash2, Archive } from "lucide-react"
import { bulkArchiveProducts, bulkDeleteProducts } from "@/server/admin/product-actions"
import { RowActions } from "@/components/admin/row-actions"
import { deleteProductAction } from "@/server/admin/product-actions"
import { BulkActions } from "./BulkActions"

interface Product {
    id: string
    name: string
    sku: string
    price: number
    comparePrice: number | null
    stock: number
    isActive: boolean
    isDraft: boolean
    currency: string | null
    category: { name: string | null } | null
    images: { url: string; alt?: string | null; order?: number | null }[]
}

interface ProductTableProps {
    products: Product[]
}

export function ProductTable({ products }: ProductTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const toggleAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(products.map((p) => p.id))
        }
    }

    const toggleOne = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const getPrimaryImage = (p: Product) => {
        if (!p.images?.length) return undefined
        return [...p.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]
    }

    const getDiscountPercent = (p: Product) => {
        if (!p.comparePrice || p.comparePrice <= p.price) return null
        return Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
    }

    const getStatus = (p: Product) => {
        if (p.isDraft) {
            return {
                label: "Draft",
                dot: "bg-amber-500",
                text: "text-amber-600",
            }
        }
        const inStock = p.stock > 0 && p.isActive
        return {
            label: inStock ? "In stock" : "Out of stock",
            dot: inStock ? "bg-emerald-500" : "bg-rose-500",
            text: inStock ? "text-emerald-600" : "text-rose-600",
        }
    }

    const bulkActions = [
        {
            label: "Archive",
            icon: <Archive className="h-4 w-4" />,
            action: bulkArchiveProducts,
        },
        {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            action: bulkDeleteProducts,
            variant: "destructive" as const,
        },
    ]

    return (
        <div className="space-y-4">
            {selectedIds.length > 0 && (
                <BulkActions
                    selectedIds={selectedIds}
                    onClear={() => setSelectedIds([])}
                    resourceName="product"
                    actions={bulkActions}
                />
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                        <tr>
                            <th className="w-12 px-4 py-3">
                                <Checkbox
                                    checked={selectedIds.length === products.length && products.length > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs">Product</th>
                            <th className="px-4 py-3 text-left text-xs">Category</th>
                            <th className="px-4 py-3 text-left text-xs">Price</th>
                            <th className="px-4 py-3 text-left text-xs">Stock</th>
                            <th className="px-4 py-3 text-left text-xs">Status</th>
                            <th className="px-4 py-3 text-right text-xs">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => {
                                const image = getPrimaryImage(product)
                                const discount = getDiscountPercent(product)
                                const status = getStatus(product)
                                const isSelected = selectedIds.includes(product.id)

                                return (
                                    <tr
                                        key={product.id}
                                        className={cn(
                                            "border-b last:border-b-0 transition-colors",
                                            isSelected ? "bg-muted/30" : "hover:bg-muted/10"
                                        )}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleOne(product.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted shrink-0">
                                                    {image ? (
                                                        <Image src={image.url} alt={product.name} width={40} height={40} className="object-cover h-full w-full" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[10px] uppercase font-bold text-muted-foreground">
                                                            {product.name.slice(0, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium truncate">{product.name}</span>
                                                        {product.isDraft && (
                                                            <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-amber-900">
                                                                Draft
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-tight">
                                                        SKU: {product.sku}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-muted-foreground">
                                            {product.category?.name ?? "—"}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="font-medium">
                                                {formatPrice(product.price, product.currency ?? "USD")}
                                            </div>
                                            {discount && (
                                                <div className="text-[10px] font-bold text-emerald-600">
                                                    {discount}% OFF
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-4">{product.stock}</td>

                                        <td className="px-4 py-4">
                                            <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", status.text)}>
                                                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                                                {status.label}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-right">
                                            <RowActions
                                                viewHref={`/admin/products/${product.id}`}
                                                editHref={`/admin/products/${product.id}`}
                                                deleteConfig={{
                                                    action: deleteProductAction,
                                                    fields: { productId: product.id },
                                                    resourceLabel: product.name,
                                                    confirmTitle: `Delete ${product.name}?`,
                                                    confirmDescription: `This will permanently remove ${product.name}.`,
                                                }}
                                            />
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
