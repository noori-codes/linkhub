import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--brand-muted),transparent_50%)]"
      />
      <div aria-hidden className="page-grain pointer-events-none absolute inset-0" />

      <div className="relative flex max-w-lg flex-col items-center gap-6">
        <Image src="/logo.png" alt="LinkHub" width={72} height={72} priority />
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          LinkHub
        </h1>
        <p className="text-base leading-relaxed text-text-muted sm:text-lg">
          Your links, identity, and affiliate hub in one place.
        </p>
        <p className="text-sm text-text-muted">
          Public profiles live at{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-brand">
            /u/username
          </code>
        </p>
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-hover"
          >
            Log in
          </Link>
          <Link
            href="/u/noori"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-brand"
          >
            View demo profile
          </Link>
        </div>
      </div>
    </main>
  );
}
