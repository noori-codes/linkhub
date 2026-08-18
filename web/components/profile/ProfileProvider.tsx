"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { endAuthSession } from "@/lib/auth-session";
import { NETWORK_ERROR } from "@/lib/client-api";
import {
  fetchMyLinks,
  fetchMyProfile,
  HttpError,
  queryKeys,
} from "@/lib/dashboard-queries";
import type { PublicLink, PublicProfile } from "@/lib/types";

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
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: queryKeys.profileMe,
    queryFn: fetchMyProfile,
    retry: false,
  });

  const linksQuery = useQuery({
    queryKey: queryKeys.linksMe,
    queryFn: fetchMyLinks,
    retry: false,
    enabled: profileQuery.isSuccess,
  });

  useEffect(() => {
    const err = profileQuery.error;
    if (!err) return;

    if (err instanceof HttpError && err.status === 401) {
      endAuthSession(queryClient);
      router.replace("/login");
      return;
    }

    if (err instanceof HttpError && err.status === 404) {
      router.replace("/onboarding");
    }
  }, [profileQuery.error, queryClient, router]);

  const setProfile = useCallback(
    (profile: PublicProfile) => {
      queryClient.setQueryData(queryKeys.profileMe, profile);
    },
    [queryClient],
  );

  const setLinks = useCallback(
    (links: PublicLink[]) => {
      queryClient.setQueryData(queryKeys.linksMe, links);
    },
    [queryClient],
  );

  const reload = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.profileMe }),
      queryClient.invalidateQueries({ queryKey: queryKeys.linksMe }),
    ]);
  }, [queryClient]);

  const profileError =
    profileQuery.error instanceof Error
      ? profileQuery.error.message
      : profileQuery.error
        ? "Could not load profile"
        : "";

  const networkError =
    profileQuery.isError &&
    !(profileQuery.error instanceof HttpError) &&
    NETWORK_ERROR;

  const value = useMemo(
    () => ({
      profile: profileQuery.data ?? null,
      links: linksQuery.data ?? [],
      loading: profileQuery.isLoading || (profileQuery.isSuccess && linksQuery.isLoading),
      error: networkError || profileError,
      setProfile,
      setLinks,
      reload,
    }),
    [
      profileQuery.data,
      profileQuery.isLoading,
      profileQuery.isSuccess,
      linksQuery.data,
      linksQuery.isLoading,
      networkError,
      profileError,
      setProfile,
      setLinks,
      reload,
    ],
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
