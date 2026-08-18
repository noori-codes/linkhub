"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CLIENT_API_BASE, NETWORK_ERROR } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import { uiBtnPrimary, uiInput } from "@/lib/ui";
import type { AccountUser, ApiSuccess } from "@/lib/types";

type Props = {
  user: AccountUser;
  onUserChange: (user: AccountUser) => void;
};

export function AccountDetailsForm({ user, onUserChange }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/users/updateMe`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      const data = (await res.json()) as ApiSuccess<{ user: AccountUser }> & {
        message?: string;
      };

      if (!res.ok) {
        toast.error(data.message || "Could not update account");
        return;
      }

      onUserChange(data.data.user);
      setFirstName(data.data.user.firstName);
      setLastName(data.data.user.lastName);
      toast.success("Account updated");
    } catch {
      toast.error(NETWORK_ERROR);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-text">Email</span>
        <input
          type="email"
          readOnly
          value={user.email}
          className={`${uiInput} cursor-default opacity-80`}
        />
        <span className="text-xs text-text-muted">
          {user.emailVerified ? "Verified" : "Not verified yet"}
        </span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">First name</span>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={uiInput}
            autoComplete="given-name"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Last name</span>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={uiInput}
            autoComplete="family-name"
          />
        </label>
      </div>

      <button type="submit" disabled={saving} className={uiBtnPrimary}>
        {saving ? "Saving…" : "Save account"}
      </button>
    </form>
  );
}
