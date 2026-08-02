import Image from "next/image";

import HomeAuthActions from "@/components/HomeAuthActions";

// Step 1 of the visitor funnel: first impression = brand + clear path to signup.
// Hero stays one composition; “how it works” lives below the fold.
export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="lh-wash pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,var(--brand-muted),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,#4d9fff12,transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/50 to-transparent"
      />
      <div
        aria-hidden
        className="page-grain pointer-events-none absolute inset-0"
      />

      {/* First viewport — brand, one line, CTAs only */}
      <section className="relative flex min-h-svh flex-col items-center justify-center px-6 pb-16 pt-20 text-center">
        <div className="relative flex max-w-xl flex-col items-center gap-7">
          <div className="lh-rise flex flex-col items-center gap-5">
            <Image
              src="/logo.png"
              alt="LinkHub"
              width={52}
              height={52}
              priority
            />
            <h1 className="font-display text-5xl font-bold tracking-tight text-text sm:text-7xl">
              LinkHub
            </h1>
          </div>

          <p className="lh-rise-delay max-w-md text-base leading-relaxed text-text-muted sm:text-lg">
            Your identity and links in one place — between a profile and a link
            page.
          </p>

          <div className="lh-rise-delay-2">
            <HomeAuthActions />
          </div>
        </div>
      </section>

      {/* Below fold — one job: explain the path */}
      <section className="relative border-t border-border/80 bg-bg-elevated/50 px-6 py-20 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg flex-col gap-10 text-center">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
              How it works
            </h2>
            <p className="text-sm text-text-muted">
              Three steps from zero to a live page at{" "}
              <span className="text-brand">/u/you</span>.
            </p>
          </div>

          <ol className="flex flex-col gap-8 text-left sm:gap-10">
            <li className="flex gap-4">
              <span
                className="font-display text-2xl font-semibold text-brand"
                aria-hidden
              >
                1
              </span>
              <div>
                <p className="font-medium text-text">Claim your username</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  Sign up and pick the name that becomes your public URL.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span
                className="font-display text-2xl font-semibold text-brand"
                aria-hidden
              >
                2
              </span>
              <div>
                <p className="font-medium text-text">Add your links</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  Socials, site, affiliate links — reorder and hide anytime.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span
                className="font-display text-2xl font-semibold text-brand"
                aria-hidden
              >
                3
              </span>
              <div>
                <p className="font-medium text-text">Publish when ready</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  Stay in draft while you edit. Go live with one click.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
