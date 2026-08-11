"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { ShareQr } from "@/components/dashboard/ShareQr";
import { DialogCloseButton } from "@/components/DialogCloseButton";
import { trackProfileShare } from "@/lib/track-share";
import type { ProfileStatus } from "@/lib/types";
import { uiBtnPrimary, uiBtnSecondary, uiInput } from "@/lib/ui";

type Props = {
  username: string;
  status: ProfileStatus;
};

function publicPageUrl(username: string) {
  return `${window.location.origin}/u/${username}`;
}

export function PreviewShareActions({ username, status }: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathLabel = `/u/${username}`;
  const fullUrl =
    typeof window !== "undefined" ? publicPageUrl(username) : pathLabel;

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
      await navigator.clipboard.writeText(publicPageUrl(username));
      if (status === "published") {
        trackProfileShare(username, "copy");
      }
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function onNativeShare() {
    const url = publicPageUrl(username);
    if (!navigator.share) {
      await onCopy();
      return;
    }
    try {
      await navigator.share({
        title: `@${username} on LinkHub`,
        url,
      });
      if (status === "published") {
        trackProfileShare(username, "native");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      await onCopy();
    }
  }

  return (
    <>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/u/${username}`}
          className="rounded-xl bg-brand px-3.5 py-2 text-xs font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
        >
          View public page
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text hover:border-brand/40"
        >
          Share
        </button>
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
              <DialogCloseButton
                ref={closeRef}
                onClick={() => setOpen(false)}
                label="Close share dialog"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                readOnly
                value={pathLabel}
                aria-label="Public page path"
                className={`${uiInput} min-w-0 flex-1 font-mono`}
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                onClick={() => void onCopy()}
                className={`shrink-0 ${uiBtnPrimary}`}
              >
                Copy
              </button>
            </div>

            {typeof navigator !== "undefined" && "share" in navigator ? (
              <button
                type="button"
                onClick={() => void onNativeShare()}
                className={`mt-3 w-full ${uiBtnSecondary}`}
              >
                Share via device…
              </button>
            ) : null}

            <div className="mt-5 flex flex-col items-center gap-2 border-t border-border pt-5">
              <div
                onClick={() => {
                  if (status === "published") {
                    trackProfileShare(username, "qr");
                  }
                }}
              >
                <ShareQr url={fullUrl} />
              </div>
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
