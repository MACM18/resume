"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Github, Star } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/projects";
import { getProfileData } from "@/lib/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { getEffectiveDomain } from "@/lib/utils";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";

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
    return (
      <div className='min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto space-y-8'>
        <Skeleton className='h-8 w-64' />
        <div className='grid lg:grid-cols-2 gap-8'>
          <Skeleton className='h-[400px] w-full' />
          <Skeleton className='h-[400px] w-full' />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  const featuredProjects = projects?.filter((p) => p.featured) || [];
  const otherProjects = projects?.filter((p) => !p.featured) || [];

  return (
    <div className='min-h-screen relative pt-20 md:pt-32 pb-20 px-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16 relative'
        >
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-3xl -z-10' />
          <h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'>
            My Projects
          </h1>
          <p className='text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed'>
            A showcase of my recent work, featuring modern technologies and
            innovative solutions
          </p>
        </motion.div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <section className='mb-16'>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='mb-8 flex items-center'
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center'>
                  <Star className='text-primary' size={20} fill='currentColor' />
                </div>
                <h2 className='text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                  Featured Projects
                </h2>
              </div>
            </motion.div>
            <div className='grid lg:grid-cols-2 gap-8'>
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                >
                  <GlassCard variant='gradient' className='overflow-hidden group' hover>
                    <div className='aspect-video bg-glass-bg/20 relative overflow-hidden'>
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className='w-full h-full object-cover transition-all duration-700 group-hover:brightness-110 group-hover:scale-105'
                        width={800}
                        height={450}
                        priority={index === 0}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent' />
                      <div className='absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm flex items-center gap-2'>
                        <span className='w-1.5 h-1.5 rounded-full bg-white animate-pulse' />
                        <span className='text-xs font-semibold text-white'>Featured</span>
                      </div>
                    </div>
                    <div className='p-6'>
                      <h3 className='text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                        {project.title}
                      </h3>
                      <p className='text-foreground/80 mb-4 leading-relaxed'>
                        {project.description}
                      </p>
                      <div className='flex flex-wrap gap-2 mb-6'>
                        {project.tech.map((tech) => (
                          <span
                            key={tech}
                            className='px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 text-secondary font-medium'
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className='flex space-x-3'>
                        <Button asChild size='sm' className='flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80'>
                          <Link href={`/projects/${project.id}`}>
                            View Details
                          </Link>
                        </Button>
                        {project.demo_url && (
                          <Button asChild variant='outline' size='sm' className='border-secondary/50 hover:border-secondary'>
                            <a
                              href={project.demo_url}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <ExternalLink size={16} />
                            </a>
                          </Button>
                        )}
                        {project.github_url && (
                          <Button asChild variant='outline' size='sm' className='border-secondary/50 hover:border-secondary'>
                            <a
                              href={project.github_url}
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
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Other Projects */}
        {otherProjects.length > 0 && (
          <section>
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className='text-3xl font-bold mb-8 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent'
            >
              More Projects
            </motion.h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {otherProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                >
                  <GlassCard variant='gradient' className='p-6 h-full group' hover>
                    <h3 className='text-xl font-bold mb-3 text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300'>
                      {project.title}
                    </h3>
                    <p className='text-foreground/70 mb-4 text-sm leading-relaxed'>
                      {project.description}
                    </p>
                    <div className='flex flex-wrap gap-2 mb-4'>
                      {project.tech.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className='px-2.5 py-1 text-xs rounded-full bg-gradient-to-r from-glass-bg/30 to-glass-bg/20 border border-glass-border/30 text-foreground/70'
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech.length > 3 && (
                        <span className='px-2.5 py-1 text-xs rounded-full bg-gradient-to-r from-glass-bg/30 to-glass-bg/20 border border-glass-border/30 text-foreground/70'>
                          +{project.tech.length - 3} more
                        </span>
                      )}
                    </div>
                    <Button
                      asChild
                      size='sm'
                      variant='ghost'
                      className='w-full hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10'
                    >
                      <Link href={`/projects/${project.id}`}>View Project</Link>
                    </Button>
                  </GlassCard>
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
