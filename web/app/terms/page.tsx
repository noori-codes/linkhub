import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using LinkHub.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold text-text">Terms</h1>
        <p className="mt-2 text-xs text-text-muted">Last updated: 3 August 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-text-muted">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Agreement</h2>
            <p>
              By creating an account or using LinkHub, you agree to these terms
              and our{" "}
              <Link href="/privacy" className="text-brand hover:text-brand-hover">
                Privacy
              </Link>{" "}
              page. If you do not agree, do not use the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">The service</h2>
            <p>
              LinkHub provides a personal profile and link page. Features may
              change as the product grows (for example analytics or shop tools).
              We may update, pause, or discontinue parts of the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Your account</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>You must provide accurate signup information.</li>
              <li>You are responsible for keeping your password private.</li>
              <li>
                You must verify your email before publishing a public page.
              </li>
              <li>
                One person / entity per account unless we agree otherwise.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Your content</h2>
            <p>
              You own the content you upload (text, images, links). You give
              LinkHub permission to host and display it so the product can work
              — including showing published pages to visitors.
            </p>
            <p>You agree not to post content that:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Is illegal, harmful, or harassing</li>
              <li>Infringes someone else&apos;s rights (copyright, privacy, etc.)</li>
              <li>Is malware, spam, or deliberately misleading impersonation</li>
              <li>Exploits children or involves non-consensual intimate media</li>
            </ul>
            <p>
              We may remove content or suspend accounts that break these rules.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Public pages &amp; links</h2>
            <p>
              Links you add may go to third-party sites. LinkHub is not
              responsible for those sites. Affiliate or commercial links are
              your responsibility to disclose where required by law.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Availability</h2>
            <p>
              We aim for a reliable service but do not guarantee uninterrupted
              uptime. Data loss can happen; keep your own backups of important
              content when you can.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Disclaimer</h2>
            <p>
              LinkHub is provided “as is.” To the fullest extent allowed by law,
              we are not liable for indirect or consequential damages from using
              (or being unable to use) the service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-medium text-text">Changes</h2>
            <p>
              We may update these terms. The “Last updated” date will change
              when we do. Continued use after updates means you accept the new
              terms.
            </p>
          </section>
        </div>

        <p className="mt-10 text-xs text-text-muted">
          Plain-language terms for this project — not a substitute for advice
          from a lawyer if you need one.
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
