import Link from "next/link";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-16">
        <h1 className="text-2xl font-semibold text-text">Terms</h1>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          Placeholder — we&apos;ll publish terms of service before launch.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm text-brand hover:text-brand-hover">
          ← Home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
