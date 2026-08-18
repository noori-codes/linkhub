"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { AuthShell } from "@/components/AuthShell";
import { FormAlert } from "@/components/FormAlert";
import { ListSkeleton } from "@/components/Skeleton";
import { notifyEmailVerified } from "@/lib/auth-session";
import { getToken } from "@/lib/auth";
import { CLIENT_API_BASE, NETWORK_ERROR } from "@/lib/client-api";
import { queryKeys } from "@/lib/dashboard-queries";
import { uiBtnPrimaryBlock } from "@/lib/ui";

type Status = "loading" | "success" | "error";

const VERIFY_URL_KEY = "linkhub_verifyURL";

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const queryClient = useQueryClient();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    let cancelled = false;
    let redirectTimer: number | undefined;

    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token.");
        return;
      }

      try {
        const res = await fetch(
          `${CLIENT_API_BASE}/api/v1/users/verifyEmail/${encodeURIComponent(token)}`,
          { method: "PATCH" },
        );
        const data = (await res.json()) as { message?: string };

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "Could not verify email");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified.");

        try {
          sessionStorage.removeItem(VERIFY_URL_KEY);
        } catch {
          /* ignore */
        }

        void queryClient.invalidateQueries({ queryKey: queryKeys.userMe });
        notifyEmailVerified();

        if (getToken()) {
          redirectTimer = window.setTimeout(() => {
            router.replace("/profile?verified=1");
          }, 2200);
        }
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMessage(NETWORK_ERROR);
      }
    }

    void verify();

    return () => {
      cancelled = true;
      if (redirectTimer !== undefined) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [token, queryClient, router]);

  const title =
    status === "success"
      ? "Email verified"
      : status === "error"
        ? "Couldn’t verify"
        : "Verify email";

  const description =
    status === "success"
      ? "Your email is confirmed. You can publish your page and share your profile."
      : status === "error"
        ? "This link may have expired or already been used."
        : "Confirming the link from your inbox.";

  return (
    <AuthShell
      title={title}
      description={description}
      footer={
        <p className="text-center text-sm text-text-muted">
          {status === "success" ? (
            getToken() ? (
              <span>Taking you to your profile…</span>
            ) : (
              <Link href="/login" className="text-brand hover:text-brand-hover">
                Log in to continue
              </Link>
            )
          ) : (
            <>
              <Link href="/login" className="text-brand hover:text-brand-hover">
                Log in
              </Link>
              {" · "}
              <Link href="/" className="text-brand hover:text-brand-hover">
                Home
              </Link>
            </>
          )}
        </p>
      }
    >
      {status === "loading" ? (
        <ListSkeleton rows={2} rowClassName="h-10 w-full rounded-xl" />
      ) : null}

      {status === "success" ? (
        <div className="flex flex-col gap-4">
          <FormAlert variant="success" title="You're all set">
            {message} Publishing is now unlocked on your profile.
          </FormAlert>
          {getToken() ? (
            <Link href="/profile?verified=1" className={uiBtnPrimaryBlock}>
              Go to profile
            </Link>
          ) : null}
        </div>
      ) : null}

      {status === "error" ? (
        <FormAlert variant="error" title="Verification failed">
          {message}
        </FormAlert>
      ) : null}
    </AuthShell>
  );
}
