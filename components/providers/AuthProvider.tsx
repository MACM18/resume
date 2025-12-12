"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect } from "react";
import { Session } from "next-auth";
import { ensureUserProfile } from "@/lib/profile";

type AuthContextType = {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
};

const AuthContext = createContext<AuthContextType | null>(null);

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Ensure profile exists for authenticated users
    if (status === "authenticated" && session) {
      ensureUserProfile();
    }
  }, [session, status]);

  return (
    <AuthContext.Provider value={{ session, status }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Backwards compatibility alias - will be removed in future
export const useSupabase = useAuth;
