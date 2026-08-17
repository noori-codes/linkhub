"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AccountDetailsForm } from "@/components/dashboard/AccountDetailsForm";
import { AccountSessionActions } from "@/components/dashboard/AccountSessionActions";
import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";
import { Loader } from "@/components/Loader";
import { useProfile } from "@/components/profile/ProfileProvider";
import { fetchMyUser, queryKeys } from "@/lib/dashboard-queries";

type SettingsTab = "account" | "password" | "session";

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: "account", label: "Account" },
  { id: "password", label: "Password" },
  { id: "session", label: "Session" },
];

export function SettingsPanel() {
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<SettingsTab>("account");

  const meQuery = useQuery({
    queryKey: queryKeys.userMe,
    queryFn: fetchMyUser,
  });

  const me = meQuery.data;

  if (!profile || meQuery.isLoading) {
    return <Loader label="Loading…" className="py-12" />;
  }

  return (
    <div className="flex min-h-[22rem] flex-col sm:min-h-[26rem] sm:flex-row">
      <nav
        className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-3 sm:w-40 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r"
        aria-label="Settings sections"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={
                active
                  ? "shrink-0 rounded-lg bg-brand-muted px-3 py-2 text-left text-[13px] font-semibold text-text"
                  : "shrink-0 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-text-muted transition-colors hover:bg-bg hover:text-text"
              }
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-5">
        {tab === "account" ? (
          <div className="flex flex-col gap-4">
            {me ? (
              <AccountDetailsForm
                user={me}
                onUserChange={(user) => {
                  queryClient.setQueryData(queryKeys.userMe, user);
                }}
              />
            ) : (
              <p className="text-sm text-text-muted">
                Could not load account details.
              </p>
            )}
          </div>
        ) : null}

        {tab === "password" ? <ChangePasswordForm /> : null}

        {tab === "session" ? <AccountSessionActions /> : null}
      </div>
    </div>
  );
}
