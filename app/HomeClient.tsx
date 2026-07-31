"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Contact,
  ExternalLink,
  Github,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { generateStructuredData, serializeJsonLd } from "@/lib/seo";
import { getDynamicIcon } from "@/lib/icons";
import { generateVCard, downloadVCard } from "@/lib/vcard";
import type { HomePageData, Profile, Project, WorkExperience } from "@/types/portfolio";

type HomeData = HomePageData & {
  about_card_description?: string;
  about_subtitle?: string;
  projects_card_description?: string;
  experience_card_description?: string;
  availability_status?: { show: boolean; message: string };
};

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reducedMotion ? 0 : 0.55, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className='mb-10 max-w-2xl'>
      <p className='mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary'>
        {eyebrow}
      </p>
      <h2 className='text-3xl font-semibold tracking-tight text-foreground md:text-5xl'>
        {title}
      </h2>
      {description && (
        <p className='mt-4 max-w-xl text-base leading-7 text-foreground/60 md:text-lg'>
          {description}
        </p>
      )}
    </div>
  );
}

function HomeHero({
  profile,
  data,
  socialLinks,
  onSaveContact,
}: {
  profile: Profile;
  data: HomeData;
  socialLinks: HomeData["socialLinks"];
  onSaveContact: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const intro =
    data.about_card_description ||
    "I help ambitious teams turn complex ideas into clear, useful digital experiences.";

  return (
    <section className='relative isolate overflow-hidden border-b border-foreground/10'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 -z-10 opacity-70'
      >
        <div className='absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-primary/10 blur-[120px]' />
        <div className='absolute bottom-[8%] right-[4%] h-96 w-96 rounded-full bg-secondary/10 blur-[140px]' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]' />
      </div>

      <div className='mx-auto grid min-h-[min(860px,calc(100svh-2rem))] max-w-7xl items-center gap-14 px-6 pb-20 pt-32 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-20 lg:pb-24 lg:pt-36'>
        <div className='max-w-3xl'>
          {data.availability_status?.show && (
            <Reveal>
              <div className='mb-8 inline-flex items-center gap-2 border-b border-primary/30 pb-2 text-sm font-medium text-foreground/70'>
                <span className='relative flex h-2.5 w-2.5'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60' />
                  <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-primary' />
                </span>
                {data.availability_status.message}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.05}>
            <p className='mb-5 text-sm font-medium uppercase tracking-[0.24em] text-foreground/45'>
              Independent digital builder
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className='max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-foreground sm:text-6xl md:text-7xl lg:text-8xl'>
              {data.name}
              <span className='mt-5 block max-w-2xl text-2xl font-light leading-tight tracking-[-0.03em] text-foreground/65 sm:text-3xl md:text-4xl'>
                {data.tagline}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className='mt-8 max-w-xl text-lg leading-8 text-foreground/65 md:text-xl'>
              {intro}
            </p>
          </Reveal>

          <Reveal delay={0.22}>
            <div className='mt-10 flex flex-wrap items-center gap-3'>
              <Button
                asChild
                size='lg'
                className='h-12 rounded-full px-7 text-base shadow-[0_0_30px_hsl(var(--primary)/0.18)]'
              >
                <Link href='/contact'>
                  Start a Project <ArrowUpRight size={18} />
                </Link>
              </Button>
              <Button
                asChild
                variant='outline'
                size='lg'
                className='h-12 rounded-full border-foreground/20 bg-transparent px-7 text-base hover:border-primary/50 hover:bg-primary/5'
              >
                <Link href='/projects'>
                  View Selected Work <ArrowRight size={18} />
                </Link>
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onSaveContact}
                className='h-12 w-12 rounded-full border border-foreground/10 text-foreground/65 hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                aria-label='Save contact'
                title='Save contact'
              >
                <Contact size={19} />
              </Button>
            </div>
          </Reveal>

          {socialLinks.length > 0 && (
            <Reveal delay={0.28}>
              <div className='mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-foreground/50'>
                {socialLinks.slice(0, 4).map((social) => {
                  const Icon = getDynamicIcon(social.icon);
                  if (!Icon) return null;

                  return (
                    <a
                      key={`${social.platform}-${social.href}`}
                      href={social.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background'
                    >
                      <Icon className='h-4 w-4' aria-hidden='true' />
                      {social.display_label || social.platform}
                    </a>
                  );
                })}
              </div>
            </Reveal>
          )}
        </div>

        <Reveal className='relative mx-auto w-full max-w-[460px] lg:ml-auto' delay={0.12}>
          <motion.div
            initial={{ rotate: reducedMotion ? 0 : 2, y: reducedMotion ? 0 : 8 }}
            animate={{ rotate: 0, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
            className='relative'
          >
            <div className='absolute -inset-4 rounded-[2.25rem] border border-primary/20' />
            <div className='absolute -bottom-5 -left-5 h-28 w-28 rounded-full border border-primary/30 bg-primary/5 blur-[1px]' />
            <div className='absolute -right-4 top-10 h-20 w-20 rounded-full border border-secondary/30' />
            <div className='relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-foreground/15 bg-background/35 shadow-2xl shadow-black/30'>
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={`${data.name} portrait`}
                  fill
                  priority
                  sizes='(max-width: 1024px) 80vw, 460px'
                  className='object-cover'
                  style={{
                    objectPosition: `${profile.avatar_position?.x ?? 50}% ${profile.avatar_position?.y ?? 50}%`,
                    transform: `scale(${(profile.avatar_zoom ?? 100) / 100})`,
                    transformOrigin: `${profile.avatar_position?.x ?? 50}% ${profile.avatar_position?.y ?? 50}%`,
                  }}
                />
              ) : (
                <div className='flex h-full items-end bg-gradient-to-br from-primary/20 via-background/50 to-secondary/20 p-8'>
                  <p className='max-w-xs text-3xl font-medium tracking-tight text-foreground/80'>
                    Thoughtful products. Useful technology.
                  </p>
                </div>
              )}
              <div className='absolute inset-0 bg-gradient-to-t from-background/65 via-transparent to-transparent' />
              <div className='absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-sm'>
                <span className='max-w-[14rem] text-foreground/75'>
                  Strategy, design, and engineering in one thoughtful process.
                </span>
                <span className='text-primary'>01 / 04</span>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

function HomeProofStrip({
  data,
  currentWork,
  projectCount,
}: {
  data: HomeData;
  currentWork: WorkExperience | null;
  projectCount: number;
}) {
  const proof = data.experienceHighlights.slice(0, 3);
  const fallbackProof = [
    { metric: projectCount > 0 ? `${projectCount}+` : "—", title: "Published projects", subtitle: "Selected work", description: "" },
    { metric: data.technicalExpertise.length > 0 ? `${data.technicalExpertise.length}+` : "—", title: "Capability areas", subtitle: "Technical breadth", description: "" },
  ];

  return (
    <section className='border-b border-foreground/10'>
      <div className='mx-auto grid max-w-7xl gap-8 px-6 py-8 md:grid-cols-[1.15fr_1fr_1fr_1fr] md:items-center md:gap-0'>
        <div className='flex items-start gap-3 md:border-r md:border-foreground/10 md:pr-8'>
          <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-primary' />
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45'>
              Current focus
            </p>
            <p className='mt-1 font-medium text-foreground/80'>
              {currentWork?.position || "Building what matters next"}
            </p>
            {currentWork?.company && (
              <p className='text-sm text-foreground/50'>{currentWork.company}</p>
            )}
          </div>
        </div>

        {(proof.length > 0 ? proof : fallbackProof).map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className='md:border-r md:border-foreground/10 md:px-8 last:border-0'
          >
            <p className='text-2xl font-semibold tracking-tight text-primary'>
              {item.metric}
            </p>
            <p className='mt-1 text-sm font-medium text-foreground/75'>{item.title}</p>
            <p className='mt-1 text-xs uppercase tracking-[0.15em] text-foreground/40'>
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SelectedWork({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <section className='mx-auto max-w-7xl px-6'>
        <div className='border-y border-foreground/10 py-16'>
          <SectionIntro
            eyebrow='Selected work'
            title='The next case study starts here.'
            description='Explore the projects page for the latest work and experiments.'
          />
          <Button asChild variant='outline' className='rounded-full border-foreground/20'>
            <Link href='/projects'>Explore Projects <ArrowRight size={16} /></Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id='selected-work' className='mx-auto max-w-7xl px-6'>
      <Reveal>
        <SectionIntro
          eyebrow='Selected work'
          title='A few things I have helped bring to life.'
          description='A curated selection of projects where clarity, craft, and measurable usefulness meet.'
        />
      </Reveal>

      <div className='grid gap-6 md:grid-cols-2'>
        {projects.map((project, index) => {
          const isLead = index === 0;

          return (
            <Reveal key={project.id} delay={index * 0.06} className={isLead ? 'md:col-span-2' : ''}>
              <article className={`group overflow-hidden border border-foreground/10 bg-background/25 ${isLead ? 'grid rounded-[2rem] lg:grid-cols-[1.15fr_0.85fr]' : 'rounded-[1.5rem]'}`}>
                <Link
                  href={`/projects/${project.id}`}
                  className={`relative block overflow-hidden ${isLead ? 'min-h-[300px] lg:min-h-[430px]' : 'aspect-[4/3]'}`}
                  aria-label={`View ${project.title} project`}
                >
                  <Image
                    src={project.image || '/placeholder.svg'}
                    alt={project.title}
                    fill
                    priority={index === 0}
                    sizes={isLead ? '(max-width: 1024px) 100vw, 58vw' : '(max-width: 768px) 100vw, 50vw'}
                    className='object-cover transition duration-700 group-hover:scale-105'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent' />
                  {project.featured && (
                    <span className='absolute left-5 top-5 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md'>
                      Featured
                    </span>
                  )}
                  <span className='absolute bottom-5 left-5 text-sm font-medium text-white/85'>
                    0{index + 1}
                  </span>
                </Link>

                <div className='flex flex-col justify-between p-6 md:p-8 lg:p-10'>
                  <div>
                    <div className='mb-5 flex items-start justify-between gap-4'>
                      <h3 className='text-2xl font-semibold tracking-tight text-foreground md:text-3xl'>
                        {project.title}
                      </h3>
                      <ArrowUpRight className='mt-1 h-5 w-5 shrink-0 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1' />
                    </div>
                    <p className='leading-7 text-foreground/60'>
                      {project.description}
                    </p>
                  </div>

                  <div className='mt-8'>
                    <div className='mb-6 flex flex-wrap gap-2'>
                      {project.tech.slice(0, 5).map((tech) => (
                        <span key={tech} className='border-b border-foreground/15 pb-1 text-xs text-foreground/50'>
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className='flex flex-wrap items-center gap-3'>
                      <Button asChild size='sm' className='rounded-full'>
                        <Link href={`/projects/${project.id}`}>View Case Study <ArrowRight size={15} /></Link>
                      </Button>
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1 text-sm text-foreground/55 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background'
                        >
                          Live demo <ExternalLink size={14} />
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1 text-sm text-foreground/55 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background'
                        >
                          Source <Github size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <div className='mt-8 flex justify-end'>
        <Button asChild variant='link' className='group px-0 text-foreground/65 hover:text-primary'>
          <Link href='/projects'>View all projects <ArrowRight className='transition-transform group-hover:translate-x-1' size={16} /></Link>
        </Button>
      </div>
    </section>
  );
}

function CapabilitiesSection({ data }: { data: HomeData }) {
  if (data.technicalExpertise.length === 0) return null;

  return (
    <section className='mx-auto max-w-7xl px-6'>
      <Reveal>
        <SectionIntro
          eyebrow='Capabilities'
          title='A practical mix of strategy, design, and engineering.'
          description='The tools change from project to project. The focus stays on making the outcome clearer, more useful, and easier to grow.'
        />
      </Reveal>
      <div className='grid gap-x-8 gap-y-10 border-t border-foreground/10 pt-8 sm:grid-cols-2 lg:grid-cols-4'>
        {data.technicalExpertise.map((category, index) => (
          <Reveal key={category.name} delay={index * 0.05}>
            <div className='border-l border-primary/40 pl-5'>
              <div className='mb-4 flex items-center gap-2 text-primary'>
                <Sparkles size={15} />
                <h3 className='text-sm font-semibold uppercase tracking-[0.16em]'>{category.name}</h3>
              </div>
              <div className='flex flex-wrap gap-x-3 gap-y-2'>
                {category.skills.map((skill) => (
                  <span key={skill} className='text-sm text-foreground/60'>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function AboutTeaser({ data }: { data: HomeData }) {
  return (
    <section className='mx-auto max-w-7xl px-6'>
      <Reveal>
        <div className='grid overflow-hidden rounded-[2rem] border border-foreground/10 bg-gradient-to-br from-primary/10 via-background/30 to-secondary/10 lg:grid-cols-[0.8fr_1.2fr]'>
          <div className='border-b border-foreground/10 p-8 md:p-12 lg:border-b-0 lg:border-r'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>
              A little context
            </p>
            <h2 className='mt-5 text-3xl font-semibold tracking-tight md:text-4xl'>
              Good work starts with understanding the problem.
            </h2>
          </div>
          <div className='flex flex-col justify-between p-8 md:p-12'>
            <p className='max-w-2xl text-lg leading-8 text-foreground/65'>
              {data.about_card_description || data.about_subtitle || "I care about the details that make a digital experience feel simple, confident, and genuinely useful."}
            </p>
            <div className='mt-8'>
              <Button asChild variant='outline' className='rounded-full border-foreground/20'>
                <Link href='/about'>More about my approach <ArrowUpRight size={16} /></Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function AchievementsRow({ data }: { data: HomeData }) {
  if (data.achievements.length === 0) return null;

  return (
    <section className='mx-auto max-w-7xl px-6'>
      <Reveal>
        <div className='border-y border-foreground/10 py-8'>
          <div className='mb-7 flex items-center gap-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>
              Proof points
            </p>
            <div className='h-px flex-1 bg-foreground/10' />
          </div>
          <div className='grid gap-6 md:grid-cols-3'>
            {data.achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.title} className='flex gap-4'>
                <p className='min-w-16 text-2xl font-semibold tracking-tight text-primary'>
                  {achievement.metric}
                </p>
                <div>
                  <h3 className='font-medium text-foreground/80'>{achievement.title}</h3>
                  <p className='mt-1 text-sm leading-6 text-foreground/50'>{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function HomeCTA({ data }: { data: HomeData }) {
  return (
    <section className='mx-auto max-w-7xl px-6 pb-20'>
      <Reveal>
        <div className='relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/10 px-8 py-14 text-center md:px-16 md:py-20'>
          <div aria-hidden='true' className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_55%)]' />
          <div className='relative mx-auto max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>
              Let&apos;s make something useful
            </p>
            <h2 className='mt-5 text-4xl font-semibold tracking-tight md:text-6xl'>
              {data.callToAction.title || "Have a project in mind?"}
            </h2>
            <p className='mx-auto mt-5 max-w-xl text-lg leading-8 text-foreground/65'>
              {data.callToAction.description || "Tell me what you are working on and where you want to take it."}
            </p>
            <div className='mt-9 flex flex-wrap justify-center gap-3'>
              <Button asChild size='lg' className='h-12 rounded-full px-7'>
                <Link href='/contact'>Start a Project <ArrowUpRight size={18} /></Link>
              </Button>
              {data.callToAction.email && (
                <Button asChild variant='outline' size='lg' className='h-12 rounded-full border-foreground/20 bg-transparent px-7'>
                  <a href={`mailto:${data.callToAction.email}`}>Email Me <ArrowRight size={17} /></a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function HomeClient({
  initialProfile,
  initialProjects,
  initialWork,
  hostname,
}: {
  initialProfile: Profile;
  initialProjects: Project[];
  initialWork: WorkExperience | null;
  hostname: string;
}) {
  const profileData = initialProfile;
  const structuredData = generateStructuredData(profileData, hostname);

  const homePageData = useMemo<HomeData>(() => {
    const raw = profileData.home_page_data;

    return {
      name: profileData.full_name || "Welcome",
      tagline: profileData.tagline || "My Portfolio",
      socialLinks: raw?.socialLinks || [],
      experienceHighlights: raw?.experienceHighlights || [],
      technicalExpertise: raw?.technicalExpertise || [],
      achievements: raw?.achievements || [],
      about_card_description: raw?.about_card_description,
      about_subtitle: profileData.about_page_data?.subtitle,
      projects_card_description: raw?.projects_card_description,
      experience_card_description: raw?.experience_card_description,
      availability_status: raw?.availability_status || {
        show: true,
        message: "Available for opportunities",
      },
      callToAction: raw?.callToAction || {
        title: "Have a project in mind?",
        description: "Tell me what you are working on and where you want to take it.",
        email: "",
      },
    };
  }, [profileData]);

  const selectedProjects = useMemo(() => {
    const featured = initialProjects.filter((project) => project.featured);
    const remaining = initialProjects.filter((project) => !project.featured);
    return [...featured, ...remaining].slice(0, 3);
  }, [initialProjects]);

  const handleSaveContact = () => {
    const vcard = generateVCard({
      fullName: homePageData.name,
      email: homePageData.callToAction.email,
      phone: profileData.contact_numbers?.[0]?.number,
      url: `https://${hostname}`,
      photo: profileData.avatar_url || undefined,
    });

    downloadVCard(vcard, `${homePageData.name.replace(/\s+/g, "_")}_contact.vcf`);
  };

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  return (
    <ErrorBoundary>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData.person) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData.website) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData.profilePage) }} />

      <main className='relative overflow-hidden'>
        <HomeHero
          profile={profileData}
          data={homePageData}
          socialLinks={homePageData.socialLinks}
          onSaveContact={handleSaveContact}
        />
        <div id='main-content' className='space-y-24 py-16 md:space-y-32 md:py-24'>
          <HomeProofStrip
            data={homePageData}
            currentWork={initialWork}
            projectCount={initialProjects.length}
          />
          <SelectedWork projects={selectedProjects} />
          <CapabilitiesSection data={homePageData} />
          <AboutTeaser data={homePageData} />
          <AchievementsRow data={homePageData} />
          <HomeCTA data={homePageData} />
        </div>
      </main>
    </ErrorBoundary>
  );
}
