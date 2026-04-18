"use client";

import { useEffect, useRef, useState } from "react";

export default function ImageUploadField({ onImagesChange, maxImages = 5, resetSignal = 0 }) {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setImages([]);
    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetSignal]);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    
    if (images.length + files.length > maxImages) {
      setUploadError(`You can upload a maximum of ${maxImages} images`);
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const uploadedImages = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed");
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (max 5MB)`);
        }

        // Upload to Cloudinary via our endpoint
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        uploadedImages.push({
          url: data.url,
          publicId: data.publicId,
          name: file.name,
        });
      }

      const newImages = [...images, ...uploadedImages];
      setImages(newImages);
      onImagesChange(newImages);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadError(error.message || "Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-accent/15 bg-bg/50 p-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text">Upload Item Images</span>
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-accent/30 bg-bg/60 px-4 py-8 transition-colors hover:border-accent/50">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-accent/40" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-8l-4 4m0 0l-4-4m4 4v12m-8 8h16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-text">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-medium text-primary hover:underline"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Click to upload"}
                </button>
                {" or drag and drop"}
              </p>
              <p className="text-xs text-text/60">PNG, JPG, GIF up to 5MB • Max {maxImages} images</p>
              <p className="mt-1 text-xs text-text/60">
                {images.length} / {maxImages} images uploaded
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading || images.length >= maxImages}
              className="hidden"
              aria-label="Upload images"
            />
          </div>
        </label>

        {uploadError && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {uploadError}
          </div>
        )}

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-3 text-sm font-medium text-text">Uploaded Images ({images.length})</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {images.map((image, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg border border-accent/15 bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={`Uploaded item ${index + 1}`}
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="rounded-lg bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="truncate bg-bg/60 px-2 py-1 text-xs text-text/70">{image.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
