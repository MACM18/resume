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
    <div className='min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto'>
      <PageHeaderSkeleton />
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16'>
        <FeatureCardSkeleton />
        <FeatureCardSkeleton />
        <FeatureCardSkeleton />
      </div>
      <div className='grid lg:grid-cols-2 gap-8'>
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </div>
  );
}

export function AboutPageSkeleton() {
  return (
    <div className='min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto'>
      <PageHeaderSkeleton />
      <GlassCard variant='gradient' className='p-8 mb-12'>
        <Skeleton className='h-8 w-32 mb-6' />
        <div className='space-y-4'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>
      </GlassCard>
      <div className='grid md:grid-cols-2 gap-6'>
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
    </div>
  );
}

export function ProjectsPageSkeleton() {
  return (
    <div className='min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto'>
      <PageHeaderSkeleton />
      <div className='grid lg:grid-cols-2 gap-8'>
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </div>
  );
}
