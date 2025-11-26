"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCloudinary, validateImageFile } from "@/lib/cloudinary";

interface PhotoUploadProps {
  onFilesChange: (files: File[], urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function PhotoUpload({
  onFilesChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage } = useCloudinary();

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const errors: string[] = [];

    // Validate and process files
    Array.from(selectedFiles).forEach((file) => {
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validation = validateImageFile(file, { maxSize });
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        return;
      }

      newFiles.push(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newPreviews.push(result);
        setPreviews((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      
      // Wait for previews to be set
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Upload files to Cloudinary
      await uploadFiles(newFiles, files.length);
    }
  };

  const uploadFiles = async (filesToUpload: File[], startIndex: number) => {
    setUploading(true);
    const newUrls: string[] = [];

    try {
      await Promise.all(
        filesToUpload.map(async (file, index) => {
          const currentIndex = startIndex + index;
          try {
            setUploadProgress((prev) => ({ ...prev, [currentIndex]: 50 }));
            
            const result = await uploadImage(file, {
              folder: "bespoke-uploads",
              tags: ["bespoke", "reference"],
            });

            newUrls.push(result.secure_url);
            setUploadProgress((prev) => ({ ...prev, [currentIndex]: 100 }));
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            // Keep the file but mark as failed
            newUrls.push("");
            setUploadProgress((prev) => ({ ...prev, [currentIndex]: 0 }));
          }
        })
      );

      // Update uploaded URLs
      const allUrls = [...uploadedUrls, ...newUrls];
      setUploadedUrls(allUrls);
      
      // Update parent component - get current files state
      setFiles((currentFiles) => {
        onFilesChange(currentFiles, allUrls);
        return currentFiles;
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Some files failed to upload. Please try again.");
    } finally {
      setUploading(false);
      // Keep progress for a moment to show completion
      setTimeout(() => setUploadProgress({}), 1000);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newUrls = uploadedUrls.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);
    setUploadedUrls(newUrls);
    onFilesChange(newFiles, newUrls);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-brand-umber mb-2">
        Reference Photos (Optional)
      </label>
      <p className="text-xs text-brand-umber/60 mb-4">
        Upload photos to help us understand your vision. Max {maxFiles} files, {maxSize / 1024 / 1024}MB each.
      </p>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-brand-teal bg-brand-teal/10"
            : "border-brand-umber/20 hover:border-brand-teal/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
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
            <p className="text-xs text-brand-umber/60 mt-1">
              PNG, JPG, GIF up to {maxSize / 1024 / 1024}MB
            </p>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
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
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                
                {/* Upload Progress */}
                {uploading && uploadProgress[index] !== undefined && (
                  <div className="absolute inset-0 bg-brand-umber/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
                      <p className="text-xs text-white">
                        {uploadProgress[index]}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-umber/80 hover:bg-brand-coral flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-white" />
                </button>

                {/* File Name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-umber/80 to-transparent p-2">
                  <p className="text-xs text-white truncate">
                    {files[index]?.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-brand-umber/70">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading photos...</span>
        </div>
      )}
    </div>
  );
}

