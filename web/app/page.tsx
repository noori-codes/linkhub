import Image from "next/image";

import HomeAuthActions from "@/components/HomeAuthActions";

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

        {/* Client component: reads localStorage for login state */}
        <HomeAuthActions />
      </div>
    </main>
  );
}
