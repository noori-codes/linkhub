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
import { useQueryClient } from "@tanstack/react-query";

import { endAuthSession, subscribeAuthChanges } from "@/lib/auth-session";
import { getToken } from "@/lib/auth";

type ClientAuthContextValue = {
  ready: boolean;
  loggedIn: boolean;
  logout: () => void;
};

const ClientAuthContext = createContext<ClientAuthContextValue | null>(null);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => setLoggedIn(Boolean(getToken()));
    sync();
    setReady(true);
    return subscribeAuthChanges(sync);
  }, []);

  const logout = useCallback(() => {
    endAuthSession(queryClient);
    setLoggedIn(false);
  }, [queryClient]);

  const value = useMemo(
    () => ({ ready, loggedIn, logout }),
    [ready, loggedIn, logout],
  );

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) {
    throw new Error("useClientAuth must be used within ClientAuthProvider");
  }
  return ctx;
}
