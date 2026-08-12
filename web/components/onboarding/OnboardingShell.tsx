"use client";

import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { FinishLaterButton } from "@/components/onboarding/FinishLaterButton";
import {
  ONBOARDING_WIZARD_STEPS,
  prevWizardStep,
  wizardStepIndex,
  type OnboardingWizardStepId,
} from "@/lib/onboarding";
import { uiCard } from "@/lib/ui";

type Props = {
  step?: OnboardingWizardStepId;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
};

export function OnboardingShell({
  step,
  title,
  description,
  children,
  footer,
  wide = false,
}: Props) {
  const current = step !== undefined ? wizardStepIndex(step) : -1;
  const total = ONBOARDING_WIZARD_STEPS.length;
  const showProgress = step !== undefined && current >= 0;
  const progressPct = showProgress ? ((current + 1) / total) * 100 : 0;
  const previous = showProgress && step ? prevWizardStep(step) : undefined;

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#ffffff_0%,transparent_55%)]"
      />
      <SiteHeader />
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 sm:py-12">
        <div className={`w-full ${wide ? "max-w-lg" : "max-w-md"}`}>
          {showProgress ? (
            <div className={`${uiCard} flex flex-col`}>
              <header className="mb-6 border-b border-border pb-5">
                {previous ? (
                  <Link
                    href={previous.href}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
                  >
                    <span aria-hidden>←</span>
                    Back to {previous.label}
                  </Link>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">
                    Step {current + 1} of {total}
                  </p>
                  <p className="text-xs font-medium text-text">
                    {ONBOARDING_WIZARD_STEPS[current]?.label}
                  </p>
                </div>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
                  role="progressbar"
                  aria-valuenow={current + 1}
                  aria-valuemin={1}
                  aria-valuemax={total}
                  aria-label="Onboarding progress"
                >
                  <div
                    className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </header>

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
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {description}
              </p>
              <div className="mt-7">{children}</div>
              {footer ? <div className="mt-6">{footer}</div> : null}
            </>
          )}

          {showProgress ? <FinishLaterButton /> : null}
        </div>
      </main>
    </div>
  );
}

export function OnboardingSkipFooter({
  onSkip,
  disabled,
  label = "Skip for now",
}: {
  onSkip: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <p className="text-center text-sm text-text-muted">
      <button
        type="button"
        onClick={onSkip}
        disabled={disabled}
        className="font-medium text-brand hover:text-brand-hover disabled:opacity-60"
      >
        {label}
      </button>
    </p>
  );
}
