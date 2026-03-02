import { requireAdmin } from "@/server/admin/auth"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminPageHeader } from "@/components/admin/page-header"
import { ProfileForm } from "@/components/admin/profile/ProfileForm"
import { SecurityForm } from "@/components/admin/profile/SecurityForm"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export default async function AdminProfilePage() {
    const session = await requireAdmin()
    const userId = session.user?.id
    if (!userId) {
        notFound()
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user) {
        notFound()
    }

    const userInitials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : user.email[0].toUpperCase()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <AdminPageHeader
                title="My Profile"
                description="Manage your account settings, identity, and security preferences."
                breadcrumb={[
                    { label: "Dashboard", href: "/admin/overview" },
                    { label: "Profile", href: "/admin/profile" },
                ]}
            />

            <div className="grid gap-6 lg:grid-cols-3 items-start">
                {/* Profile Card & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="overflow-hidden border-[#2d3b34]/10 shadow-md">
                        <div className="h-24 bg-gradient-to-r from-[#d8b780] to-[#b8d3c2]" />
                        <CardContent className="relative pt-0 pb-6 px-6">
                            <div className="flex flex-col items-center -mt-12">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                    <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                                    <AvatarFallback className="bg-[#b8d3c2] text-[#2d3b34] text-2xl font-bold">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="mt-4 text-xl font-bold text-[#2d3b34]">
                                    {user.name || "Administrator"}
                                </h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <div className="mt-2 inline-flex items-center rounded-full bg-[#b8d3c2]/30 px-3 py-0.5 text-xs font-medium text-[#2d3b34]">
                                    {user.role}
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Joined On</span>
                                    <span className="text-[#2d3b34] font-semibold">{format(user.createdAt, "MMMM yyyy")}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Last Login</span>
                                    <span className="text-[#2d3b34] font-semibold">
                                        {user.lastActiveAt ? format(user.lastActiveAt, "p, MMM d") : "Never"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Account Status</span>
                                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold uppercase tracking-wider text-[10px]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                        {user.status || "ACTIVE"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#2d3b34]/10 p-6 bg-[#b8d3c2]/5">
                        <p className="text-xs text-[#2d3b34]/60 leading-relaxed font-medium">
                            This account has full administrative access to the TAC operations console.
                            Please ensure you follow security best practices.
                        </p>
                    </Card>
                </div>

                {/* Edit Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <ProfileForm initialData={{ name: user.name, email: user.email }} />
                    <SecurityForm />
                </div>
            </div>
        </div>
    )
}
