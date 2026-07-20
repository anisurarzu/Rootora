"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitCareerApplication } from "@/features/careers/actions";

type ApplyPosition = {
  slug: string;
  title: string;
};

type CareerApplyFormProps = {
  positions: ApplyPosition[];
  defaultPositionSlug?: string;
};

export function CareerApplyForm({
  positions,
  defaultPositionSlug,
}: CareerApplyFormProps) {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [positionSlug, setPositionSlug] = useState(
    defaultPositionSlug ?? positions[0]?.slug ?? ""
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await submitCareerApplication({
        positionSlug: String(data.get("positionSlug") ?? ""),
        fullName: String(data.get("fullName") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        city: String(data.get("city") ?? ""),
        education: String(data.get("education") ?? ""),
        facebookUrl: String(data.get("facebookUrl") ?? ""),
        instagramUrl: String(data.get("instagramUrl") ?? ""),
        about: String(data.get("about") ?? ""),
        availability: String(data.get("availability") ?? ""),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSubmitted(true);
      form.reset();
      toast.success("Application received. We will contact you soon.");
    });
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-10 text-center">
        <p className="font-heading text-xl font-semibold text-heading">
          Application received
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for applying to ROOTORA. Our team will review your details
          and reach out if there is a fit.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Submit another application
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="positionSlug">Position</Label>
        <select
          id="positionSlug"
          name="positionSlug"
          required
          value={positionSlug}
          onChange={(e) => setPositionSlug(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {positions.map((role) => (
            <option key={role.slug} value={role.slug}>
              {role.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required maxLength={120} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            maxLength={30}
            placeholder="01XXXXXXXXX"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            maxLength={160}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" maxLength={80} placeholder="Dhaka" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">Education / current study</Label>
        <Input
          id="education"
          name="education"
          maxLength={160}
          placeholder="e.g. BBA student, Year 2"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="facebookUrl">Facebook profile / page</Label>
          <Input
            id="facebookUrl"
            name="facebookUrl"
            maxLength={300}
            placeholder="https://facebook.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram profile</Label>
          <Input
            id="instagramUrl"
            name="instagramUrl"
            maxLength={300}
            placeholder="https://instagram.com/..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Weekly availability</Label>
        <Input
          id="availability"
          name="availability"
          maxLength={300}
          placeholder="e.g. Sat–Tue, evenings 6–10pm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="about">Why you are a good fit</Label>
        <textarea
          id="about"
          name="about"
          required
          rows={5}
          maxLength={4000}
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Tell us about your social media habits, customer communication experience, and why you want to join ROOTORA…"
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
