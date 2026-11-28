"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/AuthButton";
import { Navigation } from "@/components/Navigation";
import { PageTransition } from "@/components/PageTransition";
import { isAdminPathname } from "@/components/admin/admin-routes";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = isAdminPathname(pathname);

  return (
    <div className={isAdmin ? "admin-route" : undefined}>
      {!isAdmin && <Suspense fallback={null}><Navigation /></Suspense>}
      <PageTransition>{children}</PageTransition>
      {!isAdmin && <AuthButton />}
    </div>
  );
}
