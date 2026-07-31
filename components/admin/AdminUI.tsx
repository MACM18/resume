"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-5 border-b border-foreground/10 pb-6 md:flex-row md:items-end md:justify-between'>
      <div>
        {eyebrow && <p className='mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary'>{eyebrow}</p>}
        <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>{title}</h2>
        {description && <p className='mt-2 max-w-2xl text-sm leading-6 text-foreground/55'>{description}</p>}
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </div>
  );
}

export function AdminStatusBadge({ status, children }: { status: "success" | "warning" | "neutral" | "error"; children: React.ReactNode }) {
  const styles = { success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500", warning: "border-amber-500/25 bg-amber-500/10 text-amber-500", neutral: "border-foreground/15 bg-foreground/5 text-foreground/55", error: "border-destructive/25 bg-destructive/10 text-destructive" };
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium', styles[status])}>{status === 'success' ? <CheckCircle2 size={13} /> : status === 'error' ? <AlertCircle size={13} /> : null}{children}</span>;
}

export function AdminLoadingState({ label = "Loading workspace" }: { label?: string }) {
  return <div className='flex min-h-40 items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] text-sm text-foreground/50'><Loader2 className='animate-spin text-primary' size={18} />{label}</div>;
}

export function AdminErrorState({ onRetry, label = "This section could not be loaded." }: { onRetry?: () => void; label?: string }) {
  return <div className='flex min-h-40 flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/[0.04] p-6 text-center'><AlertCircle className='mb-3 text-destructive' size={22} /><p className='text-sm text-foreground/70'>{label}</p>{onRetry && <Button type='button' variant='outline' size='sm' className='mt-4' onClick={onRetry}>Try again</Button>}</div>;
}

export function AdminEmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className='rounded-xl border border-dashed border-foreground/15 bg-foreground/[0.02] p-8 text-center'><p className='font-medium'>{title}</p><p className='mx-auto mt-2 max-w-md text-sm leading-6 text-foreground/55'>{description}</p>{action && <div className='mt-5'>{action}</div>}</div>;
}
