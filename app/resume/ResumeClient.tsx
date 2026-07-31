"use client";

import Link from "next/link";
import { ArrowUpRight, Award, Calendar, Download, ExternalLink, GraduationCap, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ResumePageSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import type { Project, Profile, Resume, WorkExperience } from "@/types/portfolio";
import { formatDateRange } from "@/lib/utils";

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: reducedMotion ? 0 : 0.5, delay }} className={className}>{children}</motion.div>;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className='mb-8 border-b border-foreground/10 pb-5'><p className='mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary'>{eyebrow}</p><h2 className='text-3xl font-semibold tracking-tight md:text-4xl'>{title}</h2></div>;
}

function TimelineItem({ experience, index }: { experience: WorkExperience | Resume['experience'][number]; index: number }) {
  const isWorkExperience = 'start_date' in experience;
  const dateLabel = isWorkExperience ? formatDateRange(experience.start_date, experience.end_date || undefined, experience.is_current) : experience.duration;
  return <Reveal delay={index * 0.05}><article className='relative border-l border-primary/40 pb-10 pl-7 last:pb-0 md:pl-9'><span className='absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background' /><div className='flex flex-col justify-between gap-2 md:flex-row md:gap-6'><div><h3 className='text-xl font-semibold tracking-tight'>{experience.position}</h3><p className='mt-1 text-primary'>{experience.company}</p></div><p className='flex shrink-0 items-center gap-2 text-sm text-foreground/45'><Calendar size={14} />{dateLabel}</p></div>{isWorkExperience && experience.location && <p className='mt-3 flex items-center gap-2 text-sm text-foreground/45'><MapPin size={14} />{experience.location}</p>}<ul className='mt-5 space-y-3'>{(experience.description || []).filter(Boolean).map((item, itemIndex) => <li key={`${item}-${itemIndex}`} className='flex gap-3 text-sm leading-7 text-foreground/65'><span className='mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70' />{item}</li>)}</ul></article></Reveal>;
}

