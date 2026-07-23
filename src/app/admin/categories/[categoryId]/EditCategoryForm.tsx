"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/server/admin/users"
import { updateCategoryAction } from "@/server/admin/categories"
import { useAdminActionFeedback } from "@/hooks/use-admin-action-feedback"
import { EditCategoryImageField } from "./EditCategoryImageField"

type EditCategoryFormProps = {
  category: {
    id: string
    name: string
    slug: string | null
    description: string | null
    image: string | null
    showOnHomepage: boolean
    homepageOrder: number
  }
}

const initialState: ActionResult = { success: false, error: undefined }

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  )
}

export function EditCategoryForm({ category }: EditCategoryFormProps) {
  const [state, formAction] = useActionState(updateCategoryAction, initialState)
  useAdminActionFeedback(state, { successMessage: "Category saved." })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={category.id} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="name">
                Title
              </label>
              <Input id="name" name="name" defaultValue={category.name} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="slug">
                Slug
              </label>
              <Input
                id="slug"
                name="slug"
                defaultValue={category.slug ?? ""}
                placeholder="auto-generated if left blank"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="description">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category.description ?? ""}
              rows={4}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category image</label>
            <p className="text-xs text-muted-foreground">
              Upload a new image to replace the current one.
            </p>
            <EditCategoryImageField defaultImage={category.image} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  name="showOnHomepage"
                  defaultChecked={category.showOnHomepage}
                  className="h-4 w-4 rounded border border-input"
                />
                Show on homepage
              </label>
              <p className="text-xs text-muted-foreground">
                Include this category in the Curated Collections section on the home page.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="homepageOrder">
                Homepage order
              </label>
              <Input
                id="homepageOrder"
                name="homepageOrder"
                type="number"
                min={0}
                defaultValue={category.homepageOrder}
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href="/admin/categories">Cancel</Link>
            </Button>
            <SaveButton />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
