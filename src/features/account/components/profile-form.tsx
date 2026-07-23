"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/features/account/actions";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type ProfileFormProps = {
  name: string;
  email: string;
  phone: string;
  image: string | null;
};

function getInitials(name: string, email: string) {
  if (name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return email[0]?.toUpperCase() ?? "U";
}

export function ProfileForm({ name, email, phone, image }: ProfileFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(image);
  const [imageUrl, setImageUrl] = useState<string | null>(image);
  const [fullName, setFullName] = useState(name);
  const [phoneValue, setPhoneValue] = useState(phone);

  async function handleAvatarChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads/avatar", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Upload failed");
      }
      setPreview(json.url);
      setImageUrl(json.url);
      toast.success("Photo uploaded — save to apply.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAvatar() {
    setPreview(null);
    setImageUrl(null);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("image", imageUrl ?? "");

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      try {
        await authClient.updateUser({
          name: fullName,
          image: imageUrl || undefined,
          phone: phoneValue || undefined,
        });
      } catch {
        // Session sync is best-effort; DB already updated.
      }

      toast.success(result.message ?? "Profile updated.");
      router.refresh();
    });
  }

  const busy = pending || uploading;

  return (
    <form onSubmit={onSubmit} className="profile-form space-y-8">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
        <div className="relative">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "group relative h-28 w-28 cursor-pointer overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 shadow-soft transition-all duration-300",
              "hover:border-primary/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              uploading && "pointer-events-none opacity-80",
            )}
            aria-label="Upload profile photo"
          >
            {preview ? (
              <Image
                src={preview}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="112px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-heading text-3xl font-semibold text-primary">
                {getInitials(fullName, email)}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-heading/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) =>
              void handleAvatarChange(event.target.files?.[0] ?? null)
            }
          />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="font-heading text-xl font-semibold text-heading">
            {fullName || "Your profile"}
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Change photo"}
            </Button>
            {preview ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy}
                className="text-destructive hover:text-destructive"
                onClick={removeAvatar}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            JPG, PNG or WebP · max 2MB
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            disabled
            aria-describedby="email-help"
          />
          <p id="email-help" className="text-xs text-muted-foreground">
            Email is tied to your login and cannot be changed here.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            disabled={busy}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={phoneValue}
            onChange={(event) => setPhoneValue(event.target.value)}
            placeholder="+880 1XXX-XXXXXX"
            autoComplete="tel"
            disabled={busy}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={busy} className="min-w-36">
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}
