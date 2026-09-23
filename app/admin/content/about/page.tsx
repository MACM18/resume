import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { AboutPageForm } from "@/components/admin/AboutPageForm";

export default function AdminPage() {
  return (
    <AdminSectionFrame preset="about">
      <AboutPageForm />
    </AdminSectionFrame>
  );
}
