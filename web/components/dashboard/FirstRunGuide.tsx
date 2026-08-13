"use client";

import confetti from "canvas-confetti";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  hasAvatar: boolean;
  hasLinks: boolean;
  isPublished: boolean;
};

type Step = {
  id: string;
  done: boolean;
  label: string;
  hint: string;
  href?: string;
  actionLabel?: string;
};

const DISMISS_KEY = "linkhub_getting_started_dismissed";

/** Avoid double-firing when the guide is mounted twice (sidebar + mobile). */
let celebrationLocked = false;

function fireCelebration() {
  if (celebrationLocked) return;
  celebrationLocked = true;

  const defaults: confetti.Options = {
    startVelocity: 28,
    spread: 360,
    ticks: 70,
    zIndex: 80,
  };

  const shoot = (particleRatio: number, opts: confetti.Options) => {
    void confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(160 * particleRatio),
    });
  };

  shoot(0.25, { spread: 26, startVelocity: 55 });
  shoot(0.2, { spread: 60 });
  shoot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  shoot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  shoot(0.1, { spread: 120, startVelocity: 45 });
}

export function FirstRunGuide({
  hasAvatar,
  hasLinks,
  isPublished,
}: Props) {
  const [dismissed, setDismissed] = useState(false);

  const steps: Step[] = [
    {
      id: "avatar",
      done: hasAvatar,
      label: "Add an avatar",
      hint: "Upload a photo so your page feels personal.",
      href: "/profile/about",
      actionLabel: "Open Profile",
    },
    {
      id: "link",
      done: hasLinks,
      label: "Add your first link",
      hint: "Add at least one visible link for visitors.",
      href: "/profile/links",
      actionLabel: "Open Links",
    },
    {
      id: "publish",
      done: isPublished,
      label: "Publish your page",
      hint: "Hit Publish in the preview when you're ready to go live.",
      actionLabel: "Publish above",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const currentIndex = steps.findIndex((s) => !s.done);
  const current = currentIndex >= 0 ? steps[currentIndex]! : steps[steps.length - 1]!;
  const stepNumber = currentIndex >= 0 ? currentIndex + 1 : steps.length;
  const progressPct = allDone ? 100 : ((stepNumber - 1) / steps.length) * 100;

  const prevDoneCount = useRef<number | null>(null);
  const tracking = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!tracking.current) {
      tracking.current = true;
      prevDoneCount.current = doneCount;
      return;
    }

    const prev = prevDoneCount.current ?? doneCount;
    prevDoneCount.current = doneCount;

    if (prev < steps.length && doneCount === steps.length) {
      fireCelebration();
    }
  }, [doneCount, steps.length]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  if (dismissed) {
    return null;
  }

  if (allDone) {
    return (
      <section
        className="rounded-xl border border-brand/30 bg-brand-muted px-3.5 py-3.5"
        aria-label="Getting started complete"
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-text-inverse"
            aria-hidden
          >
            ✓
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text">You&apos;re all set</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
              Your page is live and ready to share.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text transition-colors hover:border-brand/40"
        >
          Done
        </button>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-brand/30 bg-brand-muted px-3.5 py-3.5"
      aria-label="Getting started"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          Step {stepNumber} of {steps.length}
        </p>
        <p className="text-xs tabular-nums text-text-muted">
          {doneCount}/{steps.length} done
        </p>
      </div>

      <div
        className="mt-2.5 h-1 overflow-hidden rounded-full bg-border/60"
        role="progressbar"
        aria-valuenow={stepNumber}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label="Getting started progress"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-text">{current.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          {current.hint}
        </p>

        {current.href ? (
          <Link
            href={current.href}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
          >
            {current.actionLabel}
          </Link>
        ) : (
          <p className="mt-3 text-center text-xs font-medium text-brand">
            {current.actionLabel}
          </p>
        )}
      </div>
    </section>
  );
}
