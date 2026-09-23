import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { ThemeEditor } from "@/components/admin/ThemeEditor";

export default function AdminPage() {
  return (
    <AdminSectionFrame preset="theme">
      <ThemeEditor />
    </AdminSectionFrame>
  );
}
