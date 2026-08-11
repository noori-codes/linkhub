import { ProfileProvider } from "@/components/profile/ProfileProvider";
import { ProfileShell } from "@/components/profile/ProfileShell";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh overflow-hidden">
      <ProfileProvider>
        <ProfileShell>{children}</ProfileShell>
      </ProfileProvider>
    </div>
  );
}
