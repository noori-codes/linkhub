"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { uiCard } from "@/lib/ui";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#ffffff_0%,transparent_55%)]"
      />
      <SiteHeader />
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 sm:py-12">
        <div className="w-full max-w-sm">
          <div className={`${uiCard} flex flex-col`}>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-[1.75rem]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              {description}
            </p>

            <div className="mt-6">{children}</div>

            {footer ? (
              <div className="mt-5 border-t border-border pt-4">{footer}</div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
