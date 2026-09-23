import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { ProjectManagement } from "@/components/admin/ProjectManagement";

export default function AdminPage() {
  return (
    <AdminSectionFrame preset="projects">
      <ProjectManagement />
    </AdminSectionFrame>
  );
}
