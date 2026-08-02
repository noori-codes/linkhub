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
import type { ApiSuccess, PublicProfile } from "@/lib/types";

type ProfileContextValue = {
  profile: PublicProfile | null;
  loading: boolean;
  error: string;
  setProfile: (profile: PublicProfile) => void;
  reload: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/profiles/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const data = (await res.json()) as ApiSuccess<{
        profile: PublicProfile;
      }> & { message?: string };

      if (!res.ok) {
        if (res.status === 401) {
          clearToken();
          router.replace("/login");
          return;
        }
        setError(data.message || "Could not load profile");
        if (res.status === 404) {
          router.replace("/onboarding");
        }
        return;
      }

      setError("");
      setProfile(data.data.profile);
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
    () => ({ profile, loading, error, setProfile, reload }),
    [profile, loading, error, reload],
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
