import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PresetControls } from "./PresetControls";

export function AdminSectionFrame({ preset, children }: { preset: string; children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <PresetControls section={preset} />
        {children}
      </div>
    </ErrorBoundary>
  );
}
