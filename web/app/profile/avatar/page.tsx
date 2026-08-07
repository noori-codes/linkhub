"use client";

import { ButtonShapePicker } from "@/components/dashboard/ButtonShapePicker";
import { ThemePicker } from "@/components/dashboard/ThemePicker";

export default function ProfileAvatarPage() {
  return (
    <div className="flex flex-col gap-5">
      <ThemePicker />
      <ButtonShapePicker />
    </div>
  );
}
