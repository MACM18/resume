"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export const AuthButton = () => {
  const { session, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
  };

  if (pathname?.startsWith("/admin") || status === "loading") return null;

  const accessLink = session
    ? <Link href="/admin" className="auth-access-link" aria-label="Open admin Dashboard"><span>Dashboard</span><span className="auth-access-arrow" aria-hidden="true">↗</span></Link>
    : <Link href="/login" className="auth-access-link"><span>Owner login</span><span className="auth-access-arrow" aria-hidden="true">↗</span></Link>;

  return <div className="auth-global-controls">{accessLink}{session && <button type="button" onClick={handleLogout} className="auth-signout-link">Sign out</button>}</div>;
};
