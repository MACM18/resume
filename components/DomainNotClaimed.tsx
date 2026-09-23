import { GlassCard } from "@/components/GlassCard";

export function DomainNotClaimed() {
  return (
    <div className='min-h-screen flex items-center justify-center text-center px-6'>
      <GlassCard className='p-8'>
        <h1 className='text-2xl font-bold mb-4'>Portfolio unavailable</h1>
        <p className='text-foreground/70'>The portfolio content is temporarily unavailable.</p>
      </GlassCard>
    </div>
  );
}
