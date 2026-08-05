"use client";

import { PhotosEditor } from "@/components/dashboard/PhotosEditor";
import { ThemePicker } from "@/components/dashboard/ThemePicker";

export default function ProfileAvatarPage() {
  return (
    <div className="flex flex-col gap-5">
      <PhotosEditor />
      <ThemePicker />
    </div>
  );
}
