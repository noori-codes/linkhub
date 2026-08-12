"use client";

import type { ReactNode } from "react";

import { Loader } from "@/components/Loader";
import { useClientAuth } from "@/components/ClientAuthProvider";

export function ClientAuthGate({ children }: { children: ReactNode }) {
  const { ready } = useClientAuth();

  if (!ready) {
    return (
      <main className="flex min-h-[100svh] flex-1 flex-col items-center justify-center bg-bg">
        <Loader label="Loading…" />
      </main>
    );
  }

  return children;
}
