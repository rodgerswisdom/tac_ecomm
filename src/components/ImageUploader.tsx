"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ImageIcon, Loader2, Upload, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCloudinary, validateImageFile } from "@/lib/cloudinary"

interface BaseUploaderProps {
  onChange?: (files: File[], urls: string[]) => void
  maxSizeMb?: number
  folder?: string
  tags?: string[]
}

interface SingleUploaderProps extends BaseUploaderProps {
  mode?: "single"
  name?: string
  helperText?: string
  defaultValue?: string
}

interface MultipleUploaderProps extends BaseUploaderProps {
  mode: "multiple"
  label?: string
  description?: string
  maxFiles?: number
  defaultValues?: string[]
}

type ImageUploaderProps = SingleUploaderProps | MultipleUploaderProps

export function ImageUploader(props: ImageUploaderProps) {
  if (props.mode === "multiple") {
    return <MultipleImageUploader {...props} />
  }

  return <SingleImageUploader {...props} />
}

function SingleImageUploader({
  name,
  helperText = "SVG, PNG, JPG or GIF (max 800x400px)",
  maxSizeMb = 5,
  defaultValue = "",
  onChange,
  folder = "categories",
  tags = ["categories", "admin"],
}: SingleUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { uploadImage } = useCloudinary()

  const handleFiles = useCallback(
    async (files?: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]
      const validation = validateImageFile(file, {
        maxSize: maxSizeMb * 1024 * 1024,
        acceptedTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"],
      })

      if (!validation.valid) {
        alert(validation.error ?? "Invalid file")
        return
      }

      setUploading(true)
      try {
        const result = await uploadImage(file, { folder, tags })
        setPreview(result.secure_url)
        onChange?.([file], [result.secure_url])
      } catch (error) {
        console.error(error)
        alert("Failed to upload image. Please try again.")
      } finally {
        setUploading(false)
      }
    },
    [folder, maxSizeMb, onChange, tags, uploadImage]
  )

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    void handleFiles(event.dataTransfer.files)
  }

  const openFilePicker = () => fileInputRef.current?.click()

  return (
    <div>
      {name ? <input type="hidden" name={name} value={preview} /> : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openFilePicker()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDrop={handleDrop}
        className={cn(
          "flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-[#d4b17f]/60 bg-[#fff8ee] text-center text-[#5a381e] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_16px_30px_rgba(174,133,76,0.22)] transition",
          isDragging
            ? "border-[#f0c272] bg-[#fff1dd]"
            : "hover:border-[#f0c272] hover:bg-[#fff1dd]"
        )}
      >
        {preview ? (
          <div className="relative h-full w-full overflow-hidden rounded-3xl">
            <Image src={preview} alt="Preview" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full bg-[#3f2914]/70 px-4 py-2 text-sm text-[#fef3e2]">
              <span>Change image</span>
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-[#7d5b3b]">
            {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImageIcon className="h-8 w-8" />}
            <div>
              <p className="text-sm font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs text-[#a0764c]">{helperText}</p>
            </div>
          </div>
        )}
      </div>

      {preview ? (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#d4b17f]/70 bg-[#fff1dd] px-3 py-2 text-xs text-[#5a381e]">
          <span className="truncate" title={preview}>
            {preview}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-[#dd4c3a] hover:text-[#ff816e]"
            onClick={() => {
              setPreview("")
              onChange?.([], [])
            }}
          >
            <X className="h-4 w-4" /> Remove
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function MultipleImageUploader({
  onChange,
  label = "Reference Photos (Optional)",
  description,
  maxFiles = 5,
  maxSizeMb = 5,
  defaultValues = [],
  folder = "bespoke-uploads",
  tags = ["bespoke", "reference"],
}: MultipleUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>(defaultValues)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(defaultValues)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage } = useCloudinary()

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const newFiles: File[] = []
    const errors: string[] = []

    Array.from(selectedFiles).forEach((file) => {
      if (uploadedUrls.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`)
        return
      }

      const validation = validateImageFile(file, { maxSize: maxSizeMb * 1024 * 1024 })
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`)
        return
      }

      newFiles.push(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPreviews((prev) => [...prev, result])
      }
      reader.readAsDataURL(file)
    })

    if (errors.length > 0) {
      alert(errors.join("\n"))
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles])
      await uploadFiles(newFiles, uploadedUrls.length)
    }
  }

  const uploadFiles = async (filesToUpload: File[], startIndex: number) => {
    setUploading(true)
    const newUrls: string[] = []

    try {
      await Promise.all(
        filesToUpload.map(async (file, index) => {
          const currentIndex = startIndex + index
          try {
            setUploadProgress((prev) => ({ ...prev, [currentIndex]: 50 }))
            const result = await uploadImage(file, { folder, tags })
            newUrls.push(result.secure_url)
            setUploadProgress((prev) => ({ ...prev, [currentIndex]: 100 }))
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error)
            newUrls.push("")
            setUploadProgress((prev) => ({ ...prev, [currentIndex]: 0 }))
          }
        })
      )

      const allUrls = [...uploadedUrls, ...newUrls]
      setUploadedUrls(allUrls)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Some files failed to upload. Please try again.")
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress({}), 1000)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    const newUrls = uploadedUrls.filter((_, i) => i !== index)

    setFiles(newFiles)
    setPreviews(newPreviews)
    setUploadedUrls(newUrls)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    void handleFileSelect(event.dataTransfer.files)
  }

  useEffect(() => {
    onChange?.(files, uploadedUrls)
  }, [files, onChange, uploadedUrls])

  return (
    <div className="space-y-4">
      {label ? (
        <label className="block text-sm font-medium text-brand-umber mb-2">{label}</label>
      ) : null}
      <p className="text-xs text-brand-umber/60 mb-4">
        {description ?? `Upload photos to help us understand your vision. Max ${maxFiles} files, ${maxSizeMb}MB each.`}
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-brand-teal bg-brand-teal/10" : "border-brand-umber/20 hover:border-brand-teal/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => void handleFileSelect(event.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-jade/20 flex items-center justify-center">
            <Upload className="h-6 w-6 text-brand-teal" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-umber">
              Drag and drop photos here, or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-brand-teal hover:text-brand-coral underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-brand-umber/60 mt-1">PNG, JPG, GIF up to {maxSizeMb}MB</p>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {previews.map((preview, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group aspect-square rounded-lg overflow-hidden border border-brand-umber/20 bg-brand-beige/50"
              >
                <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />

                {uploading && uploadProgress[index] !== undefined && (
                  <div className="absolute inset-0 bg-brand-umber/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
                      <p className="text-xs text-white">{uploadProgress[index]}%</p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-umber/80 hover:bg-brand-coral flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-white" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-umber/80 to-transparent p-2">
                  <p className="text-xs text-white truncate">{files[index]?.name ?? `Image ${index + 1}`}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-brand-umber/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading photos...</span>
        </div>
      )}
    </div>
  )
}
