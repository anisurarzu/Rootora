"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

const googleEnabled =
  Boolean(process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED) &&
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !== "false";

interface GoogleAuthButtonProps {
  callbackURL?: string;
  label?: string;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.7 14.6 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.7H12z"
      />
      <path
        fill="#34A853"
        d="M3.9 7.4l3 2.2C7.7 7.7 9.7 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.7 14.6 2.8 12 2.8 8.4 2.8 5.3 4.8 3.9 7.4z"
      />
      <path
        fill="#4A90E2"
        d="M12 21.2c2.5 0 4.6-.8 6.1-2.3l-2.9-2.2c-.8.6-1.9 1.1-3.2 1.1-2.5 0-4.6-1.7-5.3-4l-3 2.3c1.4 2.8 4.3 4.1 8.3 4.1z"
      />
      <path
        fill="#FBBC05"
        d="M6.7 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8l-3-2.3C3.3 9.1 3 10.5 3 12s.3 2.9.7 4.1l3-2.3z"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  callbackURL = "/account",
  label = "Continue with Google",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    if (!googleEnabled) {
      toast.error(
        "Google login is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env"
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL,
        errorCallbackURL: "/login?error=google",
        newUserCallbackURL: callbackURL,
      });

      if (error) {
        toast.error(error.message || "Google sign-in failed");
        setLoading(false);
      }
    } catch {
      toast.error(
        "Google sign-in failed. Check GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env"
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={loading}
        onClick={handleGoogleSignIn}
      >
        <GoogleIcon className="h-5 w-5" />
        {loading ? "Redirecting to Google..." : label}
      </Button>
      {!googleEnabled && (
        <p className="text-center text-[11px] text-muted-foreground">
          Google login ready — add credentials in{" "}
          <code className="rounded bg-muted px-1">.env</code> to enable
        </p>
      )}
    </div>
  );
}
