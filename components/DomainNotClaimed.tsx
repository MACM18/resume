"use client";

import { GlassCard } from "@/components/GlassCard";

export function DomainNotClaimed() {
  return (
    <div className='min-h-screen flex items-center justify-center text-center px-6'>
      <GlassCard className='p-8'>
        <h1 className='text-2xl font-bold mb-4'>Welcome to Your Portfolio</h1>
        <p className='text-foreground/70'>
          This domain isn&apos;t linked to a profile yet. Log in as an admin to
          claim it.
        </p>
      </GlassCard>
    </div>
  );
}