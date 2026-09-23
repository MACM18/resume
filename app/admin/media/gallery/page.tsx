import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { GalleryManager } from "@/components/admin/GalleryManager";

export default function AdminPage() {
  return (
    <AdminSectionFrame preset="gallery">
      <GalleryManager />
    </AdminSectionFrame>
  );
}
