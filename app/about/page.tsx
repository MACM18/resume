"use client";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Code, Palette, Zap, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { ContactNumbersDisplay } from "@/components/ContactNumbersDisplay";
import Image from "next/image";
import { getEffectiveDomain } from "@/lib/utils";

const iconMap = {
  Code,
  Palette,
  Zap,
  Heart,
};

const AboutPageSkeleton = () => (
  <div className='min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto'>
    <div className='text-center mb-16'>
      <Skeleton className='h-16 w-1/2 mx-auto mb-6' />
      <Skeleton className='h-6 w-full max-w-2xl mx-auto' />
    </div>
    <Skeleton className='h-64 w-full mb-12' />
    <div className='grid md:grid-cols-2 gap-6'>
      <Skeleton className='h-40 w-full' />
      <Skeleton className='h-40 w-full' />
      <Skeleton className='h-40 w-full' />
      <Skeleton className='h-40 w-full' />
    </div>
  </div>
);

const About = () => {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profileData", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve(null);
      return getProfileData(domain);
    },
    enabled: !!hostname,
  });

  if (isLoading || !hostname) {
    return <AboutPageSkeleton />;
  }

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  // Use profile data with sensible defaults if about_page_data is missing
  const aboutPageData = profileData.about_page_data || {
    title: "About Me",
    subtitle: profileData.tagline || "My Journey",
    story: [],
    skills: [],
    callToAction: {
      title: "Get in Touch",
      description: "Let's connect!",
      email: "",
    },
  };
  const contactEmail =
    profileData.home_page_data?.callToAction?.email ||
    aboutPageData.callToAction?.email ||
    "";
  const avatarUrl = profileData.avatar_url;

  return (
    <div className='min-h-screen relative pt-20 md:pt-32 pb-20 px-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          {avatarUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='relative w-40 h-40 mx-auto mb-8'
            >
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent p-[3px] animate-pulse'>
                <div className='relative w-full h-full rounded-full overflow-hidden bg-background'>
                  <Image
                    src={avatarUrl}
                    alt='Profile Picture'
                    layout='fill'
                    objectFit='cover'
                    className='object-cover'
                  />
                </div>
              </div>
              <div className='absolute -inset-4 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-2xl -z-10' />
            </motion.div>
          )}
          <h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'>
            {aboutPageData.title}
          </h1>
          <p className='text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed'>
            {aboutPageData.subtitle}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className='space-y-12'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard
              variant='gradient'
              className='p-8 relative overflow-hidden'
            >
              <div className='absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-secondary to-accent' />
              <h2 className='text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                My Story
              </h2>
              <div className='space-y-4 text-foreground/80 leading-relaxed'>
                {aboutPageData.story.map((paragraph, index) => (
                  <p key={index} className='text-base leading-loose'>
                    {paragraph}
                  </p>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className='text-center mb-8'>
              <h2 className='text-4xl font-bold bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent inline-block'>
                Skills & Expertise
              </h2>
              <div className='w-24 h-1 bg-gradient-to-r from-secondary via-accent to-primary rounded-full mx-auto mt-3' />
            </div>
            <div className='grid md:grid-cols-2 gap-6'>
              {aboutPageData.skills.map((skillGroup, index) => {
                const Icon = iconMap[skillGroup.icon as keyof typeof iconMap];
                return (
                  <motion.div
                    key={skillGroup.category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  >
                    <GlassCard
                      variant='gradient'
                      className='p-6 group relative overflow-hidden'
                      hover
                    >
                      <div className='flex items-center mb-6'>
                        <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mr-4'>
                          <Icon
                            className='text-primary group-hover:scale-110 transition-transform'
                            size={24}
                          />
                        </div>
                        <h3 className='text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                          {skillGroup.category}
                        </h3>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {skillGroup.items.map((skill) => (
                          <span
                            key={skill}
                            className='px-3 py-1.5 text-sm rounded-full bg-gradient-to-r from-glass-bg/30 to-glass-bg/20 border border-glass-border/30 text-foreground/80 hover:text-foreground hover:border-primary/50 transition-all'
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Numbers & Call to Action Combined */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {profileData.contact_numbers &&
            profileData.contact_numbers.length > 0 ? (
              <div className='grid lg:grid-cols-2 gap-8 items-start'>
                {/* Contact Numbers */}
                <div>
                  <ContactNumbersDisplay
                    contactNumbers={profileData.contact_numbers}
                  />
                </div>

                {/* Call to Action */}
                <GlassCard className='p-8'>
                  <h2 className='text-2xl font-bold mb-4 text-accent'>
                    {aboutPageData.callToAction.title}
                  </h2>
                  <p className='text-foreground/80 mb-6'>
                    {aboutPageData.callToAction.description}
                  </p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className='inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-300 hover:shadow-glow'
                  >
                    Get In Touch
                  </a>
                </GlassCard>
              </div>
            ) : (
              /* Call to Action Only - Centered */
              <div className='text-center'>
                <GlassCard className='p-8 max-w-2xl mx-auto'>
                  <h2 className='text-2xl font-bold mb-4 text-accent'>
                    {aboutPageData.callToAction.title}
                  </h2>
                  <p className='text-foreground/80 mb-6'>
                    {aboutPageData.callToAction.description}
                  </p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className='inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-300 hover:shadow-glow'
                  >
                    Get In Touch
                  </a>
                </GlassCard>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
