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

import { clearToken, getToken } from "@/lib/auth";

type ClientAuthContextValue = {
  ready: boolean;
  loggedIn: boolean;
  logout: () => void;
};

const ClientAuthContext = createContext<ClientAuthContextValue | null>(null);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setLoggedIn(false);
  }, []);

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
