import type { ReactNode } from "react";

import { uiEmpty, uiEmptyHint, uiEmptyTitle } from "@/lib/ui";

type Props = {
  title: string;
  hint?: string;
  className?: string;
  children?: ReactNode;
};

export function EmptyState({ title, hint, className = "", children }: Props) {
  return (
    <div className={`${uiEmpty} ${className}`.trim()}>
      <p className={uiEmptyTitle}>{title}</p>
      {hint ? <p className={uiEmptyHint}>{hint}</p> : null}
      {children}
    </div>
  );
}
