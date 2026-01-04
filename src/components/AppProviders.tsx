"use client";

import { SessionProvider } from "next-auth/react";
import { SessionSync } from "@/components/SessionSync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Prevent errors when auth API isn't available
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
