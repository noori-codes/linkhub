"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AuthShell } from "@/components/AuthShell";
import { CLIENT_API_BASE } from "@/lib/client-api";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    let cancelled = false;

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
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMessage("Cannot reach API. Is the backend running?");
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthShell
      title="Verify email"
      description="Confirming the link from your inbox."
      footer={
        <p className="text-center text-sm text-text-muted">
          {status === "success" ? (
            <Link href="/profile" className="text-brand hover:text-brand-hover">
              Go to profile
            </Link>
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
      <p
        className={`text-sm ${
          status === "success"
            ? "text-success"
            : status === "error"
              ? "text-danger"
              : "text-text-muted"
        }`}
        role={status === "error" ? "alert" : status === "success" ? "status" : undefined}
      >
        {message}
      </p>
    </AuthShell>
  );
}
