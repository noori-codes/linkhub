"use client";

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { trackProfileShare } from "@/lib/track-share";

type Props = {
  username: string;
  displayName?: string;
};

/**
 * Floating share control on the public /u/[username] page.
 */
export function PublicShareButton({ username, displayName }: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${username}`
      : `/u/${username}`;

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/u/${username}`,
      );
      trackProfileShare(username, "copy");
      toast.success("Link copied");
      setOpen(false);
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function onNativeShare() {
    const url = `${window.location.origin}/u/${username}`;
    if (!navigator.share) {
      await onCopy();
      return;
    }
    try {
      await navigator.share({
        title: displayName || `@${username}`,
        text: `Check out ${displayName || username} on LinkHub`,
        url,
      });
      trackProfileShare(username, "native");
      setOpen(false);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      await onCopy();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/95 px-3.5 py-2 text-sm font-semibold text-text shadow-md backdrop-blur-sm hover:border-brand/40 lg:top-6 lg:right-6"
        aria-haspopup="dialog"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" />
        </svg>
        Share
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
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
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-[0_16px_40px_-20px_rgba(18,20,26,0.35)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={titleId} className="text-base font-semibold text-text">
                  Share this page
                </h2>
                <p className="mt-1 text-xs text-text-muted">
                  Copy the link or share from your device.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-text-muted hover:bg-bg hover:text-text"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                readOnly
                value={pageUrl}
                aria-label="Public page URL"
                className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-3 py-2.5 font-mono text-xs text-text outline-none sm:text-sm"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                onClick={() => void onCopy()}
                className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-hover"
              >
                Copy
              </button>
            </div>

            {typeof navigator !== "undefined" && "share" in navigator ? (
              <button
                type="button"
                onClick={() => void onNativeShare()}
                className="mt-3 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-brand/40"
              >
                Share via device…
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