export default function ResumeClient({ initialProfile, initialResume, initialProjects, initialWork, hostname: serverHostname }: { initialProfile: Profile; initialResume: Resume | null; initialProjects: Project[]; initialWork: WorkExperience[]; hostname: string }) {
  const profileData = initialProfile;
  const resume = initialResume;
  const hostname = serverHostname || (typeof window !== 'undefined' ? window.location.hostname : '');

  if (!hostname) return <ResumePageSkeleton />;
  if (!profileData) return <DomainNotClaimed />;
  if (!resume) return <div className='flex min-h-[70vh] items-center justify-center px-6'><div className='max-w-md border-t border-foreground/15 pt-6'><p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary'>Resume unavailable</p><h1 className='mt-4 text-3xl font-semibold'>There is no active resume yet.</h1><p className='mt-4 leading-7 text-foreground/60'>The profile owner has not selected a public resume for this site.</p></div></div>;

  const fullName = profileData.full_name || 'Resume';
  const role = resume.title || resume.role || profileData.active_resume_role || 'Professional profile';
  const contactEmail = profileData.home_page_data?.callToAction?.email || '';
  const workHistory: WorkExperience[] | Resume['experience'] = initialWork.length > 0 ? initialWork : resume.experience || [];
  const selectedProjects = (resume.project_ids || []).map((id) => initialProjects.find((project) => project.id === id)).filter((project): project is Project => Boolean(project));
  const skills = (resume.skills || []).filter(Boolean);
  const education = (resume.education || []).filter(Boolean);
  const certifications = (resume.certifications || []).filter(Boolean);

  return <ErrorBoundary><main className='min-h-screen pb-24'>
    <section className='border-b border-foreground/10 px-6 pb-16 pt-32 md:pb-24 md:pt-40'>
      <div className='mx-auto max-w-7xl'><Reveal><p className='mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Resume / {fullName}</p></Reveal><div className='grid gap-10 lg:grid-cols-[1fr_0.65fr] lg:items-end lg:gap-20'><Reveal delay={0.06}><h1 className='max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] md:text-7xl'>{role}</h1></Reveal><Reveal delay={0.12}><div><p className='text-lg leading-8 text-foreground/65'>{resume.summary || 'A concise overview of experience, capabilities, and selected work.'}</p><div className='mt-7 flex flex-wrap items-center gap-4'><Button asChild className='rounded-full px-6'><Link href='/resume/download'><Download size={16} /> Download PDF</Link></Button>{contactEmail && <a href={`mailto:${contactEmail}`} className='text-sm text-foreground/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>{contactEmail}</a>}</div></div></Reveal></div></div>
    </section>

    <div className='mx-auto max-w-7xl space-y-20 px-6 pt-16 md:pt-24'>
      <div className='grid gap-14 lg:grid-cols-[1fr_280px] lg:gap-24'>
        <Reveal><section aria-labelledby='experience-heading'><SectionHeading eyebrow='01 / Experience' title='A record of useful work.' />{workHistory.length > 0 ? <div>{workHistory.map((experience, index) => <TimelineItem key={'id' in experience ? experience.id : `${experience.company}-${index}`} experience={experience} index={index} />)}</div> : <p className='leading-7 text-foreground/60'>Professional experience will be added soon.</p>}</section></Reveal>
        <Reveal delay={0.08}><aside className='space-y-10'><div className='border-t border-foreground/10 pt-6'><p className='mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45'>Profile</p><div className='space-y-3 text-sm text-foreground/65'>{resume.location && <p className='flex items-center gap-2'><MapPin size={15} className='text-primary' />{resume.location}</p>}{contactEmail && <a href={`mailto:${contactEmail}`} className='block transition-colors hover:text-primary'>{contactEmail}</a>}</div></div>{skills.length > 0 && <div className='border-t border-foreground/10 pt-6'><p className='mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45'>Skills</p><div className='flex flex-wrap gap-x-3 gap-y-2 text-sm text-foreground/65'>{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>}</aside></Reveal>
      </div>

      {(education.length > 0 || certifications.length > 0) && <section><Reveal><SectionHeading eyebrow='02 / Foundations' title='Learning and credentials.' /></Reveal><div className='grid gap-x-12 gap-y-10 md:grid-cols-2'>{education.length > 0 && <Reveal><div><div className='mb-5 flex items-center gap-3'><GraduationCap size={18} className='text-primary' /><h3 className='text-lg font-semibold'>Education</h3></div><div className='space-y-5'>{education.map((item, index) => <div key={`${item.school}-${index}`} className='border-l border-foreground/15 pl-5'><p className='font-medium'>{item.degree}</p><p className='mt-1 text-sm text-foreground/60'>{item.school}</p><p className='mt-2 text-xs text-foreground/45'>{item.year}</p></div>)}</div></div></Reveal>}{certifications.length > 0 && <Reveal delay={0.06}><div><div className='mb-5 flex items-center gap-3'><Award size={18} className='text-primary' /><h3 className='text-lg font-semibold'>Certifications</h3></div><div className='space-y-5'>{certifications.map((item, index) => <div key={`${item.name}-${index}`} className='border-l border-foreground/15 pl-5'><p className='font-medium'>{item.name}</p><p className='mt-1 text-sm text-foreground/60'>{item.issuer}</p><div className='mt-2 flex items-center gap-3 text-xs text-foreground/45'><span>{item.date}</span>{item.url && <a href={item.url} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-1 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>Verify <ExternalLink size={11} /></a>}</div></div>)}</div></div></Reveal>}</div></section>}

      {selectedProjects.length > 0 && <section><Reveal><SectionHeading eyebrow='03 / Selected work' title='Projects worth a closer look.' /></Reveal><div className='grid gap-x-10 gap-y-8 md:grid-cols-2'>{selectedProjects.map((project, index) => <Reveal key={project.id} delay={index * 0.05}><Link href={`/projects/${project.id}`} className='group block border-t border-foreground/10 pt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'><div className='flex items-start justify-between gap-4'><h3 className='text-xl font-semibold tracking-tight transition-colors group-hover:text-primary'>{project.title}</h3><ArrowUpRight size={18} className='shrink-0 text-foreground/35 group-hover:text-primary' /></div><p className='mt-3 text-sm leading-6 text-foreground/60'>{project.description}</p><div className='mt-4 flex flex-wrap gap-x-3 gap-y-2 text-xs text-foreground/45'>{project.tech.slice(0, 5).map((tech) => <span key={tech}>{tech}</span>)}</div></Link></Reveal>)}</div></section>}

      <Reveal><section className='border-t border-primary/30 pt-8'><div className='flex flex-col justify-between gap-6 md:flex-row md:items-end'><div><p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary'>Let&apos;s talk</p><h2 className='mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl'>Interested in working together?</h2></div><Link href='/contact' className='inline-flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>Start a conversation <ArrowUpRight size={16} /></Link></div></section></Reveal>
    </div>
  </main></ErrorBoundary>;
}
