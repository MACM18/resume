"use client";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Code } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { useEffect, useState } from "react";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { ContactNumbersDisplay } from "@/components/ContactNumbersDisplay";
import Image from "next/image";
import { getEffectiveDomain } from "@/lib/utils";
import { AboutPageSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { AboutPageData } from "@/types/portfolio";
import { getDynamicIcon } from "@/lib/icons";

// Define the shape of data returned by getProfileData
interface ProfileData {
  full_name: string;
  tagline: string;
  home_page_data: {
    callToAction?: {
      email: string;
    };
  };
  about_page_data: AboutPageData;
  avatar_url: string | null;
  avatar_position?: { x: number; y: number };
  avatar_zoom?: number;
  contact_numbers?: {
    id: string;
    number: string;
    label: string;
    isActive: boolean;
    isPrimary: boolean;
  }[];
}

const About = () => {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery<ProfileData | null>({
    queryKey: ["profileData", hostname],
    queryFn: async () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return null;
      return getProfileData(domain);
    },
    enabled: !!hostname,
    retry: 2,
  });

  if (isLoading || !hostname) {
    return <AboutPageSkeleton />;
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center px-6'>
        <GlassCard variant='gradient' className='p-8 max-w-lg text-center'>
          <h2 className='text-2xl font-bold mb-4 text-destructive'>
            Error Loading Profile
          </h2>
          <p className='text-foreground/70'>
            Failed to load profile data. Please try again later.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  // Proper type handling with defaults
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
  const avatarUrl = profileData.avatar_url;

  return (
    <ErrorBoundary>
      <div className='min-h-screen relative pb-20'>
        {/* Hero Section with Avatar */}
        <section className='relative min-h-[60vh] flex items-center justify-center pt-32 pb-20 px-6'>
          <div className='max-w-4xl mx-auto text-center'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className='mb-12'
            >
              {avatarUrl && (
                <div className='relative w-48 h-48 mx-auto mb-10'>
                  <div className='absolute inset-0 rounded-full border-2 border-foreground/10 overflow-hidden'>
                    <Image
                      src={avatarUrl}
                      alt={profileData.full_name || "Profile Picture"}
                      fill
                      className='object-cover'
                      style={{
                        objectPosition: `${
                          profileData.avatar_position?.x ?? 50
                        }% ${profileData.avatar_position?.y ?? 50}%`,
                        transform: `scale(${
                          (profileData.avatar_zoom ?? 100) / 100
                        })`,
                      }}
                      sizes='(max-width: 768px) 192px, 192px'
                      priority
                    />
                  </div>
                  {/* Subtle glow effect */}
                  <div className='absolute -inset-4 bg-primary/5 rounded-full blur-2xl -z-10' />
                </div>
              )}
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-4'>
                {aboutPageData.title}
              </h1>
              <p className='text-xl md:text-2xl text-foreground/60 font-light'>
                {aboutPageData.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className='max-w-5xl mx-auto px-6 space-y-24'>
          {/* My Story Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className='mb-12'>
              <h2 className='text-3xl md:text-4xl font-bold mb-2'>My Story</h2>
              <div className='w-20 h-1 bg-primary' />
            </div>
            <div className='space-y-6 text-lg text-foreground/80 leading-relaxed'>
              {aboutPageData.story.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className='leading-loose'
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </motion.section>

          {/* Skills & Expertise Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className='mb-12'>
              <h2 className='text-3xl md:text-4xl font-bold mb-2'>
                Skills & Expertise
              </h2>
              <div className='w-20 h-1 bg-primary' />
            </div>
            <div className='grid sm:grid-cols-2 gap-6'>
              {aboutPageData.skills.map((skillGroup, index) => {
                // Dynamically get the icon from the stored string (e.g., "Fa.FaReact")
                const IconComponent = skillGroup.icon
                  ? getDynamicIcon(skillGroup.icon)
                  : null;
                // Fallback to Code icon if the stored icon is not found
                const Icon = IconComponent || Code;

                return (
                  <motion.div
                    key={skillGroup.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    <GlassCard variant='minimal' className='p-8 h-full' hover>
                      <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                          <Icon className='text-primary' size={20} />
                        </div>
                        <h3 className='text-xl font-semibold'>
                          {skillGroup.category}
                        </h3>
                      </div>
                      <ul className='space-y-3'>
                        {skillGroup.items.map((skill) => (
                          <li
                            key={skill}
                            className='flex items-center gap-3 text-foreground/70'
                          >
                            <span className='w-1.5 h-1.5 rounded-full bg-primary shrink-0' />
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Get In Touch Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {profileData.contact_numbers &&
            profileData.contact_numbers.length > 0 ? (
              <div className='space-y-12'>
                <div className='mb-12'>
                  <h2 className='text-3xl md:text-4xl font-bold mb-2'>
                    Get In Touch
                  </h2>
                  <div className='w-20 h-1 bg-primary' />
                </div>

                <div className='grid lg:grid-cols-2 gap-8'>
                  {/* Contact Numbers */}
                  <ContactNumbersDisplay
                    contactNumbers={profileData.contact_numbers}
                  />

                  {/* Call to Action Card */}
                  <GlassCard
                    variant='bordered'
                    className='p-8 flex flex-col justify-center'
                  >
                    <h3 className='text-2xl font-bold mb-4'>
                      {aboutPageData.callToAction.title}
                    </h3>
                    <p className='text-foreground/70 mb-6 leading-relaxed'>
                      {aboutPageData.callToAction.description}
                    </p>
                    <Button asChild size='lg' className='w-full sm:w-auto'>
                      <Link href={`mailto:${contactEmail}`}>Send an Email</a>
                    </Button>
                  </GlassCard>
                </div>
              </div>
            ) : (
              /* Call to Action Only - Full Width */
              <GlassCard
                variant='bordered'
                className='p-12 md:p-16 text-center max-w-3xl mx-auto'
              >
                <h2 className='text-3xl md:text-4xl font-bold mb-6'>
                  {aboutPageData.callToAction.title}
                </h2>
                <p className='text-xl text-foreground/70 mb-10 leading-relaxed'>
                  {aboutPageData.callToAction.description}
                </p>
                <Button asChild size='lg' className='px-8 py-6 text-lg'>
                  <Link href={`mailto:${contactEmail}`}>Send an Email</a>
                </Button>
              </GlassCard>
            )}
          </motion.section>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default About;
