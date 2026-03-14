"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Trash2, Archive } from "lucide-react"
import { bulkArchiveProducts, bulkDeleteProducts } from "@/server/admin/product-actions"
import { RowActions } from "@/components/admin/row-actions"
import { deleteProductAction } from "@/server/admin/product-actions"
import { BulkActions } from "./BulkActions"
import { AdminFormattedPrice } from "@/components/admin/admin-formatted-price"

interface Product {
    id: string
    name: string
    sku: string
    price: number
    stock: number
    isActive: boolean
    isDraft: boolean
    currency: string | null
    category: { name: string | null } | null
    images: { url: string; alt?: string | null; order?: number | null }[]
    productType: string
    shortDescription: string | null
    weight: number | null
    dimensions: string | null
    isFeatured: boolean
    comparePrice: number | null
    _count?: { orderItems: number; variants: number }
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
                                                        <Image src={image.url} alt={product.name} width={40} height={40} className="object-cover h-full w-full" sizes="40px" />
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
                                                <AdminFormattedPrice amount={product.price} amountCurrency={product.currency} />
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
                                                modalTitle="Product Summary"
                                                viewContent={
                                                    <div className="space-y-6">
                                                        <div className="flex items-start gap-4">
                                                            <div className="h-24 w-24 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shrink-0 shadow-sm">
                                                                {image ? (
                                                                    <Image src={image.url} alt={product.name} width={96} height={96} className="object-cover h-full w-full" />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-xl font-black text-slate-200 uppercase">
                                                                        {product.name.slice(0, 2)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="text-xl font-black text-brand-umber leading-tight truncate">{product.name}</h4>
                                                                    {product.isFeatured && (
                                                                        <span className="bg-brand-gold/20 text-brand-gold text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-brand-gold/10">Featured</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">{product.sku}</p>
                                                                <div className="mt-3 flex items-center gap-3">
                                                                    <div className="rounded-lg bg-brand-teal/5 px-3 py-1.5 border border-brand-teal/10">
                                                                        <span className="text-2xl font-black text-brand-teal">
                                                                            <AdminFormattedPrice amount={product.price} amountCurrency={product.currency} />
                                                                        </span>
                                                                    </div>
                                                                    {discount && (
                                                                        <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 italic">
                                                                            {discount}% OFF
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {product.shortDescription && (
                                                            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                                                <p className="text-[10px] font-black tracking-widest text-slate-400 mb-2">Short Preview</p>
                                                                <p className="text-sm text-slate-600 italic">"{product.shortDescription}"</p>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                                                            <div>
                                                                <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1">Product Type</p>
                                                                <p className="text-xs font-black text-brand-umber tracking-wider">{product.productType.replace(/_/g, ' ')}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1">Commercial Impact</p>
                                                                <p className="text-sm font-bold text-slate-700">{product._count?.orderItems ?? 0} total sales</p>
                                                            </div>
                                                            {(product.weight || product.dimensions) && (
                                                                <div className="col-span-2 mt-2 pt-2 border-t border-slate-50">
                                                                    <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1">Shipping Logistics</p>
                                                                    <p className="text-xs text-slate-500">
                                                                        {product.weight ? `${product.weight} kg` : ''} 
                                                                        {product.weight && product.dimensions ? ' • ' : ''}
                                                                        {product.dimensions ?? ''}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                             <div className="flex flex-col gap-1">
                                                                <p className="text-[10px] font-black tracking-widest text-slate-400">Inventory Status</p>
                                                                <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap font-black text-xs uppercase tracking-wider", status.text)}>
                                                                    <span className={cn("h-2 w-2 rounded-full", status.dot)} />
                                                                    {status.label} ({product.stock} units)
                                                                </span>
                                                             </div>
                                                             <div className="text-right flex flex-col items-end gap-1">
                                                                <p className="text-[10px] font-black tracking-widest text-slate-400">Classification</p>
                                                                <span className="text-sm font-bold text-slate-900">{product.category?.name ?? "Uncategorized"}</span>
                                                             </div>
                                                        </div>
                                                    </div>
                                                }
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
