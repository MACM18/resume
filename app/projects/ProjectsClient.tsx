"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, Github, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { ProjectsPageSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import type { Project, Profile } from "@/types/portfolio";

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.55, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className='flex flex-wrap gap-3'>
      <Button asChild size='sm' className='rounded-full px-5'>
        <Link href={`/projects/${project.id}`}>Read case study <ArrowUpRight size={15} /></Link>
      </Button>
      {project.demo_url && (
        <a href={project.demo_url} target='_blank' rel='noopener noreferrer' aria-label={`Open live demo for ${project.title}`} className='inline-flex h-9 items-center gap-2 rounded-full border border-foreground/15 px-4 text-sm text-foreground/65 transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
          <ExternalLink size={14} /> Demo
        </a>
      )}
      {project.github_url && (
        <a href={project.github_url} target='_blank' rel='noopener noreferrer' aria-label={`View source code for ${project.title}`} className='inline-flex h-9 items-center gap-2 rounded-full border border-foreground/15 px-4 text-sm text-foreground/65 transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
          <Github size={14} /> Source
        </a>
      )}
    </div>
  );
}

function FeaturedProject({ project, index }: { project: Project; index: number }) {
  const hasImage = Boolean(project.image);
  return (
    <Reveal>
      <article className='grid gap-8 border-t border-foreground/10 py-8 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] md:items-center md:gap-12 md:py-12'>
        <Link href={`/projects/${project.id}`} className={`group relative block overflow-hidden rounded-[1.5rem] border border-foreground/10 bg-foreground/[0.03] ${index % 2 ? 'md:order-2' : ''}`}>
          <div className='aspect-[16/10] relative'>
            {hasImage ? (
              <Image src={project.image!} alt={`${project.title} project preview`} fill sizes='(max-width: 768px) 100vw, 60vw' priority={index === 0} className='object-cover transition duration-700 group-hover:scale-[1.03]' />
            ) : (
              <div className='flex h-full items-end bg-gradient-to-br from-primary/20 via-background/40 to-secondary/20 p-6'><span className='text-sm uppercase tracking-[0.2em] text-foreground/50'>Project preview</span></div>
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-background/45 to-transparent opacity-70' />
          </div>
        </Link>
        <div className={index % 2 ? 'md:order-1' : ''}>
          <div className='mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary'><span>0{index + 1}</span><span className='h-px w-10 bg-primary/50' /> Featured work</div>
          <h2 className='text-3xl font-semibold tracking-tight md:text-4xl'>{project.title}</h2>
          <p className='mt-4 text-base leading-7 text-foreground/65 md:text-lg'>{project.description || 'A thoughtful digital product built around useful outcomes.'}</p>
          <div className='mt-6 flex flex-wrap gap-x-3 gap-y-2 text-sm text-foreground/50'>{project.tech.slice(0, 5).map((tech) => <span key={tech}>{tech}</span>)}</div>
          <div className='mt-7'><ProjectLinks project={project} /></div>
        </div>
      </article>
    </Reveal>
  );
}

function ArchiveProject({ project }: { project: Project }) {
  return (
    <Reveal>
      <Link href={`/projects/${project.id}`} className='group flex h-full flex-col border-t border-foreground/10 py-6 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
        <div className='mb-5 flex items-start justify-between gap-4'><h3 className='text-xl font-semibold tracking-tight transition-colors group-hover:text-primary'>{project.title}</h3><ArrowUpRight className='mt-1 shrink-0 text-foreground/35 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary' size={18} /></div>
        <p className='line-clamp-3 flex-1 text-sm leading-6 text-foreground/60'>{project.description || 'A selected piece of digital work.'}</p>
        <div className='mt-5 flex flex-wrap gap-x-3 gap-y-2 text-xs text-foreground/45'>{project.tech.slice(0, 4).map((tech) => <span key={tech}>{tech}</span>)}</div>
      </Link>
    </Reveal>
  );
}

export default function ProjectsClient({ initialProfile, initialProjects, hostname: serverHostname }: { initialProfile: Profile; initialProjects: Project[]; hostname: string }) {
  const profileData = initialProfile;
  const projects = initialProjects || [];
  const hostname = serverHostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  const featuredProjects = projects.filter((project) => project.featured);
  const displayFeatured = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 3);
  const archiveProjects = featuredProjects.length > 0 ? projects.filter((project) => !project.featured) : projects.slice(3);

  if (!hostname) return <ProjectsPageSkeleton />;
  if (!profileData) return <DomainNotClaimed />;

  return (
    <main className='min-h-screen pb-24'>
      <section className='border-b border-foreground/10 px-6 pb-20 pt-32 md:pb-28 md:pt-40'>
        <div className='mx-auto max-w-7xl'>
          <Reveal><p className='mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Selected work / {String(projects.length).padStart(2, '0')} projects</p></Reveal>
          <Reveal delay={0.06}><h1 className='max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] md:text-7xl'>Work with a point of view.</h1></Reveal>
          <Reveal delay={0.12}><p className='mt-7 max-w-2xl text-xl leading-8 text-foreground/60 md:text-2xl'>A collection of digital products, systems, and experiments shaped around clarity, craft, and useful outcomes.</p></Reveal>
        </div>
      </section>

      <div className='mx-auto max-w-7xl space-y-24 px-6 pt-20 md:pt-28'>
        {displayFeatured.length > 0 ? (
          <section aria-labelledby='featured-work-heading'>
            <Reveal><div className='mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45'><Sparkles size={15} className='text-primary' /><h2 id='featured-work-heading'>Featured work</h2></div></Reveal>
            {displayFeatured.map((project, index) => <FeaturedProject key={project.id} project={project} index={index} />)}
          </section>
        ) : (
          <section className='border-y border-foreground/10 py-16'><p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary'>The portfolio is taking shape</p><h2 className='mt-4 text-3xl font-semibold tracking-tight'>Selected work will appear here soon.</h2><p className='mt-4 max-w-xl leading-7 text-foreground/60'>There are no published projects to show yet. Check back soon for new case studies.</p></section>
        )}

        {archiveProjects.length > 0 && (
          <section aria-labelledby='archive-heading'>
            <Reveal><div className='mb-8 flex items-end justify-between gap-6 border-b border-foreground/10 pb-5'><div><p className='mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary'>More explorations</p><h2 id='archive-heading' className='text-3xl font-semibold tracking-tight md:text-4xl'>Project archive</h2></div><span className='text-sm text-foreground/45'>{archiveProjects.length} published</span></div></Reveal>
            <div className='grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3'>{archiveProjects.map((project) => <ArchiveProject key={project.id} project={project} />)}</div>
          </section>
        )}
      </div>
    </main>
  );
}
