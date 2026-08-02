"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { clearToken, getToken } from "@/lib/auth";
import type { ApiSuccess, PublicLink, PublicProfile } from "@/lib/types";

type ProfileContextValue = {
  profile: PublicProfile | null;
  links: PublicLink[];
  loading: boolean;
  error: string;
  setProfile: (profile: PublicProfile) => void;
  setLinks: (links: PublicLink[]) => void;
  reload: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [profileRes, linksRes] = await Promise.all([
        fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
          headers: authHeaders,
          cache: "no-store",
        }),
        fetch(`${CLIENT_API_BASE}/api/v1/links/me`, {
          headers: authHeaders,
          cache: "no-store",
        }),
      ]);

      const profileData = (await profileRes.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      const linksData = (await linksRes.json()) as ApiSuccess<{
        links: PublicLink[];
      }> & { message?: string };

      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          clearToken();
          router.replace("/login");
          return;
        }
        setError(profileData.message || "Could not load profile");
        if (profileRes.status === 404) {
          router.replace("/onboarding");
        }
        return;
      }

      setError("");
      setProfile(profileData.data.profile);

      if (linksRes.ok) {
        setLinks(linksData.data.links);
      }
    } catch {
      setError("Cannot reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      profile,
      links,
      loading,
      error,
      setProfile,
      setLinks,
      reload,
    }),
    [profile, links, loading, error, reload],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }
  return ctx;
}
