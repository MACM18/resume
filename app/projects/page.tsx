"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Github, Star } from "lucide-react";
import { getProjects } from "@/lib/projects";
import { getProfileData } from "@/lib/profile";
import { getEffectiveDomain } from "@/lib/utils";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { ProjectsPageSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import type { Project } from "@/types/portfolio";

const Projects = () => {
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

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve([]);
      return getProjects(domain);
    },
    enabled: !!hostname && !!profileData,
  });

  const isLoading = isLoadingProfile || isLoadingProjects;

  if (isLoading || !hostname) {
    return <ProjectsPageSkeleton />;
  }

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  const featuredProjects = projects?.filter((p: Project) => p.featured) || [];
  const otherProjects = projects?.filter((p: Project) => !p.featured) || [];

  return (
    <div className='min-h-screen relative pb-20'>
      {/* Hero Section */}
      <section className='pt-32 pb-20 px-6'>
        <div className='max-w-6xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center max-w-3xl mx-auto'
          >
            <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight'>
              My Projects
            </h1>
            <p className='text-xl md:text-2xl text-foreground/60 font-light leading-relaxed'>
              A showcase of my recent work, featuring modern technologies and
              innovative solutions
            </p>
          </motion.div>
        </div>
      </section>

      <div className='max-w-7xl mx-auto px-6 space-y-24'>
        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='mb-12'
            >
              <div className='flex items-center gap-3 mb-2'>
                <Star className='text-primary' size={20} fill='currentColor' />
                <h2 className='text-3xl md:text-4xl font-bold'>
                  Featured Projects
                </h2>
              </div>
              <div className='w-20 h-1 bg-primary ml-8' />
            </motion.div>
            <div className='grid lg:grid-cols-2 gap-8'>
              {featuredProjects.map((project: Project, index: number) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <GlassCard
                    variant='bordered'
                    className='overflow-hidden h-full flex flex-col group'
                    hover
                  >
                    <div className='aspect-video relative overflow-hidden bg-foreground/5'>
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        fill
                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                        sizes='(max-width: 1024px) 100vw, 50vw'
                        priority={index === 0}
                      />
                      <div className='absolute top-4 right-4 px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold'>
                        Featured
                      </div>
                    </div>
                    <div className='p-8 flex flex-col flex-1'>
                      <h3 className='text-2xl font-bold mb-3'>
                        {project.title}
                      </h3>
                      <p className='text-foreground/70 mb-6 leading-relaxed flex-1'>
                        {project.description}
                      </p>
                      <div className='flex flex-wrap gap-2 mb-6'>
                        {project.tech.slice(0, 6).map((tech: string) => (
                          <span
                            key={tech}
                            className='px-3 py-1 text-xs rounded-md bg-foreground/5 border border-foreground/10 text-foreground/80'
                          >
                            {tech}
                          </span>
                        ))}
                        {project.tech.length > 6 && (
                          <span className='px-3 py-1 text-xs text-foreground/60'>
                            +{project.tech.length - 6} more
                          </span>
                        )}
                      </div>
                      <div className='flex gap-3'>
                        <Button asChild size='sm' className='flex-1'>
                          <Link href={`/projects/${project.id}`}>
                            View Details
                          </Link>
                        </Button>
                        {project.demo_url && (
                          <Button asChild variant='outline' size='icon'>
                            <a
                              href={project.demo_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              aria-label='View demo'
                            >
                              <ExternalLink size={16} />
                            </a>
                          </Button>
                        )}
                        {project.github_url && (
                          <Button asChild variant='outline' size='icon'>
                            <a
                              href={project.github_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              aria-label='View source'
                            >
                              <Github size={16} />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* All Projects */}
        {otherProjects.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className='mb-12'
            >
              <h2 className='text-3xl md:text-4xl font-bold mb-2'>
                {featuredProjects.length > 0 ? "All Projects" : "Projects"}
              </h2>
              <div className='w-20 h-1 bg-primary' />
            </motion.div>
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {otherProjects.map((project: Project, index: number) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                >
                  <Link href={`/projects/${project.id}`}>
                    <GlassCard
                      variant='minimal'
                      className='p-6 h-full flex flex-col group cursor-pointer'
                      hover
                    >
                      <h3 className='text-xl font-bold mb-3 group-hover:text-primary transition-colors'>
                        {project.title}
                      </h3>
                      <p className='text-foreground/70 mb-4 text-sm leading-relaxed line-clamp-3 flex-1'>
                        {project.description}
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {project.tech.slice(0, 3).map((tech: string) => (
                          <span
                            key={tech}
                            className='px-2.5 py-1 text-xs rounded-md bg-foreground/5 border border-foreground/10 text-foreground/70'
                          >
                            {tech}
                          </span>
                        ))}
                        {project.tech.length > 3 && (
                          <span className='px-2.5 py-1 text-xs text-foreground/60'>
                            +{project.tech.length - 3}
                          </span>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Projects;
