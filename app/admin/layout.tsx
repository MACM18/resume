import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/site-owner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getOwnerSession())) redirect("/login");
  return children;
}
