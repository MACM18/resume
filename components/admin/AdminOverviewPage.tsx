"use client";

import { useRouter } from "next/navigation";
import { AdminOverview } from "./AdminOverview";
import { legacyAdminPaths } from "./admin-routes";

export function AdminOverviewPage() {
  const router = useRouter();
  return <AdminOverview onNavigate={(section) => router.push(legacyAdminPaths[section] || "/admin")} />;
}
