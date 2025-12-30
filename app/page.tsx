"use client";
import Link from "next/link";
import Image from "next/image";
import {
  FaArrowRight as ArrowRight,
  FaBriefcase as Briefcase,
  FaAward as Award,
  FaBullseye as Target,
  FaGithub as Github,
} from "react-icons/fa6";
import { ExternalLink } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { useEffect, useState } from "react";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { ContactNumbersDisplay } from "@/components/ContactNumbersDisplay";
import { getProjects } from "@/lib/projects";
import { getCurrentWork } from "@/lib/work-experiences";
import { formatDateRange, getEffectiveDomain } from "@/lib/utils";
import { generateStructuredData } from "@/lib/seo";
import { HomePageData } from "@/types/portfolio";
import { getDynamicIcon } from "@/lib/icons";
import { SectionHeader } from "@/components/ui/section-header";
import { FeatureCard } from "@/components/ui/feature-card";
import { StatsCard } from "@/components/ui/stats-card";
import { ProjectCard } from "@/components/ui/project-card";
import { HomePageSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function Page() {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profileData", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve(null);
      return getProfileData(domain);
    },
    enabled: !!hostname,
  });

  const { data: allPublishedProjects, isLoading: isLoadingProjects } = useQuery(
    {
      queryKey: ["projects", hostname],
      queryFn: () => {
        const domain = getEffectiveDomain(hostname);
        if (!domain) return Promise.resolve([]);
        return getProjects(domain);
      },
      enabled: !!hostname && !!profileData,
    }
  );

  const { data: currentWork } = useQuery({
    queryKey: ["current-work", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve(undefined);
      return getCurrentWork(domain);
    },
    enabled: !!hostname && !!profileData,
  });

  const isLoading = isLoadingProfile || isLoadingProjects;

  if (isLoading || !hostname) {
    return <HomePageSkeleton />;
  }

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  // Use profile data with sensible defaults if home_page_data is missing
  const rawHomeData = profileData.home_page_data;
  const homePageData: HomePageData & { about_card_description?: string } = {
    name: profileData.full_name || "Welcome",
    tagline: profileData.tagline || "My Portfolio",
    socialLinks: rawHomeData?.socialLinks || [],
    experienceHighlights: rawHomeData?.experienceHighlights || [],
    technicalExpertise: rawHomeData?.technicalExpertise || [],
    achievements: rawHomeData?.achievements || [],
    about_card_description: (
      rawHomeData as { about_card_description?: string } | null
    )?.about_card_description,
    callToAction: rawHomeData?.callToAction || {
      title: "Get in Touch",
      description: "Let's connect!",
      email: "",
    },
  };

  const featuredProject = allPublishedProjects?.find((p) => p.featured);
  const featuredProjects =
    allPublishedProjects?.filter((p) => p.featured).slice(0, 2) || [];
  const structuredData = generateStructuredData(profileData, hostname);

  return (
    <ErrorBoundary>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.person),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.website),
        }}
      />
      <div className='min-h-screen relative'>
        {/* Hero Section with Background Image */}
        <section className='relative min-h-[80vh] flex items-center justify-center overflow-hidden'>
          {/* Background Image Container */}
          {profileData.background_image_url && (
            <div className='absolute inset-0'>
              <div
                className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                style={{
                  backgroundImage: `url('${profileData.background_image_url}')`,
                }}
              />
              {/* Gradient overlay for text readability */}
              <div className='absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background' />
            </div>
          )}

          {/* Hero Content */}
          <div className='relative z-10 max-w-5xl mx-auto px-6 text-center'>
            <AnimatedSection direction='up' delay={0.1}>
              <h1 className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight'>
                <span className='bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent'>
                  {homePageData.name}
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection direction='up' delay={0.2}>
              <p className='text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto font-light'>
                {homePageData.tagline}
              </p>
            </AnimatedSection>

            <AnimatedSection direction='up' delay={0.3}>
              <div className='flex flex-wrap justify-center gap-4'>
                <Button
                  asChild
                  size='lg'
                  className='bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-lg'
                >
                  <Link href='/projects'>
                    View Projects <ArrowRight className='ml-2' size={20} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  size='lg'
                  className='border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 px-8 py-6 text-lg rounded-lg'
                >
                  <Link href='/contact'>Get In Touch</Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>

          {/* Scroll indicator */}
          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce'>
            <div className='w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center'>
              <div className='w-1 h-3 bg-foreground/40 rounded-full mt-2 animate-pulse' />
            </div>
          </div>
        </section>

        {/* Main Content Container */}
        <div className='max-w-7xl mx-auto px-6 pb-20 space-y-32'>
          {/* Current Role */}
          {currentWork && (
            <section className='pt-20'>
              <AnimatedSection direction='up'>
                <div className='flex justify-center mb-12'>
                  <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium'>
                    <span className='w-2 h-2 rounded-full bg-primary animate-pulse' />
                    Currently Working
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction='up' delay={0.2}>
                <GlassCard
                  variant='bordered'
                  className='max-w-4xl mx-auto p-8 md:p-10'
                >
                  <div className='flex flex-col md:flex-row md:items-start justify-between gap-6'>
                    <div className='flex-1'>
                      <h3 className='text-2xl md:text-3xl font-bold mb-2'>
                        {currentWork.position}
                      </h3>
                      <div className='flex items-center gap-2 text-foreground/60 mb-6'>
                        <span className='font-medium'>
                          {currentWork.company}
                        </span>
                        {currentWork.location && (
                          <>
                            <span>·</span>
                            <span>{currentWork.location}</span>
                          </>
                        )}
                      </div>
                      {currentWork.description?.length ? (
                        <ul className='space-y-3 text-foreground/70'>
                          {currentWork.description.slice(0, 3).map((d, i) => (
                            <li key={i} className='flex items-start gap-3'>
                              <span className='text-primary mt-1'>→</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className='flex flex-col items-end gap-4'>
                      <span className='text-sm text-foreground/60 whitespace-nowrap'>
                        {formatDateRange(
                          currentWork.start_date,
                          currentWork.end_date || undefined,
                          currentWork.is_current
                        )}
                      </span>
                      <Button asChild variant='ghost' size='sm'>
                        <Link href='/resume'>View full resume →</Link>
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </AnimatedSection>
            </section>
          )}

          {/* Experience Highlights */}
          <section>
            <AnimatedSection direction='up'>
              <div className='text-center mb-16'>
                <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                  Experience Highlights
                </h2>
                <p className='text-foreground/60 text-lg'>
                  Key achievements and milestones
                </p>
              </div>
            </AnimatedSection>

            <div className='grid md:grid-cols-2 gap-6 max-w-5xl mx-auto'>
              {homePageData.experienceHighlights.map((highlight, index) => (
                <AnimatedSection
                  key={highlight.title}
                  direction='up'
                  delay={0.1 * index}
                >
                  <GlassCard variant='minimal' className='p-8' hover>
                    <div className='flex items-start gap-4 mb-4'>
                      <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0'>
                        <span className='text-primary font-bold text-xl'>
                          {highlight.metric}
                        </span>
                      </div>
                      <div>
                        <h3 className='text-xl font-semibold mb-1'>
                          {highlight.title}
                        </h3>
                        <p className='text-foreground/60 text-sm'>
                          {highlight.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className='text-foreground/70 leading-relaxed'>
                      {highlight.description}
                    </p>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </section>

          {/* Featured Work */}
          {featuredProject && (
            <section>
              <AnimatedSection direction='up'>
                <div className='text-center mb-16'>
                  <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                    Featured Work
                  </h2>
                  <p className='text-foreground/60 text-lg'>
                    Showcasing my best project
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection direction='up' delay={0.2}>
                <GlassCard
                  variant='bordered'
                  className='overflow-hidden max-w-6xl mx-auto group'
                >
                  <div className='grid lg:grid-cols-2'>
                    {/* Image Section */}
                    <div className='relative aspect-video lg:aspect-auto lg:min-h-[500px] overflow-hidden'>
                      <Image
                        src={featuredProject.image || "/placeholder.svg"}
                        alt={featuredProject.title}
                        fill
                        className='object-cover transition-transform duration-700 group-hover:scale-105'
                        sizes='(max-width: 1024px) 100vw, 50vw'
                        priority
                      />
                      <div className='absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold'>
                        Featured
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className='p-8 lg:p-12 flex flex-col justify-center'>
                      <h3 className='text-3xl font-bold mb-4'>
                        {featuredProject.title}
                      </h3>
                      <p className='text-foreground/70 mb-6 leading-relaxed'>
                        {featuredProject.description}
                      </p>

                      {/* Tech stack */}
                      <div className='flex flex-wrap gap-2 mb-8'>
                        {featuredProject.tech.slice(0, 6).map((tech) => (
                          <span
                            key={tech}
                            className='px-3 py-1 text-sm rounded-md bg-foreground/5 border border-foreground/10 text-foreground/80'
                          >
                            {tech}
                          </span>
                        ))}
                        {featuredProject.tech.length > 6 && (
                          <span className='px-3 py-1 text-sm text-foreground/60'>
                            +{featuredProject.tech.length - 6} more
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className='flex gap-3'>
                        <Button asChild className='flex-1'>
                          <Link href={`/projects/${featuredProject.id}`}>
                            View Project
                          </Link>
                        </Button>
                        {featuredProject.demo_url && (
                          <Button asChild variant='outline' size='icon'>
                            <a
                              href={featuredProject.demo_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              aria-label='View demo'
                            >
                              <ExternalLink size={18} />
                            </a>
                          </Button>
                        )}
                        {featuredProject.github_url && (
                          <Button asChild variant='outline' size='icon'>
                            <a
                              href={featuredProject.github_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              aria-label='View source'
                            >
                              <Github size={18} />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </AnimatedSection>
            </section>
          )}

          {/* Technical Expertise */}
          <section>
            <AnimatedSection direction='up'>
              <div className='text-center mb-16'>
                <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                  Technical Expertise
                </h2>
                <p className='text-foreground/60 text-lg'>
                  Core skills and technologies
                </p>
              </div>
            </AnimatedSection>

            <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'>
              {homePageData.technicalExpertise.map((category, index) => (
                <AnimatedSection
                  key={category.name}
                  direction='up'
                  delay={0.1 * index}
                >
                  <GlassCard variant='minimal' className='p-6' hover>
                    <h3 className='text-lg font-semibold mb-4 text-primary'>
                      {category.name}
                    </h3>
                    <ul className='space-y-2'>
                      {category.skills.map((skill) => (
                        <li
                          key={skill}
                          className='text-sm text-foreground/70 flex items-center gap-2'
                        >
                          <span className='w-1 h-1 rounded-full bg-foreground/30' />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </section>

          {/* Quick Access Cards */}
          <section>
            <div className='grid md:grid-cols-3 gap-6 max-w-6xl mx-auto'>
              <AnimatedSection direction='up' delay={0.1}>
                <GlassCard variant='minimal' className='p-8 h-full group' hover>
                  <h3 className='text-2xl font-bold mb-4'>About Me</h3>
                  <p className='text-foreground/70 mb-6 leading-relaxed'>
                    {homePageData.about_card_description ||
                      "Passionate developer with years of experience creating modern web applications."}
                  </p>
                  <Button
                    asChild
                    variant='ghost'
                    className='p-0 h-auto font-medium'
                  >
                    <Link href='/about'>
                      Learn More{" "}
                      <ArrowRight
                        className='ml-2 group-hover:translate-x-1 transition-transform'
                        size={16}
                      />
                    </Link>
                  </Button>
                </GlassCard>
              </AnimatedSection>

              <AnimatedSection direction='up' delay={0.2}>
                <GlassCard variant='minimal' className='p-8 h-full group' hover>
                  <h3 className='text-2xl font-bold mb-4'>Projects</h3>
                  <p className='text-foreground/70 mb-6 leading-relaxed'>
                    Explore my latest work featuring modern technologies and
                    innovative solutions
                  </p>
                  <Button
                    asChild
                    variant='ghost'
                    className='p-0 h-auto font-medium'
                  >
                    <Link href='/projects'>
                      View Portfolio{" "}
                      <ArrowRight
                        className='ml-2 group-hover:translate-x-1 transition-transform'
                        size={16}
                      />
                    </Link>
                  </Button>
                </GlassCard>
              </AnimatedSection>

              <AnimatedSection direction='up' delay={0.3}>
                <GlassCard variant='minimal' className='p-8 h-full group' hover>
                  <h3 className='text-2xl font-bold mb-4'>Experience</h3>
                  <p className='text-foreground/70 mb-6 leading-relaxed'>
                    Professional background and skills across multiple
                    disciplines
                  </p>
                  <Button
                    asChild
                    variant='ghost'
                    className='p-0 h-auto font-medium'
                  >
                    <Link href='/resume'>
                      View Resume{" "}
                      <ArrowRight
                        className='ml-2 group-hover:translate-x-1 transition-transform'
                        size={16}
                      />
                    </Link>
                  </Button>
                </GlassCard>
              </AnimatedSection>
            </div>
          </section>

          {/* Achievements & Recognition */}
          {homePageData.achievements.length > 0 && (
            <section>
              <AnimatedSection direction='up'>
                <div className='text-center mb-16'>
                  <h2 className='text-4xl md:text-5xl font-bold mb-4'>
                    Achievements & Recognition
                  </h2>
                  <p className='text-foreground/60 text-lg'>
                    Notable accomplishments
                  </p>
                </div>
              </AnimatedSection>

              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
                {homePageData.achievements.map((achievement, index) => (
                  <AnimatedSection
                    key={achievement.title}
                    direction='up'
                    delay={0.1 * index}
                  >
                    <GlassCard
                      variant='minimal'
                      className='p-8 text-center'
                      hover
                    >
                      <div className='text-5xl font-bold text-primary mb-4'>
                        {achievement.metric}
                      </div>
                      <div className='text-sm text-foreground/60 mb-4 uppercase tracking-wide font-medium'>
                        {achievement.label}
                      </div>
                      <h3 className='text-lg font-semibold mb-3'>
                        {achievement.title}
                      </h3>
                      <p className='text-foreground/70 text-sm leading-relaxed'>
                        {achievement.description}
                      </p>
                    </GlassCard>
                  </AnimatedSection>
                ))}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section>
            <AnimatedSection direction='up'>
              <GlassCard
                variant='bordered'
                className='p-12 md:p-16 text-center max-w-4xl mx-auto'
              >
                <h2 className='text-4xl md:text-5xl font-bold mb-6'>
                  {homePageData.callToAction.title}
                </h2>
                <p className='text-xl text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed'>
                  {homePageData.callToAction.description}
                </p>
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <Button asChild size='lg' className='px-8 py-6 text-lg'>
                    <a href={`mailto:${homePageData.callToAction.email}`}>
                      Start a Project
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant='outline'
                    size='lg'
                    className='px-8 py-6 text-lg'
                  >
                    <Link href='/about'>Learn More About Me</Link>
                  </Button>
                </div>
              </GlassCard>
            </AnimatedSection>
          </section>

          {/* Contact Numbers & Social Links */}
          <section>
            <AnimatedSection direction='up'>
              {profileData.contact_numbers &&
              profileData.contact_numbers.length > 0 ? (
                <div className='grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto'>
                  {/* Contact Numbers */}
                  <ContactNumbersDisplay
                    contactNumbers={profileData.contact_numbers}
                  />

                  {/* Social Links */}
                  <GlassCard variant='minimal' className='p-8'>
                    <h3 className='text-xl font-semibold mb-6 text-center'>
                      Connect With Me
                    </h3>
                    <div className='flex flex-wrap justify-center gap-4'>
                      {homePageData.socialLinks.map((social) => {
                        const Icon = getDynamicIcon(social.icon);
                        if (!Icon) return null;
                        return (
                          <a
                            key={social.label}
                            href={social.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='p-3 rounded-lg border border-foreground/10 hover:border-primary/30 hover:bg-foreground/5 transition-all'
                            aria-label={social.label}
                          >
                            <Icon className='h-5 w-5 text-foreground/70 hover:text-primary transition-colors' />
                          </a>
                        );
                      })}
                    </div>
                  </GlassCard>
                </div>
              ) : (
                /* Social Links Only */
                <div className='max-w-md mx-auto'>
                  <GlassCard variant='minimal' className='p-8'>
                    <h3 className='text-xl font-semibold mb-6 text-center'>
                      Connect With Me
                    </h3>
                    <div className='flex justify-center flex-wrap gap-4'>
                      {homePageData.socialLinks.map((social) => {
                        const Icon = getDynamicIcon(social.icon);
                        if (!Icon) return null;
                        return (
                          <a
                            key={social.label}
                            href={social.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='p-3 rounded-lg border border-foreground/10 hover:border-primary/30 hover:bg-foreground/5 transition-all'
                            aria-label={social.label}
                          >
                            <Icon className='h-5 w-5 text-foreground/70 hover:text-primary transition-colors' />
                          </a>
                        );
                      })}
                    </div>
                  </GlassCard>
                </div>
              )}
            </AnimatedSection>
          </section>
        </div>
      </div>
    </ErrorBoundary>
  );
}
