import type { QueryClient } from "@tanstack/react-query";

import { clearToken, saveToken } from "@/lib/auth";
import { clearDashboardCache } from "@/lib/dashboard-queries";

const AUTH_CHANGED_EVENT = "linkhub-auth-changed";
const EMAIL_VERIFIED_EVENT = "linkhub-email-verified";

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function notifyEmailVerified() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EMAIL_VERIFIED_EVENT));
  }
}

export function subscribeAuthChanges(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, onChange);
}

export function subscribeEmailVerified(onVerified: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EMAIL_VERIFIED_EVENT, onVerified);
  return () => window.removeEventListener(EMAIL_VERIFIED_EVENT, onVerified);
}

export function beginAuthSession(queryClient: QueryClient, token: string) {
  clearDashboardCache(queryClient);
  saveToken(token);
  notifyAuthChanged();
}

export function endAuthSession(queryClient: QueryClient) {
  clearDashboardCache(queryClient);
  clearToken();
  notifyAuthChanged();
}
