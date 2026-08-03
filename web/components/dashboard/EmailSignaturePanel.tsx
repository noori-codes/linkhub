"use client";

import { toast } from "sonner";

import type { PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
};

function pageUrl(username: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/u/${username}`;
  }
  return `/u/${username}`;
}

/**
 * Build a small HTML signature email clients can paste.
 * Tables + inline styles = better Outlook/Gmail support than modern CSS.
 */
export function buildEmailSignatureHtml(
  profile: PublicProfile,
  publicUrl: string,
): string {
  const name = escapeHtml(profile.displayName || profile.username);
  const handle = escapeHtml(`@${profile.username}`);
  const bio = profile.bio?.trim()
    ? escapeHtml(profile.bio.trim().slice(0, 140))
    : "";
  const avatar =
    profile.avatarUrl?.startsWith("http://") ||
    profile.avatarUrl?.startsWith("https://")
      ? profile.avatarUrl
      : null;
  const safeUrl = escapeHtml(publicUrl);

  const avatarCell = avatar
    ? `<td style="padding-right:12px;vertical-align:top;">
        <img src="${escapeHtml(avatar)}" alt="" width="56" height="56" style="width:56px;height:56px;border-radius:50%;display:block;object-fit:cover;" />
      </td>`
    : "";

  const bioRow = bio
    ? `<tr><td style="padding-top:4px;font-size:13px;line-height:1.4;color:#5c6470;">${bio}</td></tr>`
    : "";

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#12141a;">
  <tr>
    ${avatarCell}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:15px;font-weight:bold;line-height:1.3;">${name}</td></tr>
        <tr><td style="padding-top:2px;font-size:12px;color:#5c6470;">${handle}</td></tr>
        ${bioRow}
        <tr><td style="padding-top:8px;font-size:13px;">
          <a href="${safeUrl}" style="color:#2f6fed;text-decoration:none;">${safeUrl}</a>
        </td></tr>
      </table>
    </td>
  </tr>
</table>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Settings: live preview + copy HTML for Gmail/Outlook. */
export function EmailSignaturePanel({ profile }: Props) {
  const html = buildEmailSignatureHtml(profile, pageUrl(profile.username));

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(html);
      toast.success("Signature HTML copied");
    } catch {
      toast.error("Could not copy signature");
    }
  }

  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <p className="mb-1 text-sm font-medium text-text">Email signature</p>
      <p className="mb-3 text-xs text-text-muted">
        Built from your profile. Copy into Gmail or Outlook → Settings →
        Signature.
      </p>

      <div
        className="mb-3 overflow-x-auto rounded-md border border-border bg-bg p-3"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <button
        type="button"
        onClick={() => void onCopy()}
        className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:border-brand"
      >
        Copy HTML
      </button>
    </section>
  );
}
