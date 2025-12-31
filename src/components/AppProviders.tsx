"use client";

import { SessionProvider } from "next-auth/react";
import { SessionSync } from "@/components/SessionSync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
