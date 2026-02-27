"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { RowActions } from "@/components/admin/row-actions"
import { deleteUserAction, bulkDeleteUsersAction } from "@/server/admin/users"
import { BulkActions } from "../products/BulkActions"
import { Trash2 } from "lucide-react"

interface User {
    id: string
    name: string | null
    email: string | null
    role: string
    status: string
    createdAt: string | Date
    _count?: { orders: number }
}

interface UserTableProps {
    users: User[]
}

export function UserTable({ users }: UserTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const toggleAll = () => {
        if (selectedIds.length === users.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(users.map((u) => u.id))
        }
    }

    const toggleOne = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const getInitials = (name?: string | null, email?: string | null) => {
        const source = name?.trim() || email?.split("@")[0] || "User"
        const parts = source.split(/\s+/).filter(Boolean)
        if (parts.length === 0) return "US"
        if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
        return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
    }

    const formatUserCode = (id: string) => {
        const tail = id.slice(-5).toUpperCase()
        return `USR-${tail}`
    }

    const bulkActions = [
        {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            action: bulkDeleteUsersAction,
            variant: "destructive" as const,
        },
    ]

    return (
        <div className="space-y-4">
            {selectedIds.length > 0 && (
                <BulkActions
                    selectedIds={selectedIds}
                    onClear={() => setSelectedIds([])}
                    resourceName="user"
                    actions={bulkActions}
                />
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                        <tr>
                            <th className="w-12 px-4 py-3">
                                <Checkbox
                                    checked={selectedIds.length === users.length && users.length > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs">Name</th>
                            <th className="px-4 py-3 text-left text-xs">Email</th>
                            <th className="px-4 py-3 text-left text-xs">Role</th>
                            <th className="px-4 py-3 text-left text-xs">Orders</th>
                            <th className="px-4 py-3 text-left text-xs">Status</th>
                            <th className="px-4 py-4 text-left text-xs">SignUp Date</th>
                            <th className="px-4 py-3 text-right text-xs">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground italic">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const isSelected = selectedIds.includes(user.id)
                                return (
                                    <tr
                                        key={user.id}
                                        className={cn(
                                            "border-b last:border-b-0 transition-all duration-200",
                                            isSelected ? "bg-[#fff8ee]" : "hover:bg-[#fffaf5]"
                                        )}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleOne(user.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#cfa46c]/30 bg-[#fffaf1] text-xs font-bold text-[#7b4f28]">
                                                    {getInitials(user.name, user.email)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-[#3b2b21] truncate">{user.name ?? "Customer"}</p>
                                                    <p className="text-[10px] uppercase tracking-widest text-[#ad8452] font-medium">
                                                        {formatUserCode(user.id)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-[#5c4a3a]">{user.email}</td>
                                        <td className="px-4 py-4 capitalize text-[#5c4a3a] font-medium">{user.role.toLowerCase()}</td>
                                        <td className="px-4 py-4 text-[#5c4a3a]">{user._count?.orders ?? 0}</td>
                                        <td className="px-4 py-4">
                                            {user.status === "Inactive" ? (
                                                <span className="inline-flex items-center gap-1 text-red-600">
                                                    <span className="h-2 w-2 inline-block rounded-full bg-red-500 "/>Inactive
                                                </span>
                                            ) : user.status === "Active" ? (
                                                <span className="inline-flex items-center gap-1 text-green-600">
                                                    <span className="h-2 w-2 inline-block rounded-full bg-green-500"/>Active
                                                </span>
                                            ) : (
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                                        "bg-[#e6f5ec] text-[#2b6148]"
                                                    )}
                                                >
                                                    {user.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-xs text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <RowActions
                                                viewHref={`/admin/users/${user.id}`}
                                                editHref={`/admin/users/${user.id}`}
                                                deleteConfig={{
                                                    action: deleteUserAction,
                                                    fields: { id: user.id },
                                                    resourceLabel: user.name ?? user.email ?? "User",
                                                    confirmTitle: `Delete ${user.name ?? "this user"}?`,
                                                    confirmDescription: "This action cannot be undone and may affect related data.",
                                                    confirmButtonLabel: "Delete User",
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
