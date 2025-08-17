"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/lib/projects";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function ProjectClient({ id }: { id: string }) {
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id),
  });

  if (isLoading) {
    return (
      <div className='min-h-screen relative pt-24 pb-12 px-6'>
        <div className='max-w-4xl mx-auto'>
          <Skeleton className='h-8 w-40 mb-8' />
          <Skeleton className='h-16 w-3/4 mb-6' />
          <Skeleton className='h-6 w-full mb-8' />
          <div className='flex gap-4 mb-8'>
            <Skeleton className='h-12 w-32' />
            <Skeleton className='h-12 w-32' />
          </div>
          <Skeleton className='aspect-video w-full' />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className='min-h-screen relative pt-24 pb-12 px-6 flex items-center justify-center'>
        <GlassCard className='p-8 text-center'>
          <h1 className='text-2xl font-bold mb-4'>Project Not Found</h1>
          <p className='text-foreground/70 mb-6'>
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href='/projects'>
              <ArrowLeft className='mr-2' size={16} />
              Back to Projects
            </Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className='min-h-screen relative pt-24 pb-32 md:pb-12 px-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-8'
        >
          <Button
            asChild
            variant='ghost'
            className='text-foreground/70 hover:text-primary'
          >
            <Link href='/projects'>
              <ArrowLeft className='mr-2' size={16} />
              Back to Projects
            </Link>
          </Button>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className='mb-12'
        >
          <h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent'>
            {project.title}
          </h1>
          <p className='text-xl text-foreground/80 mb-8'>
            {project.description}
          </p>

          <div className='flex flex-wrap gap-4 mb-8'>
            {project.demo_url && (
              <Button asChild size='lg'>
                <a
                  href={project.demo_url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ExternalLink className='mr-2' size={20} />
                  Live Demo
                </a>
              </Button>
            )}
            {project.github_url && (
              <Button asChild variant='outline' size='lg'>
                <a
                  href={project.github_url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Github className='mr-2' size={20} />
                  View Code
                </a>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Project Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='mb-12'
        >
          <GlassCard className='overflow-hidden'>
            <div className='aspect-video bg-glass-bg/20'>
              <Image
                src={project.image || "/placeholder.svg"}
                alt={project.title}
                className='w-full h-full object-cover'
                width={800}
                height={450}
                priority
              />
            </div>
          </GlassCard>
        </motion.div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Project Details */}
          <div className='lg:col-span-2 space-y-8'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <GlassCard className='p-8'>
                <h2 className='text-3xl font-bold mb-6 text-primary'>
                  About This Project
                </h2>
                <div className='prose prose-invert max-w-none'>
                  <p className='text-foreground/80 leading-relaxed'>
                    {project.long_description?.replace(/"/g, "&quot;")}
                  </p>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <GlassCard className='p-8'>
                <h2 className='text-2xl font-bold mb-6 text-secondary'>
                  Key Features
                </h2>
                <ul className='space-y-3 text-foreground/80'>
                  <li className='flex items-start'>
                    <span className='w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0' />
                    Modern, responsive design with glassmorphism effects
                  </li>
                  <li className='flex items-start'>
                    <span className='w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0' />
                    Built with modern React and TypeScript
                  </li>
                  <li className='flex items-start'>
                    <span className='w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0' />
                    Smooth animations powered by Framer Motion
                  </li>
                  <li className='flex items-start'>
                    <span className='w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0' />
                    Fully responsive across all device sizes
                  </li>
                </ul>
              </GlassCard>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <GlassCard className='p-6'>
                <h3 className='text-xl font-bold mb-4 text-accent'>
                  Technologies Used
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className='px-3 py-2 text-sm rounded-full bg-glass-bg/20 border border-glass-border/30 text-foreground/80'
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <GlassCard className='p-6'>
                <h3 className='text-xl font-bold mb-4 text-secondary'>
                  Project Type
                </h3>
                <p className='text-foreground/80 text-sm mb-4'>
                  {project.featured ? "Featured Project" : "Side Project"}
                </p>
                {project.featured && (
                  <div className='flex items-center space-x-2 text-primary'>
                    <span className='w-2 h-2 bg-primary rounded-full' />
                    <span className='text-sm'>
                      This is a featured project showcasing my best work
                    </span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
