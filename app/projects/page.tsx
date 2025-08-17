"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Github, Star } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/projects";
import { Skeleton } from "@/components/ui/skeleton";

const Projects = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const featuredProjects = projects?.filter((p) => p.featured) || [];
  const otherProjects = projects?.filter((p) => !p.featured) || [];

  return (
    <div className='min-h-screen relative pt-24 pb-12 px-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent'>
            My Projects
          </h1>
          <p className='text-xl text-foreground/80 max-w-2xl mx-auto'>
            A showcase of my recent work, featuring modern technologies and
            innovative solutions
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-8 w-64" />
            <div className="grid lg:grid-cols-2 gap-8">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <section className='mb-16'>
                <motion.h2
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className='text-3xl font-bold mb-8 flex items-center text-primary'
                >
                  <Star className='mr-3' size={28} />
                  Featured Projects
                </motion.h2>
                <div className='grid lg:grid-cols-2 gap-8'>
                  {featuredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                    >
                      <GlassCard className='overflow-hidden group' hover>
                        <div className='aspect-video bg-glass-bg/20 relative overflow-hidden'>
                          <Image
                            src={project.image || "/placeholder.svg"}
                            alt={project.title}
                            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                            width={800}
                            height={450}
                            priority={index === 0}
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-glass-bg/80 to-transparent' />
                        </div>
                        <div className='p-6'>
                          <h3 className='text-2xl font-bold mb-3 text-primary group-hover:text-primary-glow transition-colors duration-300'>
                            {project.title}
                          </h3>
                          <p className='text-foreground/80 mb-4'>
                            {project.description}
                          </p>
                          <div className='flex flex-wrap gap-2 mb-6'>
                            {project.tech.map((tech) => (
                              <span
                                key={tech}
                                className='px-3 py-1 text-xs rounded-full bg-secondary/10 border border-secondary/20 text-secondary'
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className='flex space-x-3'>
                            <Button asChild size='sm' className='flex-1'>
                              <Link href={`/projects/${project.id}`}>
                                View Details
                              </Link>
                            </Button>
                            {project.demo_url && (
                              <Button asChild variant='outline' size='sm'>
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
                              <Button asChild variant='outline' size='sm'>
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
                  className='text-3xl font-bold mb-8 text-secondary'
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
                      <GlassCard className='p-6 h-full group' hover>
                        <h3 className='text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300'>
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
                          <Link href={`/projects/${project.id}`}>View Project</Link>
                        </Button>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;