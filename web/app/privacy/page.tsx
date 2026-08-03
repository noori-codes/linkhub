import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How LinkHub handles your account and profile data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold text-text">Privacy</h1>
        <p className="mt-2 text-xs text-text-muted">Last updated: 3 August 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-text-muted">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">What LinkHub is</h2>
            <p>
              LinkHub lets you create a public profile page (your name, bio,
              photos, and links) and share it at a URL like{" "}
              <span className="font-mono text-text">/u/you</span>.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">What we collect</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Account details you provide: name, email, and password (stored
                hashed).
              </li>
              <li>
                Profile content you add: username, display name, bio, tags,
                avatar, cover image, and links.
              </li>
              <li>
                Technical basics needed to run the service (for example login
                session / JWT).
              </li>
            </ul>
            <p>
              We do not sell your personal data. We do not run third-party ad
              trackers on the product today.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">What is public</h2>
            <p>
              When you <span className="text-text">publish</span> your profile,
              visitors can see the public page content you chose (name, bio,
              images, visible links). Draft profiles are not shown to visitors.
            </p>
            <p>
              Your email and password are never shown on the public page.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Photos &amp; files</h2>
            <p>
              Avatar and cover uploads are stored in object storage (for local
              development, MinIO; in production, an S3-compatible service such
              as R2). Files you replace may be deleted from storage when a new
              upload takes their place.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Email</h2>
            <p>
              We use your email to create your account, send a verification
              link, and (if you ask) password reset or resend verification.
              Transactional email only — no marketing list unless we add one
              later and ask clearly.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Your choices</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Edit or delete profile content anytime while logged in.</li>
              <li>Unpublish to take your page offline for visitors.</li>
              <li>
                You can request account deletion; we will remove account and
                profile data we control.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Changes</h2>
            <p>
              If this policy changes in a meaningful way, we will update the
              date above. Continued use after a change means you accept the
              updated policy.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Contact</h2>
            <p>
              Questions about privacy: use the email on your LinkHub account, or
              contact the project maintainer listed in the repository.
            </p>
          </section>
        </div>

        <p className="mt-10 text-xs text-text-muted">
          This page explains our practices in plain language. It is not formal
          legal advice.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block text-sm text-brand hover:text-brand-hover"
        >
          ← Home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
