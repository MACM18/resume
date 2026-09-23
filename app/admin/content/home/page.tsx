import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { HomePageForm } from "@/components/admin/HomePageForm";

export default function AdminPage() {
  return (
    <AdminSectionFrame preset="home">
      <HomePageForm />
    </AdminSectionFrame>
  );
}
