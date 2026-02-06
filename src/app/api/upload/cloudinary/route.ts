import { NextResponse } from "next/server"
import { getCloudinaryConfig } from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || undefined
    const tags = formData.get("tags") as string | undefined
    const tagList = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined

    if (!file || !(file instanceof Blob) || file.size === 0) {
      return NextResponse.json(
        { error: "Missing or invalid file" },
        { status: 400 }
      )
    }

    const config = getCloudinaryConfig()
    if (!config.cloudName || !config.uploadPreset) {
      return NextResponse.json(
        {
          error:
            "Cloudinary not configured. Set CLOUDINARY_URL (cloudinary://api_key:api_secret@cloud_name) and CLOUDINARY_UPLOAD_PRESET (or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET).",
        },
        { status: 503 }
      )
    }

    const uploadFormData = new FormData()
    uploadFormData.append("file", file)
    uploadFormData.append("upload_preset", config.uploadPreset)
    if (folder) uploadFormData.append("folder", folder)
    if (tagList?.length) uploadFormData.append("tags", tagList.join(","))

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      { method: "POST", body: uploadFormData }
    )

    const result = await response.json().catch(() => ({}))
    const cldError = response.headers.get("x-cld-error")

    if (!response.ok) {
      const message =
        cldError ||
        result?.error?.message ||
        result?.message ||
        response.statusText
      return NextResponse.json(
        { error: message || "Cloudinary upload failed" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    })
  } catch (err) {
    console.error("Upload API error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    )
  }
}
