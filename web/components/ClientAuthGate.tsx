"use client";

import type { ReactNode } from "react";

import { useClientAuth } from "@/components/ClientAuthProvider";
import { LandingSkeleton } from "@/components/Skeleton";

export function ClientAuthGate({ children }: { children: ReactNode }) {
  const { ready } = useClientAuth();

  if (!ready) {
    return <LandingSkeleton />;
  }

  return children;
}
