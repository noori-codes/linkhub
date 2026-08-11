type Props = {
  hasAvatar: boolean;
  hasLinks: boolean;
  isPublished: boolean;
  username: string;
};

type Step = {
  id: string;
  done: boolean;
  label: string;
  hint: string;
};

export function FirstRunGuide({
  hasAvatar,
  hasLinks,
  isPublished,
  username,
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
      hint: `Open Settings and publish /u/${username}.`,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) {
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
