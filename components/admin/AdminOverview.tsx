"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, FolderKanban, Globe2, ImageIcon, Palette, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUserProfile } from "@/lib/profile";
import { getProjectsForCurrentUser } from "@/lib/projects";
import { getResumesForCurrentUser } from "@/lib/resumes";
import { getWorkExperiencesForCurrentUser } from "@/lib/work-experiences";
import { getGalleryImages } from "@/lib/profile";
import { AdminEmptyState, AdminErrorState, AdminSectionHeader, AdminStatusBadge } from "./AdminUI";

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: number | string; detail: string; icon: React.ElementType }) {
  return <div className='border-t border-foreground/15 pt-4'><div className='flex items-center justify-between gap-3'><p className='text-xs font-medium uppercase tracking-[0.16em] text-foreground/45'>{label}</p><Icon size={17} className='text-primary' /></div><p className='mt-3 text-3xl font-semibold tracking-tight'>{value}</p><p className='mt-1 text-xs text-foreground/50'>{detail}</p></div>;
}

export function AdminOverview({ onNavigate }: { onNavigate: (section: string) => void }) {
  const profileQuery = useQuery({ queryKey: ["currentUserProfile"], queryFn: getCurrentUserProfile });
  const projectsQuery = useQuery({ queryKey: ["user-projects"], queryFn: getProjectsForCurrentUser });
  const workQuery = useQuery({ queryKey: ["user-work-experiences"], queryFn: getWorkExperiencesForCurrentUser });
  const resumesQuery = useQuery({ queryKey: ["user-resumes"], queryFn: getResumesForCurrentUser });
  const galleryQuery = useQuery({ queryKey: ["galleryImages"], queryFn: getGalleryImages });

  const isLoading = [profileQuery, projectsQuery, workQuery, resumesQuery, galleryQuery].some((query) => query.isLoading);
  if (isLoading) return <div className='space-y-8'><AdminSectionHeader eyebrow='Workspace overview' title='Your portfolio at a glance' description='Loading your content and publication status.' /><div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>{[1, 2, 3, 4].map((item) => <div key={item} className='h-28 animate-pulse border-t border-foreground/10 bg-foreground/[0.03]' />)}</div></div>;
  const failedQuery = [profileQuery, projectsQuery, workQuery, resumesQuery, galleryQuery].find((query) => query.isError);
  if (failedQuery) return <div className='space-y-8'><AdminSectionHeader eyebrow='Workspace overview' title='Your portfolio at a glance' description='The overview could not load all workspace data.' /><AdminErrorState onRetry={() => { void Promise.all([profileQuery.refetch(), projectsQuery.refetch(), workQuery.refetch(), resumesQuery.refetch(), galleryQuery.refetch()]); }} label='Some workspace data could not be loaded.' /></div>;

  const profile = profileQuery.data;
  const projects = projectsQuery.data || [];
  const work = workQuery.data || [];
  const resumes = resumesQuery.data || [];
  const gallery = galleryQuery.data || [];
  const publishedProjects = projects.filter((project) => project.published).length;
  const activeResume = resumes.find((resume) => resume.role === profile?.active_resume_role);
  const hasIdentity = Boolean(profile?.full_name && profile?.tagline);
  const hasDomain = Boolean(profile?.domains?.length || profile?.domain);
  const hasHome = Boolean(profile?.home_page_data?.callToAction?.email);
  const readiness = [hasIdentity, hasDomain, hasHome, publishedProjects > 0].filter(Boolean).length;

  return <div className='space-y-10'><AdminSectionHeader eyebrow='Workspace overview' title={`Good to see you${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.`} description='A quick view of what is ready, what is published, and where to continue editing.' action={<Button onClick={() => onNavigate('profile')} variant='outline' className='gap-2'>Edit profile <ArrowRight size={15} /></Button>} />
    <div className='grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4'><StatCard label='Projects' value={projects.length} detail={`${publishedProjects} published`} icon={FolderKanban} /><StatCard label='Experience' value={work.length} detail={`${work.filter((item) => item.visible).length} visible publicly`} icon={BriefcaseBusiness} /><StatCard label='Resumes' value={resumes.length} detail={activeResume ? `${activeResume.title || activeResume.role} active` : 'No active resume'} icon={FileText} /><StatCard label='Gallery' value={gallery.length} detail='Uploaded media assets' icon={ImageIcon} /></div>
    <div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'>
      <section className='border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8'><div className='flex items-start justify-between gap-4'><div><p className='text-xs font-semibold uppercase tracking-[0.2em] text-primary'>Public readiness</p><h3 className='mt-2 text-2xl font-semibold tracking-tight'>{readiness}/4 essentials ready</h3></div><AdminStatusBadge status={readiness === 4 ? 'success' : 'warning'}>{readiness === 4 ? 'Ready to share' : 'Needs attention'}</AdminStatusBadge></div><div className='mt-7 h-2 overflow-hidden rounded-full bg-foreground/10'><div className='h-full rounded-full bg-primary transition-all' style={{ width: `${(readiness / 4) * 100}%` }} /></div><div className='mt-7 grid gap-4 sm:grid-cols-2'>{[{label:'Identity', ready:hasIdentity, section:'profile', icon:UserRound},{label:'Domain', ready:hasDomain, section:'profile', icon:Globe2},{label:'Contact CTA', ready:hasHome, section:'home', icon:Palette},{label:'Published work', ready:publishedProjects > 0, section:'projects', icon:FolderKanban}].map(({label, ready, section, icon: Icon}) => <button key={label} onClick={() => onNavigate(section)} className='flex items-center gap-3 border-t border-foreground/10 pt-3 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'><Icon size={16} className={ready ? 'text-emerald-500' : 'text-foreground/40'} /><span className='flex-1 text-sm'>{label}</span>{ready ? <CheckCircle2 size={15} className='text-emerald-500' /> : <ArrowRight size={15} className='text-foreground/35' />}</button>)}</div></section>
      <section className='border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8'><p className='text-xs font-semibold uppercase tracking-[0.2em] text-primary'>Continue editing</p><h3 className='mt-2 text-2xl font-semibold tracking-tight'>Quick actions</h3><div className='mt-6 divide-y divide-foreground/10'>{[{label:'Update profile & domain', detail:'Identity, contact, and media', section:'profile'},{label:'Shape the home page', detail:'Hero, expertise, and proof', section:'home'},{label:'Add a project', detail:'Build your selected work', section:'projects'},{label:'Manage resume versions', detail:'Set the active public resume', section:'resumes'}].map((action) => <button key={action.section} onClick={() => onNavigate(action.section)} className='flex w-full items-center gap-4 py-4 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'><span className='flex-1'><span className='block text-sm font-medium'>{action.label}</span><span className='mt-1 block text-xs text-foreground/45'>{action.detail}</span></span><ArrowRight size={16} className='text-foreground/35' /></button>)}</div></section>
    </div>
    {projects.length === 0 && <AdminEmptyState title='Your portfolio is ready for its first project.' description='Add a published project to make the Projects page useful to visitors.' action={<Button onClick={() => onNavigate('projects')} className='gap-2'>Add a project <ArrowRight size={15} /></Button>} />}
  </div>;
}
