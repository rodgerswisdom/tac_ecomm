import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const settingSections = [
  {
    title: "Store profile",
    description: "Manage support contacts and who can access the dashboard.",
    actions: [
      { label: "Manage admins and users", href: "/admin/users" },
      { label: "Review team access", href: "/admin/users" },
    ],
    note: "Support email and branding live in env/config; adjust there and redeploy to apply.",
  },
  {
    title: "Notifications",
    description: "Order and account emails are sent via the email service helpers.",
    actions: [
      { label: "Send a test (sign-in)", href: "/auth/signin" },
      { label: "View orders", href: "/admin/orders" },
    ],
    note: "Production SMTP/API keys must be set in env for deliveries to succeed.",
  },
  {
    title: "Security & access",
    description: "Restrict dashboard access to admins and rotate credentials regularly.",
    actions: [
      { label: "Review admin accounts", href: "/admin/users" },
      { label: "Audit recent orders", href: "/admin/orders" },
    ],
    note: "Enable MFA at your auth provider and keep NEXTAUTH_SECRET rotated.",
  },
  {
    title: "Appearance",
    description: "Theme tokens live in globals.css and theme.css for storefront branding.",
    actions: [
      { label: "Preview storefront", href: "/" },
      { label: "View dashboard overview", href: "/admin/overview" },
    ],
    note: "Use preview deployments to QA visual changes before publishing.",
  },
  {
    title: "Discount codes",
    description: "Create, edit, or expire coupons from the dedicated dashboard module.",
    actions: [
      { label: "Open discount codes", href: "/admin/coupons" },
    ],
    note: "Audit coupon usage and validity in the discount codes dashboard.",
  },
]

export default function SettingsPage() {
  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description="Central place for operational controls and pointers to where changes live."
        breadcrumb={[{ label: "Settings", href: "/admin/settings" }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {settingSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                {section.actions.map((action) => (
                  <Button key={action.label} asChild size="sm" variant="secondary">
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{section.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
