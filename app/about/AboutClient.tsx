"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Code, Mail } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { ContactNumbersDisplay } from "@/components/ContactNumbersDisplay";
import type { AboutPageData, Profile } from "@/types/portfolio";
import { getDynamicIcon } from "@/lib/icons";

function AboutReveal({
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

function AboutSectionIntro({
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
      <h2 className='text-3xl font-semibold tracking-tight md:text-5xl'>
        {title}
      </h2>
      {description && (
        <p className='mt-4 text-base leading-7 text-foreground/60 md:text-lg'>
          {description}
        </p>
      )}
    </div>
  );
}

function AboutHero({
  profile,
  data,
  contactEmail,
}: {
  profile: Profile;
  data: AboutPageData;
  contactEmail: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <section className='relative isolate overflow-hidden border-b border-foreground/10'>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute right-[10%] top-[8%] h-80 w-80 rounded-full bg-primary/10 blur-[130px]' />
        <div className='absolute bottom-0 left-[12%] h-64 w-64 rounded-full bg-secondary/10 blur-[120px]' />
      </div>

      <div className='mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:pb-28 lg:pt-40'>
        <AboutReveal className='relative mx-auto w-full max-w-[420px] lg:order-1 lg:ml-auto'>
          <motion.div
            initial={{ rotate: reducedMotion ? 0 : -2, y: reducedMotion ? 0 : 8 }}
            animate={{ rotate: 0, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
            className='relative'
          >
            <div className='absolute -inset-4 rounded-[2rem] border border-primary/20' />
            <div className='relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-foreground/15 bg-background/30 shadow-2xl shadow-black/30'>
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={`${profile.full_name || "Profile"} portrait`}
                  fill
                  priority
                  sizes='(max-width: 1024px) 80vw, 420px'
                  className='object-cover'
                  style={{
                    objectPosition: `${profile.avatar_position?.x ?? 50}% ${profile.avatar_position?.y ?? 50}%`,
                    transform: `scale(${(profile.avatar_zoom ?? 100) / 100})`,
                    transformOrigin: `${profile.avatar_position?.x ?? 50}% ${profile.avatar_position?.y ?? 50}%`,
                  }}
                />
              ) : (
                <div className='flex h-full items-end bg-gradient-to-br from-primary/20 via-background/50 to-secondary/20 p-8'>
                  <p className='text-3xl font-medium tracking-tight text-foreground/75'>
                    Curiosity, craft, and useful outcomes.
                  </p>
                </div>
              )}
              <div className='absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent' />
              <p className='absolute bottom-6 left-6 text-sm text-foreground/70'>
                A thoughtful approach to digital work.
              </p>
            </div>
          </motion.div>
        </AboutReveal>

        <div className='lg:order-2'>
          <AboutReveal>
            <p className='mb-6 text-sm font-medium uppercase tracking-[0.24em] text-foreground/45'>
              About the work
            </p>
          </AboutReveal>
          <AboutReveal delay={0.06}>
            <h1 className='max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] md:text-7xl'>
              {data.title}
            </h1>
          </AboutReveal>
          <AboutReveal delay={0.12}>
            <p className='mt-7 max-w-2xl text-2xl font-light leading-tight tracking-tight text-foreground/65 md:text-4xl'>
              {data.subtitle}
            </p>
          </AboutReveal>
          <AboutReveal delay={0.18}>
            <div className='mt-10 flex flex-wrap gap-3'>
              <Button asChild size='lg' className='h-12 rounded-full px-7'>
                <Link href='/contact'>Let&apos;s work together <ArrowUpRight size={18} /></Link>
              </Button>
              <Button asChild variant='outline' size='lg' className='h-12 rounded-full border-foreground/20 bg-transparent px-7'>
                <Link href='/projects'>See the work <ArrowRight size={17} /></Link>
              </Button>
            </div>
          </AboutReveal>
          {contactEmail && (
            <AboutReveal delay={0.24}>
              <a
                href={`mailto:${contactEmail}`}
                className='mt-8 inline-flex items-center gap-2 text-sm text-foreground/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background'
              >
                <Mail size={15} />
                {contactEmail}
              </a>
            </AboutReveal>
          )}
        </div>
      </div>
    </section>
  );
}

function StorySection({ data }: { data: AboutPageData }) {
  const story = data.story.filter((paragraph) => paragraph.trim());

  return (
    <section className='mx-auto max-w-7xl px-6'>
      <AboutReveal>
        <AboutSectionIntro
          eyebrow='The story'
          title='The thinking behind the work.'
          description='A little context on the path, principles, and curiosity that shape each project.'
        />
      </AboutReveal>

      {story.length > 0 ? (
        <div className='grid gap-10 border-t border-foreground/10 pt-8 md:grid-cols-2 md:gap-16'>
          {story.map((paragraph, index) => (
            <AboutReveal key={`${paragraph.slice(0, 24)}-${index}`} delay={index * 0.06}>
              <div className='flex gap-5'>
                <span className='pt-1 text-sm font-medium text-primary'>0{index + 1}</span>
                <p className={`text-lg leading-8 text-foreground/70 ${index === 0 ? 'md:text-xl md:leading-9' : ''}`}>
                  {paragraph}
                </p>
              </div>
            </AboutReveal>
          ))}
        </div>
      ) : (
        <div className='border-t border-foreground/10 pt-8'>
          <p className='max-w-2xl text-lg leading-8 text-foreground/60'>
            More of the story is coming soon. In the meantime, explore the selected work and capabilities below.
          </p>
        </div>
      )}
    </section>
  );
}

function SkillsSection({ data }: { data: AboutPageData }) {
  if (data.skills.length === 0) return null;

  return (
    <section className='mx-auto max-w-7xl px-6'>
      <AboutReveal>
        <AboutSectionIntro
          eyebrow='Ways of working'
          title='A flexible toolkit for meaningful digital products.'
          description='Capabilities are grouped by the kind of value they bring to a project, not just by the tools involved.'
        />
      </AboutReveal>

      <div className='grid gap-x-8 gap-y-10 border-t border-foreground/10 pt-8 sm:grid-cols-2 lg:grid-cols-3'>
        {data.skills.map((skillGroup, index) => {
          const IconComponent = skillGroup.icon ? getDynamicIcon(skillGroup.icon) : null;
          const Icon = IconComponent || Code;

          return (
            <AboutReveal key={`${skillGroup.category}-${index}`} delay={index * 0.05}>
              <div className='border-l border-primary/40 pl-5'>
                <div className='mb-5 flex items-center gap-3'>
                  <Icon className='h-5 w-5 text-primary' aria-hidden='true' />
                  <h3 className='text-lg font-semibold'>{skillGroup.category}</h3>
                </div>
                <div className='flex flex-wrap gap-x-3 gap-y-2'>
                  {skillGroup.items.map((skill) => (
                    <span key={skill} className='text-sm text-foreground/60'>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </AboutReveal>
          );
        })}
      </div>
    </section>
  );
}

function ContactSection({
  profile,
  data,
  contactEmail,
}: {
  profile: Profile;
  data: AboutPageData;
  contactEmail: string;
}) {
  const hasContactNumbers = Boolean(profile.contact_numbers?.length);

  return (
    <section className='mx-auto max-w-7xl px-6 pb-20'>
      <AboutReveal>
        <div className='relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/10 p-8 md:p-12 lg:p-16'>
          <div aria-hidden='true' className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_45%)]' />
          <div className={`relative grid gap-10 ${hasContactNumbers ? 'lg:grid-cols-[0.9fr_1.1fr] lg:items-center' : ''}`}>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>
                Keep in touch
              </p>
              <h2 className='mt-5 max-w-xl text-4xl font-semibold tracking-tight md:text-6xl'>
                {data.callToAction.title || "Let's make something useful."}
              </h2>
              <p className='mt-5 max-w-xl text-lg leading-8 text-foreground/65'>
                {data.callToAction.description || "Have an idea, challenge, or opportunity to discuss? I would love to hear about it."}
              </p>
              <div className='mt-8 flex flex-wrap gap-3'>
                <Button asChild size='lg' className='h-12 rounded-full px-7'>
                  <Link href='/contact'>Start a Conversation <ArrowUpRight size={18} /></Link>
                </Button>
                {contactEmail && (
                  <Button asChild variant='outline' size='lg' className='h-12 rounded-full border-foreground/20 bg-transparent px-7'>
                    <a href={`mailto:${contactEmail}`}>Email Me <Mail size={16} /></a>
                  </Button>
                )}
              </div>
            </div>

            {hasContactNumbers && profile.contact_numbers && (
              <ContactNumbersDisplay contactNumbers={profile.contact_numbers} />
            )}
          </div>
        </div>
      </AboutReveal>
    </section>
  );
}

const AboutClient = ({
  initialProfile,
}: {
  initialProfile: Profile | null;
  hostname: string;
}) => {
  if (!initialProfile) {
    return <DomainNotClaimed />;
  }

  const profileData = initialProfile;
  const aboutPageData: AboutPageData = profileData.about_page_data || {
    title: "About Me",
    subtitle: profileData.tagline || "My Journey",
    story: [],
    skills: [],
    callToAction: {
      title: "Get in Touch",
      description: "Let's connect!",
      email: profileData.home_page_data?.callToAction?.email || "",
    },
  };
  const contactEmail =
    profileData.home_page_data?.callToAction?.email ||
    aboutPageData.callToAction?.email ||
    "";

  return (
    <ErrorBoundary>
      <main className='relative overflow-hidden pb-8'>
        <AboutHero profile={profileData} data={aboutPageData} contactEmail={contactEmail} />
        <div className='space-y-24 py-16 md:space-y-32 md:py-24'>
          <StorySection data={aboutPageData} />
          <SkillsSection data={aboutPageData} />
          <ContactSection profile={profileData} data={aboutPageData} contactEmail={contactEmail} />
        </div>
      </main>
    </ErrorBoundary>
  );
};

export default AboutClient;
