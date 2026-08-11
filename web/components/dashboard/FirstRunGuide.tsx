"use client";

import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";

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
};

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
  const steps: Step[] = [
    {
      id: "avatar",
      done: hasAvatar,
      label: "Add an avatar",
      hint: "Open Profile and upload a photo.",
    },
    {
      id: "link",
      done: hasLinks,
      label: "Add your first link",
      hint: "Open Links and add one.",
    },
    {
      id: "publish",
      done: isPublished,
      label: "Publish your page",
      hint: "Use Publish at the top of the preview.",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const prevDoneCount = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevDoneCount.current;
    prevDoneCount.current = doneCount;

    // Only celebrate the moment the last step flips to done (not on reload)
    if (prev === null) return;
    if (prev < steps.length && doneCount === steps.length) {
      fireCelebration();
    }
  }, [doneCount, steps.length]);

  if (allDone) {
    return null;
  }

  const nextId = steps.find((s) => !s.done)?.id;

  return (
    <section
      className="rounded-xl border border-brand/40 bg-brand-muted px-3.5 py-3.5"
      aria-label="Getting started"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-text">Getting started</p>
        <p className="text-xs tabular-nums text-text-muted">
          {doneCount}/{steps.length}
        </p>
      </div>

      <div
        className="mt-2.5 h-1 overflow-hidden rounded-full bg-border/60"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ol className="mt-3 flex flex-col gap-2">
        {steps.map((step, index) => {
          const isNext = step.id === nextId;
          return (
            <li key={step.id} className="flex gap-2.5 text-sm">
              <span
                className={
                  step.done
                    ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-brand text-xs font-medium text-text-inverse"
                    : isNext
                      ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-brand bg-surface text-xs font-medium text-brand"
                      : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-border text-xs text-text-muted"
                }
                aria-hidden
              >
                {step.done ? "✓" : index + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={
                    step.done
                      ? "text-text-muted line-through decoration-border"
                      : isNext
                        ? "font-medium text-text"
                        : "text-text-muted"
                  }
                >
                  {step.label}
                </p>
                {isNext ? (
                  <p className="mt-0.5 text-xs leading-snug text-text-muted">
                    {step.hint}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
