"use client";

import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

function resolveAuthBaseURL() {
  // Always call same origin in the browser so www/apex both work and cookies stick.
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL;
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(),
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
