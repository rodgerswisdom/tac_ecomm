import { requireAdmin } from "@/server/admin/auth"
import { getAdminSettingsData } from "@/server/admin/settings"
import { AdminPageHeader } from "@/components/admin/page-header"
import { GlobalSettingsForm } from "@/components/admin/settings/GlobalSettingsForm"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, Tag, Users } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  await requireAdmin()
  const { globalSettings } = await getAdminSettingsData()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Settings"
        description="Global configuration for store identity, operations, and communications."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }]}
      />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold bg-[#b8d3c2]/50 text-[#2d3b34] rounded-xl transition-all"
            >
              <Settings className="h-4 w-4" />
              Global Store
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-[#b8d3c2]/10 hover:text-[#2d3b34] rounded-xl transition-all"
            >
              <Users className="h-4 w-4" />
              Users & Team
            </Link>
            <Link
              href="/admin/coupons"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-[#b8d3c2]/10 hover:text-[#2d3b34] rounded-xl transition-all"
            >
              <Tag className="h-4 w-4" />
              Coupons
            </Link>
          </nav>
        </aside>

        <main className="flex-1">
          <GlobalSettingsForm initialData={globalSettings} />
        </main>
      </div>
    </div>
  )
}
