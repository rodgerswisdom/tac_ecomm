"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ActionResult } from "@/server/admin/users"
import { Artisan } from "@prisma/client"

interface ArtisanFormProps {
  artisan?: Partial<Artisan>
  action: (prevState: ActionResult | undefined, formData: FormData) => Promise<ActionResult>
  title: string
}

export function ArtisanForm({ artisan, action, title }: ArtisanFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (prevState: ActionResult | undefined, formData: FormData) => {
    const result = await action(prevState, formData)
    if (result.success) {
      toast.success(artisan?.id ? "Artisan updated" : "Artisan created")
      router.push("/admin/artisans")
    } else if (result.error) {
      toast.error(result.error)
    }
    return result
  }, undefined)

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {artisan?.id && <input type="hidden" name="id" value={artisan.id} />}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={artisan?.name ?? ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="craft">Craft / Specialization</Label>
              <Input id="craft" name="craft" defaultValue={artisan?.craft ?? ""} placeholder="e.g. Traditional Beadwork, Gold Smith" required />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="region">Region Code (e.g. KE-MSA)</Label>
              <Input id="region" name="region" defaultValue={artisan?.region ?? ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regionLabel">Region Name (e.g. Mombasa, Kenya)</Label>
              <Input id="regionLabel" name="regionLabel" defaultValue={artisan?.regionLabel ?? ""} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portrait">Portrait Image URL</Label>
            <Input id="portrait" name="portrait" defaultValue={artisan?.portrait ?? ""} placeholder="https://res.cloudinary.com/..." required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Introduction Video URL (Optional)</Label>
            <Input id="video" name="video" defaultValue={artisan?.video ?? ""} placeholder="https://youtube.com/..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote">Personal Quote</Label>
            <Textarea
              id="quote"
              name="quote"
              defaultValue={artisan?.quote ?? ""}
              placeholder="A short inspiring quote from the artisan..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={artisan?.bio ?? ""}
              placeholder="Tell the artisan's story..."
              className="h-32"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community">Community Impact (Optional)</Label>
            <Textarea
              id="community"
              name="community"
              defaultValue={artisan?.community ?? ""}
              placeholder="Describe how their work impacts their local community..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : artisan?.id ? "Update Artisan" : "Create Artisan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
