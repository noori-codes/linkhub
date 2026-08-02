"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { CLIENT_API_BASE } from "@/lib/client-api";

type Status = "loading" | "success" | "error";

// Opens from email (or signup verifyURL). Calls the API — no form needed.
export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verify token. Request a new link from signup.");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(
          `${CLIENT_API_BASE}/api/v1/users/verifyEmail/${encodeURIComponent(token)}`,
          { method: "PATCH" },
        );

        const data = (await res.json()) as { message?: string };

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "Token is invalid or has expired.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified.");
        // Clear any leftover signup helper link
        try {
          sessionStorage.removeItem("linkhub_verifyURL");
        } catch {
          /* ignore */
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Cannot reach API. Is the backend running?");
        }
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-muted),transparent_55%)]"
      />

      <div className="relative w-full max-w-sm text-center">
        <Image
          src="/logo.png"
          alt="LinkHub"
          width={48}
          height={48}
          className="mx-auto"
        />
        <h1 className="mt-4 font-display text-3xl font-semibold text-text">
          Verify email
        </h1>

        <div className="mt-6 rounded-xl lh-panel p-5">
          {status === "loading" ? (
            <p className="text-sm text-text-muted">{message}</p>
          ) : null}

          {status === "success" ? (
            <p className="text-sm text-success" role="status">
              {message}
            </p>
          ) : null}

          {status === "error" ? (
            <p className="text-sm text-danger" role="alert">
              {message}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-sm text-text-muted">
          {status === "success" ? (
            <Link
              href="/profile"
              className="text-brand hover:text-brand-hover"
            >
              Go to dashboard
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
      </div>
    </main>
  );
}
