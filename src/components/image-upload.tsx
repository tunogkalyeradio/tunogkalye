"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string | string[];
  onChange: (url: string | string[]) => void;
  label?: string;
  multiple?: boolean;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  multiple = false,
  maxImages = 5,
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentImages = Array.isArray(value) ? value : value ? [value] : [];

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileList = Array.from(files);
      const remaining = maxImages - currentImages.length;

      if (fileList.length > remaining) {
        setError(`You can upload ${remaining} more image(s)`);
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const uploadPromises = fileList.slice(0, remaining).map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Upload failed");
          }

          const data = await res.json();
          return data.url as string;
        });

        const urls = await Promise.all(uploadPromises);

        if (multiple) {
          onChange([...currentImages, ...urls]);
        } else {
          onChange(urls[0]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [currentImages, maxImages, multiple, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (multiple) {
        const updated = [...currentImages];
        updated.splice(index, 1);
        onChange(updated);
      } else {
        onChange("");
      }
    },
    [currentImages, multiple, onChange]
  );

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>
      )}

      {/* Image Previews */}
      {currentImages.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {currentImages.map((url, i) => (
            <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-white/10">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleRemove(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {currentImages.length < maxImages && (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-white/20 transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <Upload className="h-5 w-5 text-slate-500" />
            </button>
          )}
        </div>
      )}

      {/* Drop Zone (show if no images or multiple mode and under max) */}
      {currentImages.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${
            dragOver
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
          } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
        >
          {isUploading ? (
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-red-400" />
          ) : (
            <ImageIcon className="mb-2 h-8 w-8 text-slate-500" />
          )}
          <p className="text-sm font-medium text-slate-300">
            {isUploading ? "Uploading..." : "Click or drag image here"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            JPG, PNG, GIF, WebP — Max 5MB
            {multiple && ` • Up to ${maxImages} images`}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
