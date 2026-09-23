import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { ProfileManagement } from "@/components/admin/ProfileManagement";

export default function AdminPage() {
  return (
    <AdminSectionFrame preset="profile">
      <ProfileManagement />
    </AdminSectionFrame>
  );
}
