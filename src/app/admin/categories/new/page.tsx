import { AdminPageHeader } from "@/components/admin/page-header"
import { ImageUploader } from "@/components/ImageUploader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createCategoryAction, getCategoryOptions } from "@/server/admin/categories"

export default async function NewCategoryPage() {
  const categories = await getCategoryOptions()
  const labelTone = "text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8b5a2b]"
  const fieldTone =
    "rounded-2xl border border-[#cfa46c]/70 bg-[#fff8ee] text-[#3f3324] placeholder:text-[#ad8452] focus:border-[#4b9286] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b9286]/35"
  const textareaTone =
    "rounded-2xl border border-[#cfa46c]/70 bg-[#fff8ee] text-[#3f3324] placeholder:text-[#ad8452] focus:border-[#4b9286] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b9286]/35"
  const selectTone =
    "h-12 w-full rounded-2xl border border-[#cfa46c]/70 bg-[#fff8ee] px-4 text-sm text-[#3f3324] focus:border-[#4b9286] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b9286]/35"

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Add new category"
        description="Define taxonomy entries that power storefront navigation."
        breadcrumb={[
          { label: "Categories", href: "/admin/categories" },
          { label: "Add new category", href: "/admin/categories/new" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              form="create-category-form"
              type="submit"
              className="rounded-full border border-transparent bg-[#4a2b28] px-6 text-[#f2dcb8] shadow-[0_8px_22px_rgba(74,43,40,0.35)] transition hover:bg-[#3b211f]"
            >
              Publish category
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border border-transparent bg-[#fff9f1] px-6 text-[#4a2b28] shadow-[0_8px_22px_rgba(74,43,40,0.12)] transition hover:bg-[#ffefd8]"
            >
              Save draft
            </Button>
          </div>
        }
      />

      <form
        id="create-category-form"
        action={createCategoryAction}
        className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
      >
        <Card className="border border-[#e2c49a]/80 bg-[#fffaf1] text-[#3f3324] shadow-[0_25px_60px_rgba(112,78,45,0.18)]">
          <CardHeader className="space-y-1 border-b border-[#f0c272]/30 pb-6">
            <CardTitle className="text-2xl font-semibold text-[#7b4f28]">Basic information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="category-name" className={labelTone}>
                Category title
              </label>
              <Input
                id="category-name"
                name="name"
                placeholder="Enter a category title..."
                required
                className={`h-12 ${fieldTone}`}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category-description" className={labelTone}>
                Category description
              </label>
              <Textarea
                id="category-description"
                name="description"
                placeholder="Enter a category description..."
                rows={5}
                className={textareaTone}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="category-slug" className={labelTone}>
                  Category slug
                </label>
                <Input
                  id="category-slug"
                  name="slug"
                  placeholder="Enter a category slug..."
                  className={`h-12 ${fieldTone}`}
                />
                <p className="text-xs text-[#7d5b3b]">Leave blank to auto-generate from the title.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="category-parent" className={labelTone}>
                  Parent category (optional)
                </label>
                <select
                  id="category-parent"
                  name="parentId"
                  className={selectTone}
                  defaultValue=""
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e2c49a]/80 bg-[#fff8ee] text-[#3f3324] shadow-[0_20px_45px_rgba(112,78,45,0.2)]">
          <CardHeader className="border-b border-[#f0c272]/30 pb-6">
            <CardTitle className="text-xl font-semibold text-[#7b4f28]">Category image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[#7d5b3b]">
            <p>Click to upload or drag and drop. SVG, PNG, JPG or GIF (MAX: 800x400px).</p>
            <ImageUploader
              mode="single"
              name="image"
              helperText="SVG, PNG, JPG or GIF (max 800x400px)"
              folder="categories"
              tags={["categories", "admin"]}
            />
          </CardContent>
        </Card>
      </form>

      <div className="flex items-center gap-3 lg:hidden">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-full border border-transparent bg-[#fff9f1] text-[#4a2b28] shadow-[0_8px_22px_rgba(74,43,40,0.12)] hover:bg-[#ffefd8]"
        >
          Save draft
        </Button>
        <Button
          form="create-category-form"
          type="submit"
          className="flex-1 rounded-full border border-transparent bg-[#4a2b28] text-[#f2dcb8] shadow-[0_8px_22px_rgba(74,43,40,0.35)] hover:bg-[#3b211f]"
        >
          Publish category
        </Button>
      </div>
    </div>
  )
}
