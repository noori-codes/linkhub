"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { ShareQr } from "@/components/dashboard/ShareQr";
import type { ProfileStatus } from "@/lib/types";

type Props = {
  username: string;
  status: ProfileStatus;
};

function publicPageUrl(username: string) {
  return `${window.location.origin}/u/${username}`;
}

/**
 * Preview card: View + Share (modal) + Live/Draft badge.
 */
export function PreviewShareActions({ username, status }: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const isLive = status === "published";
  const pathLabel = `/u/${username}`;
  const fullUrl = publicPageUrl(username);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <>
      <div className="mt-7 flex flex-wrap items-center gap-2">
        <Link
          href={`/u/${username}`}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-hover"
        >
          View public page
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:border-brand"
        >
          Share
        </button>
        <span
          className={
            isLive
              ? "rounded-md bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
              : "rounded-md bg-bg px-2.5 py-1 text-xs font-medium text-text-muted"
          }
        >
          {isLive ? "Live" : "Draft"}
        </span>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-text/40"
            aria-label="Close share dialog"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-[0_16px_40px_-20px_rgba(18,20,26,0.35)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={titleId} className="text-base font-semibold text-text">
                  Share
                </h2>
                <p className="mt-1 text-xs text-text-muted">
                  Copy your link or scan the QR code.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-text-muted hover:bg-bg hover:text-text"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                readOnly
                value={pathLabel}
                aria-label="Public page path"
                className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text outline-none"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                onClick={() => void onCopy()}
                className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-medium text-text-inverse hover:bg-brand-hover"
              >
                Copy
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center gap-2 border-t border-border pt-5">
              <ShareQr url={fullUrl} />
              {typeof window !== "undefined" &&
              (window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1") ? (
                <p className="text-center text-xs text-text-muted">
                  Localhost QR only works on this computer.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
