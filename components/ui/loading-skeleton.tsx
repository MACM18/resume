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

export function ProjectDetailPageSkeleton() {
  return (
    <div className='min-h-screen relative pt-32 pb-20 px-6'>
      <div className='max-w-5xl mx-auto'>
        <Skeleton className='h-10 w-36 mb-12' />
        <Skeleton className='h-14 w-4/5 mb-6' />
        <Skeleton className='h-7 w-full max-w-3xl mb-8' />
        <div className='flex gap-4 mb-12'>
          <Skeleton className='h-12 w-36' />
          <Skeleton className='h-12 w-32' />
        </div>
        <Skeleton className='aspect-video w-full rounded-xl mb-16' />
        <Skeleton className='h-10 w-64 mb-4' />
        <Skeleton className='h-5 w-full mb-3' />
        <Skeleton className='h-5 w-11/12 mb-12' />
        <div className='grid lg:grid-cols-3 gap-8'>
          <GlassCard variant='gradient' className='p-8 lg:col-span-2'>
            <Skeleton className='h-8 w-48 mb-8' />
            <div className='space-y-4'>
              <Skeleton className='h-5 w-full' />
              <Skeleton className='h-5 w-11/12' />
              <Skeleton className='h-5 w-4/5' />
              <Skeleton className='h-5 w-10/12' />
            </div>
          </GlassCard>
          <GlassCard variant='gradient' className='p-6'>
            <Skeleton className='h-7 w-40 mb-6' />
            <div className='flex flex-wrap gap-2'>
              <Skeleton className='h-8 w-20' />
              <Skeleton className='h-8 w-24' />
              <Skeleton className='h-8 w-16' />
              <Skeleton className='h-8 w-28' />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export function ResumePageSkeleton() {
  return (
    <div className='min-h-screen relative pt-32 pb-20 px-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center max-w-3xl mx-auto mb-12'>
          <Skeleton className='h-14 w-64 mx-auto mb-6' />
          <Skeleton className='h-7 w-80 mx-auto mb-8' />
          <Skeleton className='h-14 w-52 mx-auto' />
        </div>
        <div className='grid lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-10'>
            <GlassCard variant='gradient' className='p-8 md:p-10'>
              <Skeleton className='h-9 w-64 mx-auto mb-4' />
              <Skeleton className='h-6 w-48 mx-auto mb-8' />
              <Skeleton className='h-5 w-full mb-3' />
              <Skeleton className='h-5 w-11/12 mx-auto' />
            </GlassCard>
            <GlassCard variant='gradient' className='p-8'>
              <Skeleton className='h-9 w-72 mb-8' />
              <div className='space-y-6'>
                <Skeleton className='h-28 w-full' />
                <Skeleton className='h-28 w-full' />
              </div>
            </GlassCard>
          </div>
          <div className='space-y-8'>
            <GlassCard variant='gradient' className='p-8'>
              <Skeleton className='h-8 w-40 mb-8' />
              <div className='space-y-4'>
                <Skeleton className='h-5 w-full' />
                <Skeleton className='h-5 w-5/6' />
                <Skeleton className='h-5 w-4/6' />
              </div>
            </GlassCard>
            <GlassCard variant='gradient' className='p-8'>
              <Skeleton className='h-8 w-48 mb-8' />
              <div className='space-y-4'>
                <Skeleton className='h-5 w-full' />
                <Skeleton className='h-5 w-11/12' />
                <Skeleton className='h-5 w-3/4' />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
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
