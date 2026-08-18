"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CLIENT_API_BASE, NETWORK_ERROR } from "@/lib/client-api";
import { endAuthSession } from "@/lib/auth-session";
import { getToken } from "@/lib/auth";
import { uiBtnSecondary } from "@/lib/ui";

export function AccountSessionActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  function onLogout() {
    endAuthSession(queryClient);
    toast.success("Logged out");
    router.replace("/login");
  }

  async function onDeleteAccount() {
    const ok = window.confirm(
      "Delete your account permanently? Your profile, links, shop, and analytics will be removed. This cannot be undone.",
    );
    if (!ok) return;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/users/deleteMe`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok && res.status !== 204) {
        let message = "Could not delete account";
        try {
          const data = (await res.json()) as { message?: string };
          if (data.message) message = data.message;
        } catch {
          /* empty body */
        }
        toast.error(message);
        return;
      }

      endAuthSession(queryClient);
      toast.success("Account deleted");
      router.replace("/");
    } catch {
      toast.error(NETWORK_ERROR);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={onLogout} className={uiBtnSecondary}>
        Log out
      </button>

      <div className="rounded-xl border border-danger/25 bg-danger/5 p-3.5">
        <p className="text-sm font-medium text-text">Delete account</p>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          Permanently remove your account and public page.
        </p>
        <button
          type="button"
          disabled={deleting}
          onClick={() => void onDeleteAccount()}
          className="mt-3 w-full rounded-xl border border-danger/40 bg-surface px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete my account"}
        </button>
      </div>
    </div>
  );
}
