"use client";

import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import {
  GripVertical,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MediaUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
};

async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body,
  });

  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error || "Upload failed");
  }

  return data.url;
}

async function deleteUploadedMedia(url: string) {
  const response = await fetch("/api/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = (await response.json()) as {
    deleted?: boolean;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Delete failed");
  }

  return data;
}

export function MediaUploader({
  value,
  onChange,
  label = "Images",
  multiple = true,
  maxFiles = 12,
  className,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files).slice(
      0,
      Math.max(0, maxFiles - (multiple ? value.length : 0))
    );

    if (!selected.length) {
      toast.error(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await Promise.all(selected.map(uploadFile));
      if (multiple) {
        onChange([...value, ...uploaded].slice(0, maxFiles));
      } else {
        onChange([uploaded[0]]);
      }
      toast.success(
        uploaded.length === 1 ? "Image uploaded." : `${uploaded.length} images uploaded.`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFiles(event.dataTransfer.files);
  }

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  async function removeAt(index: number) {
    const url = value[index];
    if (!url) return;

    setDeletingUrl(url);
    try {
      await deleteUploadedMedia(url);
      onChange(value.filter((_, i) => i !== index));
      toast.success("Image deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete image."
      );
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-colors",
          dragging && "border-primary bg-primary/5"
        )}
      >
        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-button text-sm font-medium text-foreground">
          Drag & drop {label.toLowerCase()} here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WEBP, GIF up to 8MB. Cloudinary when configured.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            Browse files
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm,application/pdf"
          multiple={multiple}
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Or paste image URL and press Add"
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const target = event.currentTarget;
            const url = target.value.trim();
            if (!url) return;
            if (multiple) {
              onChange([...value, url].slice(0, maxFiles));
            } else {
              onChange([url]);
            }
            target.value = "";
          }}
        />
      </div>

      {value.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((url, index) => (
            <li
              key={`${url}-${index}`}
              draggable={multiple}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex === null || dragIndex === index) return;
                moveItem(dragIndex, index);
                setDragIndex(null);
              }}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="relative aspect-square bg-muted">
                {url.match(/\.(mp4|webm)$/i) ? (
                  <video src={url} className="h-full w-full object-cover" />
                ) : (
                  <Image
                    src={url}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={!url.includes("res.cloudinary.com")}
                  />
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {multiple ? <GripVertical className="h-3.5 w-3.5" /> : null}
                  {index === 0 && multiple ? "Main" : `#${index + 1}`}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={Boolean(deletingUrl) || uploading}
                  onClick={() => void removeAt(index)}
                  aria-label="Delete image"
                >
                  {deletingUrl === url ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-600" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type SingleMediaFieldProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export function SingleMediaField({
  value,
  onChange,
  label = "Image",
}: SingleMediaFieldProps) {
  return (
    <MediaUploader
      label={label}
      value={value ? [value] : []}
      onChange={(urls) => onChange(urls[0] ?? "")}
      multiple={false}
      maxFiles={1}
    />
  );
}
