"use client";

import { PhotosEditor } from "@/components/dashboard/PhotosEditor";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";

// Sidebar form for Profile — photos + identity
export default function ProfileAboutPage() {
  return (
    <div className="flex flex-col gap-5">
      <PhotosEditor />
      <ProfileEditor />
    </div>
  );
}
