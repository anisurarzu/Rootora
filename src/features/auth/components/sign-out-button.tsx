"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

interface SignOutButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

export function SignOutButton({
  variant = "outline",
  className,
}: SignOutButtonProps) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={async () => {
        await signOut();
        toast.success("Signed out");
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
