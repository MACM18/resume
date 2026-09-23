import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { WorkExperienceManagement } from "@/components/admin/WorkExperienceManagement";

export default function AdminPage() {
  return (
    <AdminSectionFrame preset="work">
      <WorkExperienceManagement />
    </AdminSectionFrame>
  );
}
