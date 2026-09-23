import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { AccountSecurity } from "@/components/admin/AccountSecurity";

export default function AdminPage() {
  return (
    <AdminSectionFrame preset="account">
      <AccountSecurity />
    </AdminSectionFrame>
  );
}
