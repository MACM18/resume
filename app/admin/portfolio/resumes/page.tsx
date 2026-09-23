import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { ResumeManagement } from "@/components/admin/ResumeManagement";
import { ResumeManager } from "@/components/admin/ResumeManager";

export default function AdminPage() {
  return (
    <AdminSectionFrame preset="resumes">
      <div className="space-y-8">
        <ResumeManagement />
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <ResumeManager />
        </section>
      </div>
    </AdminSectionFrame>
  );
}
