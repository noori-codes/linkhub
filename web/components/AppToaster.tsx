"use client";

import { Toaster } from "sonner";

/** Global toast host — quiet paper style, not glowing dark chrome. */
export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 24px -16px rgba(18, 20, 26, 0.2)",
        },
      }}
    />
  );
}
