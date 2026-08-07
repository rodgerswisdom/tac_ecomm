import { requireAdmin } from "@/server/admin/auth"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Tag, Users, Store, ArrowRight, Shield, Bell, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function SettingsPage() {
  await requireAdmin()

  const quickLinks = [
    {
      title: "Global Store",
      description: "Store identity, commercials, contact, curation, homepage offers, and audit logs.",
      href: "/admin/global-store",
      icon: <Store className="h-5 w-5" />,
      accent: "bg-[#b8d3c2]/20 text-[#2d3b34]",
      cta: "Manage Store",
    },
    {
      title: "Users & Team",
      description: "Admin accounts, roles, and team access permissions.",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      accent: "bg-blue-50 text-blue-700",
      cta: "Manage Team",
    },
    {
      title: "Discount Codes",
      description: "Coupon creation, usage tracking, and promotions.",
      href: "/admin/coupons",
      icon: <Tag className="h-5 w-5" />,
      accent: "bg-amber-50 text-amber-700",
      cta: "Manage Coupons",
    },
  ]

  const comingSoon = [
    {
      title: "Notifications",
      description: "Email, SMS, and in-app notification preferences.",
      icon: <Bell className="h-5 w-5" />,
      accent: "bg-purple-50 text-purple-700",
    },
    {
      title: "Branding",
      description: "Custom logo, color scheme, and email templates.",
      icon: <Palette className="h-5 w-5" />,
      accent: "bg-pink-50 text-pink-700",
    },
    {
      title: "Security",
      description: "Two-factor auth, session management, and API keys.",
      icon: <Shield className="h-5 w-5" />,
      accent: "bg-emerald-50 text-emerald-700",
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Settings"
        description="Administrative configuration hub. Jump to the area you need to manage below."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }]}
      />

      <div className="space-y-10">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-[#2d3b34]" />
            <h2 className="text-lg font-bold text-[#2d3b34]">Configuration Areas</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group block">
                <Card className="h-full border-[#2d3b34]/10 shadow-sm overflow-hidden bg-white/70 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-[#2d3b34]/20">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-3 rounded-2xl", link.accent)}>
                        {link.icon}
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-[#2d3b34] group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl text-[#2d3b34]">{link.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{link.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 pt-2 text-sm font-semibold text-[#2d3b34]">
                      <span>{link.cta}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-muted-foreground/30" />
            <h2 className="text-lg font-bold text-muted-foreground/70">Coming Soon</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {comingSoon.map((item) => (
              <Card key={item.title} className="h-full border-dashed border-2 border-muted/50 bg-muted/20 opacity-80">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-3 rounded-2xl opacity-70", item.accent)}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 bg-muted-foreground/10 px-3 py-1 rounded-full">
                      Soon
                    </span>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-muted-foreground/60">{item.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed opacity-70">{item.description}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

