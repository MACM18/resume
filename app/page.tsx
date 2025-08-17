"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";

const socialIconMap = {
  Github,
  Linkedin,
  Twitter,
  Mail,
  ArrowRight,
};

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

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profileData", hostname],
    queryFn: () => getProfileData(hostname),
    enabled: !!hostname,
  });

  if (isLoading || !hostname) {
    return <HomePageSkeleton />;
  }

  if (!profileData || !profileData.home_page_data) {
    return <DomainNotClaimed />;
  }

  const homePageData = {
    ...profileData.home_page_data,
    name: profileData.full_name,
    tagline: profileData.tagline,
  };

  return (
    <div className='min-h-screen relative pt-24 pb-32 md:pb-12 px-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className='text-6xl md:text-8xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent'>
              {homePageData.name}
            </h1>
            <p className='text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto'>
              {homePageData.tagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
              <Link href={`/resume/developer`}>Download Resume</Link>
            </Button>
          </motion.div>
        </div>

        {/* Experience Highlights */}
        <div className='mb-16'>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className='text-3xl font-bold text-center mb-12 text-secondary'
          >
            Experience Highlights
          </motion.h2>

          <div className='grid md:grid-cols-2 gap-8 mb-12'>
            {homePageData.experienceHighlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* Featured Work Preview */}
        <div className='mb-16'>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className='text-3xl font-bold text-center mb-12 text-accent'
          >
            Featured Work
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <GlassCard className='p-8' hover>
              <div className='grid md:grid-cols-2 gap-8 items-center'>
                <div>
                  <h3 className='text-2xl font-bold mb-4 text-primary'>
                    Glassmorphic Dashboard
                  </h3>
                  <p className='text-foreground/80 mb-6'>
                    A modern analytics dashboard featuring cutting-edge
                    glassmorphism design, real-time data visualization, and
                    seamless user experience.
                  </p>
                  <div className='flex flex-wrap gap-2 mb-6'>
                    {[
                      "React",
                      "TypeScript",
                      "Framer Motion",
                      "Tailwind CSS",
                    ].map((tech) => (
                      <span
                        key={tech}
                        className='px-3 py-1 text-sm rounded-full bg-primary/10 border border-primary/20 text-primary'
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Button asChild className='bg-primary hover:bg-primary/90'>
                    <Link href={`/projects`}>
                      View All Projects{" "}
                      <ArrowRight className='ml-2' size={16} />
                    </Link>
                  </Button>
                </div>
                <div className='aspect-video bg-glass-bg/20 rounded-lg border border-glass-border/30 flex items-center justify-center'>
                  <div className='text-foreground/40 text-center'>
                    <div className='w-16 h-16 bg-primary/20 rounded-lg mx-auto mb-3 flex items-center justify-center'>
                      <span className='text-2xl'>🎨</span>
                    </div>
                    <p className='text-sm'>Project Preview</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Technical Expertise */}
        <div className='mb-16'>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className='text-3xl font-bold text-center mb-12 text-primary'
          >
            Technical Expertise
          </motion.h2>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {homePageData.technicalExpertise.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className='grid md:grid-cols-3 gap-8 mb-16'>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <GlassCard className='p-8 h-full' hover>
              <h3 className='text-2xl font-bold mb-4 text-primary'>About Me</h3>
              <p className='text-foreground/70 mb-6'>
                Passionate developer with 5+ years of experience creating modern
                web applications
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
          >
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
                className='text-accent hover:text-accent/80'
              >
                <Link href={`/resume/developer`}>
                  View Resume <ArrowRight className='ml-2' size={16} />
                </Link>
              </Button>
            </GlassCard>
          </motion.div>
        </div>

        {/* Achievements & Recognition */}
        <div className='mb-16'>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className='text-3xl font-bold text-center mb-12 text-secondary'
          >
            Achievements & Recognition
          </motion.h2>

          <div className='grid md:grid-cols-3 gap-6'>
            {homePageData.achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.9 + index * 0.1 }}
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
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
                <a href={`mailto:${homePageData.callToAction.email}`}>Start a Project</a>
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
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.4 }}
        >
          <GlassCard className='p-8'>
            <h3 className='text-xl font-semibold mb-6 text-center'>
              Connect With Me
            </h3>
            <div className='flex justify-center space-x-6'>
              {homePageData.socialLinks.map((social, index) => {
                const Icon =
                  socialIconMap[social.icon as keyof typeof socialIconMap];
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-3 rounded-full bg-glass-bg/20 border border-glass-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-glow group'
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.4 + index * 0.1 }}
                  >
                    <Icon
                      size={24}
                      className='text-foreground/70 group-hover:text-primary transition-colors duration-300'
                    />
                  </motion.a>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}