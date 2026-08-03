"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken, saveToken } from "@/lib/auth";

// Logged-in password change — different from forgot/reset (needs current password + JWT)
export function ChangePasswordForm() {
  const router = useRouter();
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== passwordConfirm) {
      toast.error("New passwords do not match.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/users/updateMyPassword`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passwordCurrent,
            password,
            passwordConfirm,
          }),
        },
      );

      const data = (await res.json()) as {
        token?: string;
        message?: string;
      };

      if (!res.ok) {
        toast.error(data.message || "Could not update password");
        return;
      }

      // API issues a fresh JWT after password change — replace the old one
      if (data.token) {
        saveToken(data.token);
      }

      setPasswordCurrent("");
      setPassword("");
      setPasswordConfirm("");
      toast.success("Password updated");
    } catch {
      toast.error("Cannot reach API. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <h2 className="text-sm font-medium text-text">Change password</h2>
      <p className="mt-1 text-xs text-text-muted">
        Needs your current password.
      </p>

      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-text-muted">Current</span>
          <input
            type="password"
            required
            minLength={8}
            value={passwordCurrent}
            onChange={(e) => setPasswordCurrent(e.target.value)}
            className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-text-muted">New</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-text-muted">Confirm</span>
          <input
            type="password"
            required
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:border-brand disabled:opacity-50"
        >
          {saving ? "Updating…" : "Update password"}
        </button>
      </form>
    </section>
  );
}
