"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ExternalLink, Github } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/portfolio";

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.55, delay }} className={className}>{children}</motion.div>;
}

export default function ProjectClient({ initialProject }: { initialProject: Project | null }) {
  const project = initialProject;
  if (!project) {
    return <div className='flex min-h-[70vh] items-center justify-center px-6'><GlassCard variant='bordered' className='max-w-lg p-10 text-center'><p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary'>404 / project</p><h1 className='mt-4 text-3xl font-semibold'>Project not found</h1><p className='mt-4 leading-7 text-foreground/60'>The project you&apos;re looking for may have been unpublished or moved.</p><Button asChild className='mt-8 rounded-full px-6'><Link href='/projects'><ArrowLeft size={16} /> Back to projects</Link></Button></GlassCard></div>;
  }

  const hasImage = Boolean(project.image);
  const description = project.long_description || project.description || "More details about this project will be added soon.";

  return (
    <main className='min-h-screen pb-24'>
      <section className='border-b border-foreground/10 px-6 pb-16 pt-28 md:pb-24 md:pt-36'>
        <div className='mx-auto max-w-7xl'>
          <Reveal><Link href='/projects' className='inline-flex items-center gap-2 text-sm text-foreground/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'><ArrowLeft size={15} /> All projects</Link></Reveal>
          <div className='mt-12 grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-20'>
            <div>
              <Reveal delay={0.05}><p className='mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-primary'>{project.featured ? 'Featured case study' : 'Project case study'}</p></Reveal>
              <Reveal delay={0.1}><h1 className='max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] md:text-7xl'>{project.title}</h1></Reveal>
            </div>
            <Reveal delay={0.16}><p className='max-w-xl text-lg leading-8 text-foreground/65'>{project.description || 'A considered digital experience built around a clear purpose.'}</p></Reveal>
          </div>
          <Reveal delay={0.22}><div className='mt-8 flex flex-wrap gap-3'>
            {project.demo_url && <Button asChild className='rounded-full px-6'><a href={project.demo_url} target='_blank' rel='noopener noreferrer'><ExternalLink size={16} /> View live</a></Button>}
            {project.github_url && <Button asChild variant='outline' className='rounded-full border-foreground/20 bg-transparent px-6'><a href={project.github_url} target='_blank' rel='noopener noreferrer'><Github size={16} /> View source</a></Button>}
          </div></Reveal>
        </div>
      </section>

      <div className='mx-auto max-w-7xl space-y-20 px-6 pt-12 md:pt-20'>
        <Reveal>
          <div className='relative aspect-[16/9] overflow-hidden rounded-[1.5rem] border border-foreground/10 bg-foreground/[0.03]'>
            {hasImage ? <Image src={project.image!} alt={`${project.title} project preview`} fill priority sizes='(max-width: 1024px) 100vw, 1200px' className='object-cover' /> : <div className='flex h-full items-end bg-gradient-to-br from-primary/20 via-background/40 to-secondary/20 p-8'><span className='text-sm uppercase tracking-[0.2em] text-foreground/50'>Project preview unavailable</span></div>}
          </div>
        </Reveal>

        <div className='grid gap-14 lg:grid-cols-[1fr_280px] lg:gap-24'>
          <Reveal>
            <section aria-labelledby='project-overview-heading'>
              <p className='mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary'>01 / Overview</p>
              <h2 id='project-overview-heading' className='text-3xl font-semibold tracking-tight md:text-4xl'>The work behind the outcome.</h2>
              <p className='mt-6 whitespace-pre-line text-lg leading-8 text-foreground/65'>{description}</p>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <aside className='border-t border-foreground/10 pt-6'>
              <p className='mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45'>Built with</p>
              <div className='flex flex-wrap gap-x-4 gap-y-3 text-sm text-foreground/65'>{project.tech.length > 0 ? project.tech.map((tech) => <span key={tech}>{tech}</span>) : <span className='text-foreground/45'>Technologies coming soon</span>}</div>
            </aside>
          </Reveal>
        </div>

        <div className='grid gap-14 border-t border-foreground/10 pt-14 lg:grid-cols-[1fr_280px] lg:gap-24'>
          <Reveal>
            <section aria-labelledby='features-heading'>
              <p className='mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary'>02 / Details</p>
              <h2 id='features-heading' className='text-3xl font-semibold tracking-tight md:text-4xl'>What it does well.</h2>
              {project.key_features && project.key_features.length > 0 ? <ul className='mt-7 space-y-5'>{project.key_features.map((feature, index) => <li key={`${feature}-${index}`} className='flex gap-4 border-b border-foreground/10 pb-5 text-base leading-7 text-foreground/65'><span className='text-sm font-medium text-primary'>0{index + 1}</span><span>{feature}</span></li>)}</ul> : <p className='mt-6 leading-7 text-foreground/60'>Feature details for this project will be added soon.</p>}
            </section>
          </Reveal>
          <Reveal delay={0.08}><div className='border-t border-foreground/10 pt-6'><p className='mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45'>Continue exploring</p><Link href='/projects' className='inline-flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>View all projects <ArrowUpRight size={15} /></Link></div></Reveal>
        </div>
      </div>
    </main>
  );
}
