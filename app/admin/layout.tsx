import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getOwnerSession } from "@/lib/site-owner";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getOwnerSession())) {
    const pathname = (await headers()).get("x-admin-return-to") || "/admin";
    redirect("/login?callbackUrl=" + encodeURIComponent(pathname));
  }
  return <AdminShell>{children}</AdminShell>;
}
