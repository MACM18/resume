import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/site-owner";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getOwnerSession())) redirect("/login");
  return <AdminShell>{children}</AdminShell>;
}
