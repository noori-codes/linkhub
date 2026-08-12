"use client";

import { PlatformIconBadge } from "@/components/onboarding/PlatformIconBadge";
import { LINK_PLATFORMS } from "@/lib/link-platforms";

type Props = {
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

export function PlatformPicker({ selected, onChange, disabled }: Props) {
  function toggle(id: string) {
    if (disabled) return;
    onChange(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id],
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {LINK_PLATFORMS.map((platform) => {
        const active = selected.includes(platform.id);

        return (
          <li key={platform.id}>
            <button
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => toggle(platform.id)}
              className={`flex w-full flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition-[border-color,box-shadow,background-color] disabled:opacity-60 ${
                active
                  ? "border-brand bg-brand/5 shadow-[0_0_0_1px_var(--brand)]"
                  : "border-border hover:border-brand/35"
              }`}
            >
              <PlatformIconBadge platform={platform.id} />
              <span className="text-[11px] leading-tight font-medium text-text">
                {platform.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
