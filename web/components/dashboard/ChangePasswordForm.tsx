"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { PasswordInput } from "@/components/PasswordInput";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken, saveToken } from "@/lib/auth";
import { uiBtnSecondary } from "@/lib/ui";
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
    <SettingsCard
      title="Password"
      description="Update the password for your account."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Current password</span>
          <PasswordInput
            required
            minLength={8}
            value={passwordCurrent}
            onChange={(e) => setPasswordCurrent(e.target.value)}
            autoComplete="current-password"
            wrapperClassName="rounded-xl"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">New password</span>
          <PasswordInput
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            wrapperClassName="rounded-xl"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Confirm new password</span>
          <PasswordInput
            required
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            wrapperClassName="rounded-xl"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className={`mt-1 ${uiBtnSecondary}`}
        >
          {saving ? "Updating…" : "Update password"}
        </button>
      </form>
    </SettingsCard>
  );
}
