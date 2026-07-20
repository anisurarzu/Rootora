"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: ReactNode;
  /** Server-resolved theme from cookie (anti-FOUC). */
  initialTheme?: string | null;
}

export function AppProviders({ children, initialTheme }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
      initialTheme={initialTheme ?? undefined}
    >
      <QueryProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "font-body border-border bg-surface text-foreground shadow-lift",
            },
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  );
}
