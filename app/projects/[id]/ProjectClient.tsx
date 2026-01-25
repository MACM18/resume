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
import { useEffect, useState } from "react";

export default function ProjectClient({ id }: { id: string }) {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id, hostname],
    queryFn: () => getProjectById(id, hostname),
    enabled: !!hostname,
  });

  if (isLoading) {
    return (
      <div className='min-h-screen relative pt-32 pb-20 px-6'>
        <div className='max-w-5xl mx-auto'>
          <Skeleton className='h-6 w-32 mb-8' />
          <Skeleton className='h-12 w-3/4 mb-4' />
          <Skeleton className='h-6 w-full mb-6' />
          <div className='flex gap-4 mb-12'>
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-10 w-32' />
          </div>
          <Skeleton className='aspect-video w-full rounded-xl mb-8' />
          <Skeleton className='h-32 w-full' />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className='min-h-screen relative pt-32 pb-20 px-6 flex items-center justify-center'>
        <GlassCard variant='bordered' className='p-12 text-center max-w-lg'>
          <h1 className='text-3xl font-bold mb-4'>Project Not Found</h1>
          <p className='text-foreground/70 mb-8 leading-relaxed'>
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild size='lg'>
            <Link href='/projects'>
              <ArrowLeft className='mr-2' size={16} />
              Back to Projects
            </Link>
          </Button>
        </GlassCard>
      </div>
    );
  }
  const isImageReal =
    project.image && !project.image.includes("placeholder.svg");

  return (
    <div className='min-h-screen relative pb-20'>
      {/* Hero Section */}
      <section className='pt-32 pb-12 px-6'>
        <div className='max-w-5xl mx-auto'>
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className='mb-12'
          >
            <Button asChild variant='ghost'>
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
            transition={{ duration: 0.6, delay: 0.1 }}
            className='mb-12'
          >
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight'>
              {project.title}
            </h1>
            <p className='text-xl md:text-2xl text-foreground/70 mb-8 leading-relaxed font-light'>
              {project.description}
            </p>

            <div className='flex flex-wrap gap-4'>
              {project.demo_url && (
                <Button asChild size='lg'>
                  <a
                    href={project.demo_url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <ExternalLink className='mr-2' size={18} />
                    View live
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
                    <Github className='mr-2' size={18} />
                    View Code
                  </a>
                </Button>
              )}
            </div>
          </motion.div>

          {/* Project Image */}
          {isImageReal && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className='aspect-video overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5'>
                <Image
                  src={project.image || ""}
                  alt={project.title}
                  className='w-full h-full object-cover'
                  width={1200}
                  height={675}
                  priority
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className='px-6 py-16'>
        <div className='max-w-5xl mx-auto'>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className='mb-8'>
              <h2 className='text-3xl md:text-4xl font-bold mb-2'>
                About This Project
              </h2>
              <div className='w-20 h-1 bg-primary' />
            </div>
            <p className='text-lg text-foreground/70 leading-relaxed'>
              {project.long_description}
            </p>
          </motion.section>

          {/* Key Features & Tech Stack Grid */}
          <div className='grid lg:grid-cols-3 gap-8 mt-16'>
            {/* Key Features */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className='lg:col-span-2'
            >
              <GlassCard variant='minimal' className='p-8 h-full'>
                <h3 className='text-2xl font-bold mb-6'>Key Features</h3>
                {project.key_features && project.key_features.length > 0 ? (
                  <ul className='space-y-4'>
                    {project.key_features.map((feature, index) => (
                      <li key={index} className='flex items-start gap-3'>
                        <span className='w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2' />
                        <span className='text-foreground/70 leading-relaxed'>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-foreground/60'>
                    No key features available.
                  </p>
                )}
              </GlassCard>
            </motion.section>

            {/* Sidebar Info */}
            <div className='space-y-6'>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <GlassCard variant='minimal' className='p-6'>
                  <h3 className='text-lg font-bold mb-4'>Technologies</h3>
                  <div className='flex flex-wrap gap-2'>
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className='px-3 py-1 text-sm rounded-md bg-foreground/5 border border-foreground/10 text-foreground/70'
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {project.featured && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <GlassCard variant='minimal' className='p-6'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='w-2 h-2 bg-primary rounded-full' />
                      <h3 className='text-lg font-bold'>Featured Project</h3>
                    </div>
                    <p className='text-sm text-foreground/70'>
                      This project showcases my best work and key skills
                    </p>
                  </GlassCard>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
