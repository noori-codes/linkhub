"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { FinishLaterButton } from "@/components/onboarding/FinishLaterButton";
import {
  ONBOARDING_STEPS,
  stepIndex,
  type OnboardingStepId,
} from "@/lib/onboarding";

type Props = {
  step: OnboardingStepId;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Wider for theme grid */
  wide?: boolean;
};

/** Shared onboarding chrome: header, progress, title, form column. */
export function OnboardingShell({
  step,
  title,
  description,
  children,
  footer,
  wide = false,
}: Props) {
  const current = stepIndex(step);
  const total = ONBOARDING_STEPS.length;

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#ffffff_0%,transparent_50%)]"
      />
      <SiteHeader />
      <main className="relative flex flex-1 flex-col items-center px-5 py-10 sm:px-6 sm:py-14">
        <div className={`w-full ${wide ? "max-w-lg" : "max-w-md"}`}>
          <div className="mb-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium tracking-wide text-text-muted uppercase">
                Step {current + 1} of {total}
              </p>
              <p className="truncate text-xs text-text-muted">
                {ONBOARDING_STEPS[current]?.label}
              </p>
            </div>
            <div
              className="mt-3 flex gap-1"
              role="progressbar"
              aria-valuenow={current + 1}
              aria-valuemin={1}
              aria-valuemax={total}
              aria-label="Onboarding progress"
            >
              {ONBOARDING_STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= current ? "bg-brand" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted sm:text-[15px]">
            {description}
          </p>

          <div className="mt-7">{children}</div>

          {footer ? <div className="mt-6">{footer}</div> : null}

          {step !== "profile" ? <FinishLaterButton /> : null}
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
