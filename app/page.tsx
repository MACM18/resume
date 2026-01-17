"use client";
import Link from "next/link";
import Image from "next/image";
import {
  FaArrowRight as ArrowRight,
  FaGithub as Github,
} from "react-icons/fa6";
import { ExternalLink, Contact } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { useEffect, useState, useRef } from "react";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { getProjects } from "@/lib/projects";
import { getCurrentWork } from "@/lib/work-experiences";
import { formatDateRange, getEffectiveDomain } from "@/lib/utils";
import { generateStructuredData } from "@/lib/seo";
import { HomePageData } from "@/types/portfolio";
import { getDynamicIcon } from "@/lib/icons";
import { generateVCard, downloadVCard } from "@/lib/vcard";
import { HomePageSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { motion, useScroll, useTransform } from "framer-motion";


export default function Page() {
  const [hostname, setHostname] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const parallaxRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  // avoid "Target ref is defined but not hydrated" warning from Framer Motion
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Assign the ref.current only after the element exists to avoid timing races
  useEffect(() => {
    if (!isHydrated) return;
    const el = document.getElementById("hero-section");
    if (el) {
      parallaxRef.current = el;
    }
  }, [isHydrated]);

  const { scrollYProgress } = useScroll({
    // Pass a RefObject when available (matches Motion's expected type)
    target: parallaxRef.current ? parallaxRef : undefined,
    offset: ["start start", "end start"],
  });

  // DRAMATIC parallax transforms - very noticeable layered depth effect
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.4]);
  // backgroundBlur unused - remove to avoid linter complaints
  // const backgroundBlur = useTransform(scrollYProgress, [0, 0.5, 1], [0, 2, 8]);

  // Individual element parallax - MUCH stronger speeds for obvious depth
  const badgeY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const badgeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const badgeScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const taglineY = useTransform(scrollYProgress, [0, 1], [0, 500]);
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const buttonsY = useTransform(scrollYProgress, [0, 1], [0, 600]);
  const buttonsOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const socialY = useTransform(scrollYProgress, [0, 1], [0, 700]);
  const socialOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Image moves OPPOSITE direction (up) for dramatic separation
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 0.75]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const imageRotate = useTransform(scrollYProgress, [0, 1], [0, -5]);

  const scrollIndicatorOpacity = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1, 0],
  );

  // Next section parallax - content rises up as hero fades
  const nextSectionY = useTransform(scrollYProgress, [0, 0.5, 1], [200, 50, 0]);
  const nextSectionOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6],
    [0.5, 0.8, 1],
  );
  const nextSectionScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.95, 0.98, 1],
  );

  // Interactive scroll indicator
  const scrollToContent = () => {
    const content = document.getElementById("main-content");
    content?.scrollIntoView({ behavior: "smooth" });
  };

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
    },
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
  const homePageData: HomePageData & {
    about_card_description?: string;
    projects_card_description?: string;
    experience_card_description?: string;
    availability_status?: { show: boolean; message: string };
  } = {
    name: profileData.full_name || "Welcome",
    tagline: profileData.tagline || "My Portfolio",
    socialLinks: rawHomeData?.socialLinks || [],
    experienceHighlights: rawHomeData?.experienceHighlights || [],
    technicalExpertise: rawHomeData?.technicalExpertise || [],
    achievements: rawHomeData?.achievements || [],
    about_card_description: rawHomeData?.about_card_description,
    projects_card_description: rawHomeData?.projects_card_description,
    experience_card_description: rawHomeData?.experience_card_description,
    availability_status: rawHomeData?.availability_status || {
      show: true,
      message: "Available for opportunities",
    },
    callToAction: rawHomeData?.callToAction || {
      title: "Get in Touch",
      description: "Let's connect!",
      email: "",
    },
  };

  const featuredProjects =
    allPublishedProjects?.filter((p) => p.featured) || [];
  const structuredData = generateStructuredData(profileData, hostname);

  // Handle vCard download
  const handleSaveContact = () => {
    const vcard = generateVCard({
      fullName: homePageData.name,
      email: homePageData.callToAction?.email,
      phone: profileData.contact_numbers?.[0]?.number,
      url: `https://${hostname}`,
      photo: profileData.avatar_url || undefined,
    });
    downloadVCard(
      vcard,
      `${homePageData.name.replace(/\s+/g, "_")}_contact.vcf`,
    );
  };

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
        {/* Hero Section - Full Screen with Parallax */}
        <section
          id='hero-section'
          ref={heroRef}
          className='relative h-screen flex items-center justify-center overflow-hidden'
        >
          {/* Background Image with Enhanced Parallax */}
          {profileData.background_image_url && (
            <motion.div
              className='absolute inset-0 will-change-transform'
              style={{ y: backgroundY, scale: backgroundScale }}
            >
              <div
                className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                style={{
                  backgroundImage: `url('${profileData.background_image_url}')`,
                }}
              />
              {/* Very subtle gradient overlays for better text visibility */}
              <div className='absolute inset-0 bg-linear-to-b from-background/50 via-background/30 to-background/80' />
              <div className='absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent' />
            </motion.div>
          )}

          {/* Hero Content with Individual Element Parallax */}
          <div className='relative z-10 max-w-6xl mx-auto px-6'>
            <div className='grid lg:grid-cols-2 gap-12 items-center'>
              {/* Text Content */}
              <div className='text-center lg:text-left'>
                {homePageData.availability_status?.show && (
                  <motion.div
                    className='will-change-transform'
                    style={{
                      y: badgeY,
                      opacity: badgeOpacity,
                      scale: badgeScale,
                    }}
                  >
                    <AnimatedSection direction='up' delay={0.1}>
                      <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-sm text-primary text-sm font-medium mb-8 shadow-sm'>
                        <span className='w-2 h-2 rounded-full bg-primary animate-pulse' />
                        {homePageData.availability_status.message}
                      </div>
                    </AnimatedSection>
                  </motion.div>
                )}

                <motion.div
                  className='will-change-transform'
                  style={{
                    y: titleY,
                    opacity: titleOpacity,
                    scale: titleScale,
                  }}
                >
                  <AnimatedSection direction='up' delay={0.2}>
                    <h1 className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight'>
                      <span className='bg-linear-to-br from-foreground to-foreground/80 bg-clip-text text-transparent drop-shadow-sm'>
                        {homePageData.name}
                      </span>
                    </h1>
                  </AnimatedSection>
                </motion.div>

                <motion.div
                  className='will-change-transform'
                  style={{ y: taglineY, opacity: taglineOpacity }}
                >
                  <AnimatedSection direction='up' delay={0.3}>
                    <p className='text-xl md:text-2xl text-foreground/80 mb-10 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed drop-shadow-sm'>
                      {homePageData.tagline}
                    </p>
                  </AnimatedSection>
                </motion.div>

                <motion.div
                  className='will-change-transform'
                  style={{ y: buttonsY, opacity: buttonsOpacity }}
                >
                  <AnimatedSection direction='up' delay={0.4}>
                    <div className='flex flex-wrap justify-center lg:justify-start gap-4 items-center'>
                      <Button
                        asChild
                        size='lg'
                        className='bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all'
                      >
                        <Link href='/resume'>
                          View Resume <ArrowRight className='ml-2' size={20} />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant='outline'
                        size='lg'
                        className='border-foreground/20 text-white hover:text-white hover:border-foreground/40 hover:bg-foreground/5 px-8 py-6 text-lg rounded-xl'
                      >
                        <Link href='/about'>About Me</Link>
                      </Button>
                      <Button
                        onClick={handleSaveContact}
                        variant='outline'
                        size='lg'
                        className='border-foreground/20 text-white hover:text-white hover:border-foreground/40 hover:bg-foreground/5 p-3 rounded-xl flex items-center justify-center'
                        title='Save Contact'
                      >
                        <Contact size={24} />
                      </Button>
                    </div>
                  </AnimatedSection>
                </motion.div>

                {/* Social Links in Hero */}
                {homePageData.socialLinks.length > 0 && (
                  <motion.div
                    className='will-change-transform'
                    style={{ y: socialY, opacity: socialOpacity }}
                  >
                    <AnimatedSection direction='up' delay={0.5}>
                      <div className='flex justify-center lg:justify-start gap-3 mt-10'>
                        {homePageData.socialLinks.slice(0, 4).map((social) => {
                          const Icon = getDynamicIcon(social.icon);
                          if (!Icon) return null;
                          return (
                            <a
                              key={social.label}
                              href={social.href}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='p-3 rounded-xl border border-foreground/10 hover:border-primary/30 hover:bg-foreground/5 transition-all group'
                              aria-label={social.label}
                            >
                              <Icon className='h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors' />
                            </a>
                          );
                        })}
                      </div>
                    </AnimatedSection>
                  </motion.div>
                )}
              </div>

              {/* Profile Image with Parallax */}
              {profileData.avatar_url && (
                <motion.div
                  className='hidden lg:block relative will-change-transform'
                  style={{
                    y: imageY,
                    scale: imageScale,
                    opacity: imageOpacity,
                    rotate: imageRotate,
                  }}
                >
                  <AnimatedSection direction='left' delay={0.3}>
                    <div className='relative w-80 h-80 xl:w-96 xl:h-96 mx-auto'>
                      {/* Decorative elements */}
                      <div className='absolute inset-0 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 blur-3xl' />
                      <div className='absolute -inset-4 rounded-full border border-foreground/5' />
                      <div className='absolute -inset-8 rounded-full border border-foreground/5' />

                      {/* Image */}
                      <div className='relative w-full h-full rounded-full overflow-hidden border-2 border-foreground/10'>
                        <Image
                          src={profileData.avatar_url}
                          alt={homePageData.name}
                          fill
                          className='object-cover'
                          fetchPriority='high'
                          style={{
                            objectPosition: `${
                              profileData.avatar_position?.x ?? 50
                            }% ${profileData.avatar_position?.y ?? 50}%`,
                            transform: `scale(${
                              (profileData.avatar_zoom ?? 100) / 100
                            })`,
                            transformOrigin: `${
                              profileData.avatar_position?.x ?? 50
                            }% ${profileData.avatar_position?.y ?? 50}%`,
                          }}
                          priority
                        />
                      </div>
                    </div>
                  </AnimatedSection>
                </motion.div>
              )}
            </div>
          </div>

          {/* Interactive Scroll Indicator */}
          <motion.button
            onClick={scrollToContent}
            className='absolute bottom-8 left-1/2 -translate-x-1/2 z-20 group cursor-pointer'
            style={{ opacity: scrollIndicatorOpacity }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className='flex flex-col items-center gap-2'>
              <span className='text-xs text-foreground/40 uppercase tracking-widest group-hover:text-foreground/60 transition-colors'>
                Scroll
              </span>
              <motion.div
                className='w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center group-hover:border-foreground/40 transition-colors'
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div
                  className='w-1 h-3 bg-foreground/40 rounded-full mt-2 group-hover:bg-foreground/60 transition-colors'
                  animate={{ y: [0, 4, 0], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </motion.button>
        </section>

        {/* Main Content Container with Parallax Rise */}
        <motion.div
          id='main-content'
          className='max-w-7xl mx-auto px-6 pb-20 space-y-24 relative z-20 will-change-transform'
          style={{
            y: nextSectionY,
            opacity: nextSectionOpacity,
            scale: nextSectionScale,
          }}
        >
          {/* Current Role - Compact */}
          {currentWork && (
            <section className='pt-12'>
              <AnimatedSection direction='up'>
                <GlassCard
                  variant='bordered'
                  className='max-w-4xl mx-auto p-6 md:p-8'
                >
                  <div className='flex flex-col md:flex-row md:items-center gap-6'>
                    {/* Status Badge */}
                    <div className='flex items-center gap-3'>
                      <div className='w-3 h-3 rounded-full bg-green-500 animate-pulse' />
                      <span className='text-sm font-medium text-foreground/60'>
                        Currently
                      </span>
                    </div>

                    {/* Role Info */}
                    <div className='flex-1'>
                      <h3 className='text-xl md:text-2xl font-bold'>
                        {currentWork.position}
                      </h3>
                      <p className='text-foreground/60'>
                        {currentWork.company}
                        {currentWork.location && ` · ${currentWork.location}`}
                      </p>
                    </div>

                    {/* Date & Link */}
                    <div className='flex items-center gap-4'>
                      <span className='text-sm text-foreground/50'>
                        {formatDateRange(
                          currentWork.start_date,
                          currentWork.end_date || undefined,
                          currentWork.is_current,
                        )}
                      </span>
                      <Button asChild variant='outline' size='sm'>
                        <Link href='/resume'>View Resume</Link>
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </AnimatedSection>
            </section>
          )}

          {/* Experience Highlights */}
          {homePageData.experienceHighlights.length > 0 && (
            <section>
              <AnimatedSection direction='up'>
                <div className='text-center mb-12'>
                  <h2 className='text-3xl md:text-4xl font-bold mb-3'>
                    Experience Highlights
                  </h2>
                  <p className='text-foreground/60'>
                    Key achievements and milestones
                  </p>
                </div>
              </AnimatedSection>

              {/* Adaptive grid: single item = centered, multiple = 2 cols */}
              <div
                className={`grid gap-6 mx-auto ${
                  homePageData.experienceHighlights.length === 1
                    ? "max-w-2xl"
                    : "md:grid-cols-2 max-w-5xl"
                }`}
              >
                {homePageData.experienceHighlights.map((highlight, index) => (
                  <AnimatedSection
                    key={highlight.title}
                    direction='up'
                    delay={0.1 * index}
                  >
                    <GlassCard
                      variant='minimal'
                      className={`p-8 h-full ${
                        homePageData.experienceHighlights.length === 1
                          ? "text-center"
                          : ""
                      }`}
                      hover
                    >
                      <div
                        className={`flex items-start gap-4 mb-4 ${
                          homePageData.experienceHighlights.length === 1
                            ? "flex-col items-center"
                            : ""
                        }`}
                      >
                        <div className='w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0'>
                          <span className='text-primary font-bold text-2xl'>
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
          )}

          {/* Featured Works */}
          {featuredProjects && (
            <section>
              <AnimatedSection direction='up'>
                <div className='text-center mb-12'>
                  <h2 className='text-3xl md:text-4xl font-bold mb-3'>
                    Featured Work
                  </h2>
                  <p className='text-foreground/60'>
                    Showcasing my best project
                  </p>
                </div>
              </AnimatedSection>
              <div className='grid gap-12 grid-cols-1 md:grid-cols-2 mx-auto'>
                {featuredProjects.map((featuredProject, index) => (
                  <AnimatedSection key={index} direction='up' delay={0.2}>
                    <GlassCard
                      variant='bordered'
                      className='overflow-hidden mx-auto group relative'
                    >
                      <div className='relative'>
                        {/* Image Section - full width visual */}
                        <div className='relative aspect-video lg:aspect-auto lg:min-h-100 overflow-hidden'>
                          <Image
                            src={featuredProject.image || "/placeholder.svg"}
                            alt={featuredProject.title}
                            fill
                            className='object-cover transition-all duration-700 group-hover:brightness-90'
                            sizes='(max-width: 1024px) 100vw, 50vw'
                            priority
                          />
                          <div className='absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold z-30'>
                            Featured
                          </div>

                          {/* Floating title over image (visible on lg and up) */}
                          <h3 className='hidden lg:block absolute left-6 bottom-6 z-30 text-3xl font-bold text-white drop-shadow-lg bg-linear-to-r from-black/40 via-transparent to-transparent px-4 py-2 rounded-md'>
                            {featuredProject.title}
                          </h3>
                        </div>

                        {/* Content Panel - hidden by default on lg, slides in to cover right half on hover */}
                        <div
                          className='p-8 lg:p-12 flex flex-col justify-center bg-background/80 backdrop-blur-md shadow-2xl
                                     lg:absolute lg:top-0 lg:bottom-0 lg:right-0 lg:w-1/2 lg:translate-x-full lg:opacity-0
                                     lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-x-0 lg:group-focus-within:opacity-100 lg:transition-all lg:duration-700 lg:ease-in-out
                                     lg:pointer-events-none lg:group-hover:pointer-events-auto lg:group-focus-within:pointer-events-auto'
                          aria-hidden='false'
                        >
                          {/* Title for small screens */}
                          <h3 className='text-3xl font-bold mb-4 lg:hidden'>
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
                ))}
              </div>
            </section>
          )}

          {/* Technical Expertise */}
          {homePageData.technicalExpertise.length > 0 && (
            <section>
              <AnimatedSection direction='up'>
                <div className='text-center mb-12'>
                  <h2 className='text-3xl md:text-4xl font-bold mb-3'>
                    Technical Expertise
                  </h2>
                  <p className='text-foreground/60'>
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
                    <GlassCard variant='minimal' className='p-6 h-full' hover>
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
          )}

          {/* Quick Access Cards - Redesigned with equal heights */}
          <section>
            <AnimatedSection direction='up'>
              <div className='text-center mb-12'>
                <h2 className='text-3xl md:text-4xl font-bold mb-3'>
                  Explore More
                </h2>
                <p className='text-foreground/60'>
                  Learn more about my work and experience
                </p>
              </div>
            </AnimatedSection>

            <div className='grid md:grid-cols-3 gap-6 max-w-6xl mx-auto'>
              <AnimatedSection direction='up' delay={0.1}>
                <Link href='/about' className='block h-full'>
                  <GlassCard
                    variant='minimal'
                    className='p-8 h-full group flex flex-col'
                    hover
                  >
                    <div className='w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6'>
                      <span className='text-2xl'>👤</span>
                    </div>
                    <h3 className='text-2xl font-bold mb-3'>About Me</h3>
                    <p className='text-foreground/60 leading-relaxed flex-1 line-clamp-3'>
                      {homePageData.about_card_description ||
                        "Discover my journey, skills, and what drives me to create impactful solutions."}
                    </p>
                    <div className='flex items-center gap-2 mt-6 text-primary font-medium'>
                      <span>Learn More</span>
                      <ArrowRight
                        className='group-hover:translate-x-1 transition-transform'
                        size={16}
                      />
                    </div>
                  </GlassCard>
                </Link>
              </AnimatedSection>

              <AnimatedSection direction='up' delay={0.2}>
                <Link href='/projects' className='block h-full'>
                  <GlassCard
                    variant='minimal'
                    className='p-8 h-full group flex flex-col'
                    hover
                  >
                    <div className='w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6'>
                      <span className='text-2xl'>🚀</span>
                    </div>
                    <h3 className='text-2xl font-bold mb-3'>Projects</h3>
                    <p className='text-foreground/60 leading-relaxed flex-1 line-clamp-3'>
                      {homePageData.projects_card_description ||
                        "Explore my latest work featuring modern technologies and innovative solutions."}
                    </p>
                    <div className='flex items-center gap-2 mt-6 text-primary font-medium'>
                      <span>View Portfolio</span>
                      <ArrowRight
                        className='group-hover:translate-x-1 transition-transform'
                        size={16}
                      />
                    </div>
                  </GlassCard>
                </Link>
              </AnimatedSection>

              <AnimatedSection direction='up' delay={0.3}>
                <Link href='/resume' className='block h-full'>
                  <GlassCard
                    variant='minimal'
                    className='p-8 h-full group flex flex-col'
                    hover
                  >
                    <div className='w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6'>
                      <span className='text-2xl'>📄</span>
                    </div>
                    <h3 className='text-2xl font-bold mb-3'>Experience</h3>
                    <p className='text-foreground/60 leading-relaxed flex-1 line-clamp-3'>
                      {homePageData.experience_card_description ||
                        "Professional background and skills across multiple disciplines."}
                    </p>
                    <div className='flex items-center gap-2 mt-6 text-primary font-medium'>
                      <span>View Resume</span>
                      <ArrowRight
                        className='group-hover:translate-x-1 transition-transform'
                        size={16}
                      />
                    </div>
                  </GlassCard>
                </Link>
              </AnimatedSection>
            </div>
          </section>

          {/* Achievements & Recognition */}
          {homePageData.achievements.length > 0 && (
            <section>
              <AnimatedSection direction='up'>
                <div className='text-center mb-12'>
                  <h2 className='text-3xl md:text-4xl font-bold mb-3'>
                    Achievements
                  </h2>
                  <p className='text-foreground/60'>Notable accomplishments</p>
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
                      className='p-8 text-center h-full'
                      hover
                    >
                      <div className='text-4xl font-bold text-primary mb-3'>
                        {achievement.metric}
                      </div>
                      <div className='text-xs text-foreground/50 mb-4 uppercase tracking-widest font-medium'>
                        {achievement.label}
                      </div>
                      <h3 className='text-lg font-semibold mb-2'>
                        {achievement.title}
                      </h3>
                      <p className='text-foreground/60 text-sm leading-relaxed'>
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
                className='p-10 md:p-14 text-center max-w-3xl mx-auto'
              >
                <h2 className='text-3xl md:text-4xl font-bold mb-4'>
                  {homePageData.callToAction.title}
                </h2>
                <p className='text-lg text-foreground/60 mb-8 max-w-xl mx-auto leading-relaxed'>
                  {homePageData.callToAction.description}
                </p>
                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <Button asChild size='lg' className='px-8'>
                    <a href={`mailto:${homePageData.callToAction.email}`}>
                      Start a Project
                    </a>
                  </Button>
                  <Button asChild variant='outline' size='lg' className='px-8'>
                    <Link href='/about'>Learn More About Me</Link>
                  </Button>
                </div>
              </GlassCard>
            </AnimatedSection>
          </section>

          {/* Connect With Me - Social Links Only */}
          {homePageData.socialLinks.length > 0 && (
            <section>
              <AnimatedSection direction='up'>
                <div className='max-w-lg mx-auto text-center'>
                  <h3 className='text-2xl font-bold mb-6'>Connect With Me</h3>
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
                          className='group flex items-center gap-3 px-5 py-3 rounded-xl border border-foreground/10 hover:border-primary/30 hover:bg-foreground/5 transition-all'
                          aria-label={social.platform}
                        >
                          <Icon className='h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors' />
                          <span className='text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors'>
                            {social.display_label || social.platform}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </AnimatedSection>
            </section>
          )}
        </motion.div>
      </div>
    </ErrorBoundary>
  );
}
