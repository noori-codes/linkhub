import { Suspense } from "react";

import { ProfileProvider } from "@/components/profile/ProfileProvider";
import { ProfileShell } from "@/components/profile/ProfileShell";
import { Loader } from "@/components/Loader";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh overflow-hidden">
      <ProfileProvider>
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-bg">
              <Loader label="Loading…" />
            </div>
          }
        >
          <ProfileShell>{children}</ProfileShell>
        </Suspense>
      </ProfileProvider>
    </div>
  );
}
