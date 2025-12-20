"use client";
import Link from "next/link";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { ContactNumbersDisplay } from "@/components/ContactNumbersDisplay";
import { getProjects } from "@/lib/projects"; // Import getProjects
import { getCurrentWork } from "@/lib/work-experiences";
import Image from "next/image";
import { formatDateRange, getEffectiveDomain } from "@/lib/utils";
import { generateStructuredData } from "@/lib/seo";
import { HomePageData } from "@/types/portfolio";

import { getDynamicIcon } from "@/lib/icons";

const HomePageSkeleton = () => (
  <div className='min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto'>
    <div className='text-center mb-16'>
      <Skeleton className='h-20 w-3/4 mx-auto mb-6' />
      <Skeleton className='h-8 w-full max-w-3xl mx-auto mb-8' />
      <div className='flex justify-center gap-4'>
        <Skeleton className='h-12 w-40' />
        <Skeleton className='h-12 w-40' />
      </div>
    </div>
    <div className='grid md:grid-cols-2 gap-8 mb-16'>
      <Skeleton className='h-40 w-full' />
      <Skeleton className='h-40 w-full' />
    </div>
  </div>
);

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
      }, // This fetches all published projects
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
  const otherProjectsForDisplay = allPublishedProjects
    ?.filter((p) => p.id !== featuredProject?.id)
    .slice(0, 2); // Get up to 2 other projects

  const structuredData = generateStructuredData(profileData, hostname);

  return (
    <>
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
      <div className='min-h-screen relative pt-24 md:pt-40 pb-32 md:pb-12 px-6'>
        <div className='max-w-6xl mx-auto'>
          {/* Hero Section */}
          <div className='text-center mb-16'>
            <AnimatedSection direction='up' delay={0.2}>
              <h1 className='text-4xl spa sm:text-6xl md:text-8xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight md:leading-[1.1]'>
                {homePageData.name}
              </h1>
              <p className='text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto'>
                {homePageData.tagline}
              </p>
            </AnimatedSection>

            <AnimatedSection
              direction='up'
              delay={0.3}
              className='flex flex-wrap justify-center gap-4 mb-12'
            >
              <Button
                asChild
                size='lg'
                className='bg-primary hover:bg-primary/90 text-primary-foreground'
              >
                <Link href={`/projects`}>
                  View Projects <ArrowRight className='ml-2' size={20} />
                </Link>
              </Button>
              <Button
                asChild
                variant='outline'
                size='lg'
                className='border-glass-border/50 hover:border-primary/50'
              >
                <Link href={`/resume`}>Download Resume</Link>
              </Button>
            </AnimatedSection>
          </div>

          {/* Current Role (if any) */}
          {currentWork && (
            <div className='mb-16'>
              <AnimatedSection direction='up' className='text-center mb-8'>
                <h2 className='text-3xl font-bold text-primary'>
                  Current Role
                </h2>
              </AnimatedSection>
              <div className='max-w-3xl mx-auto'>
                <GlassCard className='p-6'>
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
                    <div>
                      <div className='text-xl font-semibold'>
                        {currentWork.position}
                      </div>
                      <div className='text-foreground/70'>
                        {currentWork.company}
                        {currentWork.location
                          ? ` • ${currentWork.location}`
                          : ""}
                      </div>
                    </div>
                    <div className='text-sm text-foreground/60'>
                      {formatDateRange(
                        currentWork.start_date,
                        currentWork.end_date || undefined,
                        currentWork.is_current
                      )}
                    </div>
                  </div>
                  {currentWork.description?.length ? (
                    <ul className='mt-4 space-y-1 text-sm text-foreground/80 list-disc pl-5'>
                      {currentWork.description.slice(0, 3).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className='mt-4 text-right'>
                    <Button
                      asChild
                      variant='ghost'
                      size='sm'
                      className='text-primary hover:text-primary-glow'
                    >
                      <Link href='/resume'>View full resume</Link>
                    </Button>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* Experience Highlights */}
          <div className='mb-16'>
            <AnimatedSection direction='up' className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-secondary'>
                Experience Highlights
              </h2>
            </AnimatedSection>

            <div className='grid md:grid-cols-2 gap-8 mb-12'>
              {homePageData.experienceHighlights.map((highlight, index) => (
                <AnimatedSection
                  key={highlight.title}
                  direction={index === 0 ? "left" : "right"}
                  delay={0.2 + index * 0.1}
                >
                  <GlassCard className='p-6' hover>
                    <div className='flex items-center mb-4'>
                      <div
                        className={`w-12 h-12 ${
                          index === 0 ? "bg-primary/20" : "bg-secondary/20"
                        } rounded-full flex items-center justify-center mr-4`}
                      >
                        <span
                          className={`${
                            index === 0 ? "text-primary" : "text-secondary"
                          } font-bold text-xl`}
                        >
                          {highlight.metric}
                        </span>
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold'>
                          {highlight.title}
                        </h3>
                        <p className='text-foreground/60 text-sm'>
                          {highlight.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className='text-foreground/70 text-sm'>
                      {highlight.description}
                    </p>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* Dynamic Featured Work Preview */}
          {featuredProject && (
            <section className='mb-16'>
              <AnimatedSection direction='up' className='text-center mb-12'>
                <h2 className='text-3xl font-bold text-accent'>
                  Featured Work
                </h2>
              </AnimatedSection>

              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Featured Project (Left, twice the size) */}
                <AnimatedSection
                  direction='left'
                  delay={0.2}
                  className='lg:col-span-2'
                >
                  <GlassCard className='overflow-hidden group h-full' hover>
                    <div className='aspect-video bg-glass-bg/20 relative overflow-hidden'>
                      <Image
                        src={featuredProject.image || "/placeholder.svg"}
                        alt={featuredProject.title}
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                        width={800}
                        height={450}
                        priority
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                      <div className='absolute inset-0 bg-linear-to-t from-glass-bg/80 to-transparent' />
                    </div>
                    <div className='p-6'>
                      <h3 className='text-2xl font-bold mb-3 text-primary group-hover:text-primary-glow transition-colors duration-300'>
                        {featuredProject.title}
                      </h3>
                      <p className='text-foreground/80 mb-4'>
                        {featuredProject.description}
                      </p>
                      <div className='flex flex-wrap gap-2 mb-6'>
                        {featuredProject.tech.map((tech) => (
                          <span
                            key={tech}
                            className='px-3 py-1 text-sm rounded-full bg-primary/10 border border-primary/20 text-primary'
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className='flex space-x-3'>
                        <Button asChild size='sm' className='flex-1'>
                          <Link href={`/projects/${featuredProject.id}`}>
                            View Details
                          </Link>
                        </Button>
                        {featuredProject.demo_url && (
                          <Button asChild variant='outline' size='sm'>
                            <a
                              href={featuredProject.demo_url}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <ExternalLink size={16} />
                            </a>
                          </Button>
                        )}
                        {featuredProject.github_url && (
                          <Button asChild variant='outline' size='sm'>
                            <a
                              href={featuredProject.github_url}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Github size={16} />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </AnimatedSection>

                {/* Other Projects (Right, stacked) */}
                {otherProjectsForDisplay &&
                  otherProjectsForDisplay.length > 0 && (
                    <div className='lg:col-span-1 flex flex-col gap-6'>
                      {otherProjectsForDisplay.map((project, index) => (
                        <AnimatedSection
                          key={project.id}
                          direction='right'
                          delay={0.3 + index * 0.1}
                          className='flex-1'
                        >
                          <GlassCard className='p-6 h-full group' hover>
                            <h3 className='text-xl font-bold mb-3 text-foreground group-hover:text-secondary transition-colors duration-300'>
                              {project.title}
                            </h3>
                            <p className='text-foreground/70 mb-4 text-sm'>
                              {project.description}
                            </p>
                            <div className='flex flex-wrap gap-1 mb-4'>
                              {project.tech.slice(0, 3).map((tech) => (
                                <span
                                  key={tech}
                                  className='px-2 py-1 text-xs rounded bg-glass-bg/20 text-foreground/60'
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.tech.length > 3 && (
                                <span className='px-2 py-1 text-xs rounded bg-glass-bg/20 text-foreground/60'>
                                  +{project.tech.length - 3} more
                                </span>
                              )}
                            </div>
                            <Button
                              asChild
                              size='sm'
                              variant='ghost'
                              className='w-full'
                            >
                              <Link href={`/projects/${project.id}`}>
                                View Project
                              </Link>
                            </Button>
                          </GlassCard>
                        </AnimatedSection>
                      ))}
                    </div>
                  )}
              </div>
            </section>
          )}

          {/* Technical Expertise */}
          <div className='mb-16'>
            <AnimatedSection direction='up' className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-primary'>
                Technical Expertise
              </h2>
            </AnimatedSection>

            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {homePageData.technicalExpertise.map((category, index) => (
                <AnimatedSection
                  key={category.name}
                  direction='up'
                  delay={0.2 + index * 0.1}
                >
                  <GlassCard className='p-6 text-center' hover>
                    <h3 className='text-xl font-semibold mb-4'>
                      {category.name}
                    </h3>
                    <div className='space-y-2'>
                      {category.skills.map((skill) => (
                        <div key={skill} className='text-sm text-foreground/70'>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className='grid md:grid-cols-3 gap-8 mb-16'>
            <AnimatedSection direction='left' delay={0.2}>
              <GlassCard className='p-8 h-full' hover>
                <h3 className='text-2xl font-bold mb-4 text-primary'>
                  About Me
                </h3>
                <p className='text-foreground/70 mb-6'>
                  {homePageData.about_card_description ||
                    "Passionate developer with 5+ years of experience creating modern web applications."}
                </p>
                <Button
                  asChild
                  variant='ghost'
                  className='text-primary hover:text-primary-glow'
                >
                  <Link href={`/about`}>
                    Learn More <ArrowRight className='ml-2' size={16} />
                  </Link>
                </Button>
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection direction='up' delay={0.3}>
              <GlassCard className='p-8 h-full' hover>
                <h3 className='text-2xl font-bold mb-4 text-secondary'>
                  Projects
                </h3>
                <p className='text-foreground/70 mb-6'>
                  Explore my latest work featuring modern technologies and
                  innovative solutions
                </p>
                <Button
                  asChild
                  variant='ghost'
                  className='text-secondary hover:text-secondary-glow'
                >
                  <Link href={`/projects`}>
                    View Portfolio <ArrowRight className='ml-2' size={16} />
                  </Link>
                </Button>
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection direction='right' delay={0.4}>
              <GlassCard className='p-8 h-full' hover>
                <h3 className='text-2xl font-bold mb-4 text-accent'>
                  Experience
                </h3>
                <p className='text-foreground/70 mb-6'>
                  Professional background and skills across multiple disciplines
                </p>
                <Button
                  asChild
                  variant='ghost'
                  className='text-accent hover:text-accent-foreground'
                >
                  <Link href={`/resume`}>
                    View Resume <ArrowRight className='ml-2' size={16} />
                  </Link>
                </Button>
              </GlassCard>
            </AnimatedSection>
          </div>

          {/* Achievements & Recognition */}
          {homePageData.achievements.length > 0 && (
            <div className='mb-16'>
              <AnimatedSection direction='up' className='text-center mb-12'>
                <h2 className='text-3xl font-bold text-secondary'>
                  Achievements & Recognition
                </h2>
              </AnimatedSection>

              <div className='grid md:grid-cols-3 gap-6'>
                {homePageData.achievements.map((achievement, index) => (
                  <AnimatedSection
                    key={achievement.title}
                    direction='up'
                    delay={0.2 + index * 0.1}
                    initialScale={0.9}
                  >
                    <GlassCard className='p-6 text-center' hover>
                      <div className='text-3xl font-bold text-primary mb-2'>
                        {achievement.metric}
                      </div>
                      <div className='text-sm text-foreground/60 mb-3'>
                        {achievement.label}
                      </div>
                      <h3 className='text-lg font-semibold mb-2'>
                        {achievement.title}
                      </h3>
                      <p className='text-foreground/70 text-sm'>
                        {achievement.description}
                      </p>
                    </GlassCard>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <AnimatedSection
            direction='up'
            delay={0.2}
            className='text-center mb-16'
          >
            <GlassCard className='p-12'>
              <h2 className='text-3xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent'>
                {homePageData.callToAction.title}
              </h2>
              <p className='text-xl text-foreground/80 mb-8 max-w-2xl mx-auto'>
                {homePageData.callToAction.description}
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button
                  asChild
                  size='lg'
                  className='bg-primary hover:bg-primary/90 text-primary-foreground'
                >
                  <a href={`mailto:${homePageData.callToAction.email}`}>
                    Start a Project
                  </a>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  size='lg'
                  className='border-secondary/50 hover:border-secondary text-secondary hover:text-secondary-glow'
                >
                  <Link href={`/about`}>Learn More About Me</Link>
                </Button>
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Contact Numbers & Social Links Combined */}
          <AnimatedSection direction='up' delay={0.2}>
            {profileData.contact_numbers &&
            profileData.contact_numbers.length > 0 ? (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>
                {/* Contact Numbers */}
                <div className='w-full'>
                  <ContactNumbersDisplay
                    contactNumbers={profileData.contact_numbers}
                  />
                </div>

                {/* Social Links */}
                <div className='w-full'>
                  <GlassCard className='p-6 w-full'>
                    <h3 className='text-xl font-semibold mb-6 text-center'>
                      Connect With Me
                    </h3>
                    <div className='flex flex-wrap justify-center gap-6'>
                      {homePageData.socialLinks.map((social, index) => {
                        const Icon = getDynamicIcon(social.icon);
                        if (!Icon) return null;
                        return (
                          <AnimatedSection
                            key={social.label}
                            direction='up'
                            delay={0.3 + index * 0.1}
                          >
                            <a
                              href={social.href}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='group relative p-4 rounded-full bg-glass-bg/20 border border-glass-border/30 hover:border-primary/50 transition-all duration-300 hover:scale-110 hover:shadow-glow block'
                              aria-label={social.label}
                            >
                              <Icon className='h-6 w-6 text-foreground/80 group-hover:text-primary transition-colors duration-300' />
                            </a>
                          </AnimatedSection>
                        );
                      })}
                    </div>
                  </GlassCard>
                </div>
              </div>
            ) : (
              /* Social Links Only */
              <div className='max-w-md mx-auto'>
                <GlassCard className='p-8'>
                  <h3 className='text-xl font-semibold mb-6 text-center'>
                    Connect With Me
                  </h3>
                  <div className='flex justify-center space-x-6'>
                    {homePageData.socialLinks.map((social, index) => {
                      const Icon = getDynamicIcon(social.icon);
                      if (!Icon) return null;
                      return (
                        <AnimatedSection
                          key={social.label}
                          direction='up'
                          delay={0.3 + index * 0.1}
                        >
                          <a
                            href={social.href}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='group relative p-4 rounded-full bg-glass-bg/20 border border-glass-border/30 hover:border-primary/50 transition-all duration-300 hover:scale-110 hover:shadow-glow block'
                            aria-label={social.label}
                          >
                            <Icon className='h-6 w-6 text-foreground/80 group-hover:text-primary transition-colors duration-300' />
                          </a>
                        </AnimatedSection>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </>
  );
}
