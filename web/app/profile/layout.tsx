import { Suspense } from "react";

import { ProfileProvider } from "@/components/profile/ProfileProvider";
import { ProfileShell } from "@/components/profile/ProfileShell";
import { DashboardShellSkeleton } from "@/components/Skeleton";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh overflow-hidden">
      <ProfileProvider>
        <Suspense fallback={<DashboardShellSkeleton />}>
          <ProfileShell>{children}</ProfileShell>
        </Suspense>
      </ProfileProvider>
    </div>
  );
}
