"use client";

import { generatePKCEPair } from "@nhost/nhost-js/auth";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { hasNhostConfig, nhost } from "./nhost/client";
import type { CurrentUser } from "./types";

type AuthContext = { user: CurrentUser | null; loading: boolean; error: string | null; signInWithGoogle: () => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContext | null>(null);

function mapUser(user: { id: string; displayName?: string | null; email?: string | null; avatarUrl?: string | null } | null | undefined): CurrentUser | null {
  if (!user) return null;
  return { id: user.id, displayName: user.displayName ?? null, email: user.email ?? null, avatarUrl: user.avatarUrl ?? null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => mapUser(nhost.getUserSession()?.user ?? null));
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = nhost.sessionStorage.onChange((session) => { setUser(mapUser(session?.user ?? null)); });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading && user && pathname === "/") router.replace("/sets");
  }, [loading, pathname, router, user]);

  const value = useMemo<AuthContext>(() => ({
    user,
    loading,
    error,
    signInWithGoogle: async () => {
      setError(null);
      if (!hasNhostConfig) { setError("Missing Nhost configuration"); return; }
      try {
        const { verifier, challenge } = await generatePKCEPair();
        window.localStorage.setItem("phrase-pal.pkce-verifier", verifier);
        const redirectTo = `${window.location.origin}/auth/callback`;
        window.location.href = nhost.auth.signInProviderURL("google", { redirectTo, codeChallenge: challenge });
      } catch (cause) { setError(cause instanceof Error ? cause.message : "Authentication failed"); }
    },
    signOut: async () => { const session = nhost.getUserSession(); if (session) await nhost.auth.signOut({ refreshToken: session.refreshTokenId }); nhost.clearSession(); setUser(null); router.replace("/"); },
  }), [error, loading, router, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
