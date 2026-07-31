"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/GlassCard";

export function PageHeaderSkeleton() {
  return (
    <div className='text-center mb-16'>
      <Skeleton className='h-16 w-3/4 max-w-2xl mx-auto mb-6' />
      <Skeleton className='h-6 w-full max-w-3xl mx-auto' />
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <GlassCard variant='gradient' className='overflow-hidden'>
      <Skeleton className='aspect-video w-full' />
      <div className='p-6 space-y-4'>
        <Skeleton className='h-8 w-3/4' />
        <Skeleton className='h-20 w-full' />
        <div className='flex gap-2'>
          <Skeleton className='h-6 w-16' />
          <Skeleton className='h-6 w-20' />
          <Skeleton className='h-6 w-16' />
        </div>
        <div className='flex gap-3'>
          <Skeleton className='h-10 flex-1' />
          <Skeleton className='h-10 w-20' />
        </div>
      </div>
    </GlassCard>
  );
}

export function StatsCardSkeleton() {
  return (
    <GlassCard variant='gradient' className='p-6 text-center'>
      <Skeleton className='h-12 w-24 mx-auto mb-2' />
      <Skeleton className='h-4 w-32 mx-auto mb-3' />
      <Skeleton className='h-16 w-full' />
    </GlassCard>
  );
}

export function FeatureCardSkeleton() {
  return (
    <GlassCard variant='gradient' className='p-6'>
      <div className='flex items-start gap-4'>
        <Skeleton className='h-12 w-12 rounded-xl' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='h-16 w-full' />
        </div>
      </div>
    </GlassCard>
  );
}

export function HomePageSkeleton() {
  return (
    <div className='min-h-screen pt-28 pb-20'>
      <div className='mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2'>
        <div className='space-y-6'>
          <Skeleton className='h-5 w-48' />
          <Skeleton className='h-24 w-full max-w-2xl' />
          <Skeleton className='h-8 w-3/4 max-w-xl' />
          <Skeleton className='h-20 w-full max-w-xl' />
          <div className='flex gap-3 pt-4'>
            <Skeleton className='h-12 w-40 rounded-full' />
            <Skeleton className='h-12 w-44 rounded-full' />
          </div>
        </div>
        <Skeleton className='mx-auto aspect-[4/5] w-full max-w-[460px] rounded-[2rem]' />
      </div>
      <div className='mx-auto mt-20 grid max-w-7xl gap-6 px-6 md:grid-cols-2'>
        <Skeleton className='aspect-video w-full rounded-[2rem]' />
        <div className='space-y-4 rounded-[2rem] border border-foreground/10 p-8'>
          <Skeleton className='h-10 w-3/4' />
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-10 w-40 rounded-full' />
        </div>
      </div>
    </div>
  );
}

export function AboutPageSkeleton() {
  return (
    <div className='min-h-screen pt-28 pb-20'>
      <div className='mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2'>
        <Skeleton className='mx-auto aspect-[4/5] w-full max-w-[420px] rounded-[2rem] lg:order-1' />
        <div className='space-y-6 lg:order-2'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-20 w-full max-w-2xl' />
          <Skeleton className='h-10 w-4/5 max-w-xl' />
          <div className='flex gap-3 pt-4'>
            <Skeleton className='h-12 w-44 rounded-full' />
            <Skeleton className='h-12 w-36 rounded-full' />
          </div>
        </div>
      </div>
      <div className='mx-auto mt-20 max-w-7xl space-y-12 px-6'>
        <PageHeaderSkeleton />
        <div className='grid gap-8 md:grid-cols-2'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-32 w-full' />
        </div>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
        </div>
      </div>
    </div>
  );
}

export function ProjectsPageSkeleton() {
  return (
    <div className='min-h-screen pb-24 pt-32'>
      <div className='border-b border-foreground/10 px-6 pb-20'><div className='mx-auto max-w-7xl space-y-5'><Skeleton className='h-4 w-56' /><Skeleton className='h-20 w-full max-w-3xl' /><Skeleton className='h-8 w-full max-w-2xl' /></div></div>
      <div className='mx-auto max-w-7xl space-y-8 px-6 pt-20'><Skeleton className='h-5 w-36' />{[0, 1, 2].map((item) => <div key={item} className='grid gap-8 border-t border-foreground/10 py-10 md:grid-cols-[1.15fr_0.85fr]'><Skeleton className='aspect-[16/10] w-full rounded-[1.5rem]' /><div className='space-y-5'><Skeleton className='h-4 w-36' /><Skeleton className='h-10 w-3/4' /><Skeleton className='h-20 w-full' /><Skeleton className='h-9 w-40 rounded-full' /></div></div>)}</div>
    </div>
  );
}

export function ProjectDetailPageSkeleton() {
  return (
    <div className='min-h-screen pb-24 pt-28'><div className='border-b border-foreground/10 px-6 pb-20'><div className='mx-auto max-w-7xl space-y-8'><Skeleton className='h-5 w-32' /><div className='grid gap-8 lg:grid-cols-2'><Skeleton className='h-20 w-full' /><Skeleton className='h-24 w-full' /></div><Skeleton className='h-10 w-44 rounded-full' /></div></div><div className='mx-auto max-w-7xl space-y-16 px-6 pt-12'><Skeleton className='aspect-video w-full rounded-[1.5rem]' /><div className='grid gap-12 lg:grid-cols-[1fr_280px]'><div className='space-y-5'><Skeleton className='h-5 w-32' /><Skeleton className='h-10 w-3/4' /><Skeleton className='h-32 w-full' /></div><Skeleton className='h-28 w-full' /></div></div></div>
  );
}

export function ResumePageSkeleton() {
  return (
    <div className='min-h-screen pb-24 pt-32'><div className='border-b border-foreground/10 px-6 pb-20'><div className='mx-auto max-w-7xl space-y-6'><Skeleton className='h-4 w-48' /><div className='grid gap-8 lg:grid-cols-2'><Skeleton className='h-20 w-full' /><div className='space-y-5'><Skeleton className='h-24 w-full' /><Skeleton className='h-11 w-40 rounded-full' /></div></div></div></div><div className='mx-auto max-w-7xl space-y-16 px-6 pt-20'><div className='grid gap-12 lg:grid-cols-[1fr_280px]'><div className='space-y-8'><Skeleton className='h-5 w-40' /><Skeleton className='h-10 w-72' /><Skeleton className='h-52 w-full' /></div><div className='space-y-8'><Skeleton className='h-28 w-full' /><Skeleton className='h-32 w-full' /></div></div><Skeleton className='h-48 w-full' /></div></div>
  );
}

export function ContactPageSkeleton() {
  return (
    <div className='min-h-screen relative pt-20 md:pt-32 pb-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        <PageHeaderSkeleton />
        <div className='grid lg:grid-cols-2 gap-8'>
          <GlassCard variant='gradient' className='p-8'>
            <Skeleton className='h-8 w-56 mb-8' />
            <div className='space-y-6'>
              <Skeleton className='h-11 w-full' />
              <Skeleton className='h-11 w-full' />
              <Skeleton className='h-11 w-full' />
              <Skeleton className='h-32 w-full' />
              <Skeleton className='h-11 w-40' />
            </div>
          </GlassCard>
          <div className='space-y-6'>
            <FeatureCardSkeleton />
            <FeatureCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryPageSkeleton() {
  return (
    <div className='min-h-screen relative pb-20'>
      <div className='pt-32 pb-20 px-6'>
        <PageHeaderSkeleton />
      </div>
      <div className='max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-4'>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className='aspect-square rounded-xl' />
        ))}
      </div>
    </div>
  );
}
