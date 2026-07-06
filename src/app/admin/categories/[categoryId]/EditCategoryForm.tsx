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
import { EditCategoryImageField } from "./EditCategoryImageField"

type EditCategoryFormProps = {
  category: {
    id: string
    name: string
    slug: string | null
    description: string | null
    image: string | null
    parent: { id: string; name: string } | null
  }
  parentOptions: Array<{ id: string; name: string }>
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

export function EditCategoryForm({ category, parentOptions }: EditCategoryFormProps) {
  const [state, formAction] = useActionState(updateCategoryAction, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={category.id} />

          {state.error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </div>
          ) : null}
          {state.success ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Category saved.
            </div>
          ) : null}

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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category image</label>
              <p className="text-xs text-muted-foreground">
                Upload a new image to replace the current one.
              </p>
              <EditCategoryImageField defaultImage={category.image} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="parentId">
                Parent category
              </label>
              <select
                id="parentId"
                name="parentId"
                defaultValue={category.parent?.id ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
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
