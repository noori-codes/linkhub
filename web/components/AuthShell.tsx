"use client";

import { SiteHeader } from "@/components/SiteHeader";

/** Shared chrome for login / signup / reset flows — header + centered form column. */
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
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-text">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {description}
          </p>
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
