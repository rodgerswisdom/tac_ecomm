// Cloudinary image upload and optimization utilities
// Supports a single CLOUDINARY_URL (cloudinary://api_key:api_secret@cloud_name) or separate env vars.

export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadPreset: string
}

/** Parse Cloudinary URL: cloudinary://api_key:api_secret@cloud_name */
export function parseCloudinaryUrl(url: string): { cloudName: string; apiKey: string; apiSecret: string } | null {
  if (!url || !url.startsWith("cloudinary://")) return null
  try {
    const u = new URL(url)
    const cloudName = u.hostname
    const apiKey = u.username
    const apiSecret = decodeURIComponent(u.password)
    if (!cloudName || !apiKey || !apiSecret) return null
    return { cloudName, apiKey, apiSecret }
  } catch {
    return null
  }
}

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface TransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'crop'
  quality?: 'auto' | number
  format?: 'auto' | 'webp' | 'jpg' | 'png'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
}

export class CloudinaryService {
  private config: CloudinaryConfig

  constructor(config: CloudinaryConfig) {
    this.config = config
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(
    file: File | Blob,
    options: {
      folder?: string
      publicId?: string
      tags?: string[]
      transformation?: TransformOptions
    } = {}
  ): Promise<UploadResult> {
    if (!this.config.cloudName || !this.config.uploadPreset) {
      throw new Error(
        "Cloudinary configuration is missing. Set CLOUDINARY_URL (cloudinary://api_key:api_secret@cloud_name) or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
      )
    }
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', this.config.uploadPreset)

      if (options.folder) {
        formData.append('folder', options.folder)
      }

      if (options.publicId) {
        formData.append('public_id', options.publicId)
      }

      if (options.tags) {
        formData.append('tags', options.tags.join(','))
      }

      // Add transformations
      if (options.transformation) {
        const transforms = this.buildTransformationString(options.transformation)
        formData.append('transformation', transforms)
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`Upload failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`)
      }

      const result = await response.json()

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw new Error('Failed to upload image')
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: File[],
    options: {
      folder?: string
      tags?: string[]
      transformation?: TransformOptions
      publicId?: string
    } = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadImage(file, {
        ...options,
        publicId: options.publicId ? `${options.publicId}_${index}` : undefined
      })
    )

    return Promise.all(uploadPromises)
  }

  /**
   * Generate optimized image URL
   */
  getOptimizedImageUrl(
    publicId: string,
    transformation: TransformOptions = {}
  ): string {
    const baseUrl = `https://res.cloudinary.com/${this.config.cloudName}/image/upload`
    const transforms = this.buildTransformationString(transformation)

    return `${baseUrl}/${transforms}/${publicId}`
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  getResponsiveImageUrls(publicId: string): {
    mobile: string
    tablet: string
    desktop: string
    large: string
  } {
    return {
      mobile: this.getOptimizedImageUrl(publicId, { width: 400, height: 400, crop: 'fill' }),
      tablet: this.getOptimizedImageUrl(publicId, { width: 600, height: 600, crop: 'fill' }),
      desktop: this.getOptimizedImageUrl(publicId, { width: 800, height: 800, crop: 'fill' }),
      large: this.getOptimizedImageUrl(publicId, { width: 1200, height: 1200, crop: 'fill' })
    }
  }

  /**
   * Generate product image URLs with different sizes
   */
  getProductImageUrls(publicId: string): {
    thumbnail: string
    small: string
    medium: string
    large: string
    zoom: string
  } {
    return {
      thumbnail: this.getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
      small: this.getOptimizedImageUrl(publicId, { width: 300, height: 300, crop: 'fill' }),
      medium: this.getOptimizedImageUrl(publicId, { width: 600, height: 600, crop: 'fill' }),
      large: this.getOptimizedImageUrl(publicId, { width: 800, height: 800, crop: 'fill' }),
      zoom: this.getOptimizedImageUrl(publicId, { width: 1200, height: 1200, crop: 'fill' })
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.config.cloudName || !this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Cloudinary delete configuration is missing server credentials')
    }
    try {
      const timestamp = Math.round(new Date().getTime() / 1000)
      const signature = this.generateSignature(publicId, timestamp)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            public_id: publicId,
            timestamp: timestamp,
            signature: signature
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.result === 'ok'
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      return false
    }
  }

  /**
   * Build transformation string for Cloudinary
   */
  private buildTransformationString(transformation: TransformOptions): string {
    const transforms: string[] = []

    if (transformation.width) {
      transforms.push(`w_${transformation.width}`)
    }

    if (transformation.height) {
      transforms.push(`h_${transformation.height}`)
    }

    if (transformation.crop) {
      transforms.push(`c_${transformation.crop}`)
    }

    if (transformation.quality) {
      if (transformation.quality === 'auto') {
        transforms.push('q_auto')
      } else {
        transforms.push(`q_${transformation.quality}`)
      }
    }

    if (transformation.format) {
      if (transformation.format === 'auto') {
        transforms.push('f_auto')
      } else {
        transforms.push(`f_${transformation.format}`)
      }
    }

    if (transformation.gravity) {
      transforms.push(`g_${transformation.gravity}`)
    }

    return transforms.join(',')
  }

  /**
   * Generate signature for authenticated requests
   */
  private generateSignature(publicId: string, timestamp: number): string {
    const params = `public_id=${publicId}&timestamp=${timestamp}${this.config.apiSecret}`

    // In a real implementation, you would use a proper HMAC-SHA1 implementation
    // This is a simplified version for demonstration
    return btoa(params).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)
  }
}

