import { redirect } from "next/navigation";
import { AdminOverviewPage } from "@/components/admin/AdminOverviewPage";
import { PresetControls } from "@/components/admin/PresetControls";
import { legacyAdminPaths } from "@/components/admin/admin-routes";

export default async function AdminOverviewRoute({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  if (section && legacyAdminPaths[section]) redirect(legacyAdminPaths[section]);
  return (
    <div className="space-y-6">
      <PresetControls section="overview" />
      <AdminOverviewPage />
    </div>
  );
}