// Utility functions
export function getCloudinaryConfig(): CloudinaryConfig {
  const isServer = typeof window === "undefined"
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    "tac_accessories"

  // Prefer single URL on server (no secret in client bundle)
  const url = process.env.CLOUDINARY_URL
  if (isServer && url) {
    const parsed = parseCloudinaryUrl(url)
    if (parsed) {
      return {
        cloudName: parsed.cloudName,
        apiKey: parsed.apiKey,
        apiSecret: parsed.apiSecret,
        uploadPreset,
      }
    }
  }

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    ""
  const apiKey = isServer
    ? process.env.CLOUDINARY_API_KEY || ""
    : process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
  const apiSecret = isServer ? process.env.CLOUDINARY_API_SECRET || "" : ""

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
  }
}

const UPLOAD_API = "/api/upload/cloudinary"

/** Upload via our API (uses CLOUDINARY_URL on server); use from client when config is not in browser */
async function uploadImageViaApi(
  file: File,
  options: { folder?: string; tags?: string[] } = {}
): Promise<UploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  if (options.folder) formData.append("folder", options.folder)
  if (options.tags?.length) formData.append("tags", options.tags.join(","))

  const res = await fetch(UPLOAD_API, { method: "POST", body: formData })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error ?? `Upload failed: ${res.statusText}`)
  }

  return {
    public_id: data.public_id,
    secure_url: data.secure_url,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  }
}

// React hook for Cloudinary functionality
export function useCloudinary() {
  const config = getCloudinaryConfig()
  const cloudinary = new CloudinaryService(config)
  const isClient = typeof window !== "undefined"
  const useApi = isClient && !config.cloudName

  const uploadImage = async (
    file: File,
    options: {
      folder?: string
      publicId?: string
      tags?: string[]
      transformation?: TransformOptions
    } = {}
  ) => {
    if (useApi) {
      return uploadImageViaApi(file, {
        folder: options.folder,
        tags: options.tags,
      })
    }
    return cloudinary.uploadImage(file, options)
  }

  const uploadMultipleImages = async (
    files: File[],
    options: {
      folder?: string
      tags?: string[]
      transformation?: TransformOptions
    } = {}
  ) => {
    if (useApi) {
      const results: UploadResult[] = []
      for (const file of files) {
        const r = await uploadImageViaApi(file, {
          folder: options.folder,
          tags: options.tags,
        })
        results.push(r)
      }
      return results
    }
    return cloudinary.uploadMultipleImages(files, options)
  }

  const getOptimizedImageUrl = (
    publicId: string,
    transformation?: TransformOptions
  ) => {
    return cloudinary.getOptimizedImageUrl(publicId, transformation)
  }

  const getResponsiveImageUrls = (publicId: string) => {
    return cloudinary.getResponsiveImageUrls(publicId)
  }

  const getProductImageUrls = (publicId: string) => {
    return cloudinary.getProductImageUrls(publicId)
  }

  const deleteImage = async (publicId: string) => {
    return cloudinary.deleteImage(publicId)
  }

  return {
    uploadImage,
    uploadMultipleImages,
    getOptimizedImageUrl,
    getResponsiveImageUrls,
    getProductImageUrls,
    deleteImage
  }
}

// Image upload component utilities
export interface ImageUploadOptions {
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  folder?: string
  tags?: string[]
}

export function validateImageFile(
  file: File,
  options: ImageUploadOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
  } = options

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Please use ${acceptedTypes.join(', ')}.`
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(2)}MB.`
    }
  }

  return { valid: true }
}

// Image optimization presets
export const IMAGE_PRESETS = {
  product: {
    thumbnail: { width: 150, height: 150, crop: 'fill' as const, quality: 'auto' as const },
    small: { width: 300, height: 300, crop: 'fill' as const, quality: 'auto' as const },
    medium: { width: 600, height: 600, crop: 'fill' as const, quality: 'auto' as const },
    large: { width: 800, height: 800, crop: 'fill' as const, quality: 'auto' as const },
    zoom: { width: 1200, height: 1200, crop: 'fill' as const, quality: 'auto' as const }
  },
  hero: {
    mobile: { width: 400, height: 600, crop: 'fill' as const, quality: 'auto' as const },
    tablet: { width: 800, height: 600, crop: 'fill' as const, quality: 'auto' as const },
    desktop: { width: 1200, height: 600, crop: 'fill' as const, quality: 'auto' as const }
  },
  avatar: {
    small: { width: 40, height: 40, crop: 'fill' as const, gravity: 'face' as const },
    medium: { width: 80, height: 80, crop: 'fill' as const, gravity: 'face' as const },
    large: { width: 150, height: 150, crop: 'fill' as const, gravity: 'face' as const }
  }
}
