"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Github, Star } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/portfolio";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  delay?: number;
  priority?: boolean;
}

export function ProjectCard({
  project,
  featured = false,
  delay = 0,
  priority = false,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <GlassCard
        variant='gradient'
        className={cn(
          "overflow-hidden group h-full flex flex-col",
          featured && "lg:col-span-2"
        )}
        hover
      >
        {/* Project Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-glass-bg/20",
            featured ? "aspect-[16/9]" : "aspect-video"
          )}
        >
          <Image
            src={project.image || "/placeholder.svg"}
            alt={project.title}
            className='w-full h-full object-cover transition-all duration-700 group-hover:brightness-110 group-hover:scale-105'
            width={800}
            height={450}
            priority={priority}
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent' />

          {/* Featured Badge */}
          {featured && (
            <div className='absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm flex items-center gap-2'>
              <Star className='w-3 h-3 fill-white text-white' />
              <span className='text-xs font-semibold text-white'>Featured</span>
            </div>
          )}

          {/* Quick Actions on Hover */}
          <div className='absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4'>
            {project.demo_url && (
              <Button
                asChild
                size='sm'
                className='bg-primary hover:bg-primary/90'
              >
                <a
                  href={project.demo_url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ExternalLink className='mr-2' size={16} />
                  Live Demo
                </a>
              </Button>
            )}
            {project.github_url && (
              <Button
                asChild
                size='sm'
                variant='outline'
                className='border-secondary hover:bg-secondary/10'
              >
                <a
                  href={project.github_url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Github className='mr-2' size={16} />
                  Source
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Project Content */}
        <div className='p-6 flex-1 flex flex-col'>
          <h3 className='text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
            {project.title}
          </h3>
          <p className='text-foreground/80 mb-4 leading-relaxed flex-1'>
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className='flex flex-wrap gap-2 mb-6'>
            {project.tech.map((tech) => (
              <span
                key={tech}
                className='px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 text-secondary font-medium hover:border-secondary/50 transition-colors'
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 mt-auto'>
            <Button
              asChild
              variant='outline'
              className='flex-1 border-primary/30 hover:border-primary hover:bg-primary/10'
            >
              <Link href={`/projects/${project.id}`}>View Details</Link>
            </Button>
            {(project.demo_url || project.github_url) && (
              <div className='flex gap-2'>
                {project.demo_url && (
                  <Button asChild size='icon' variant='ghost'>
                    <a
                      href={project.demo_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='View live demo'
                    >
                      <ExternalLink size={18} />
                    </a>
                  </Button>
                )}
                {project.github_url && (
                  <Button asChild size='icon' variant='ghost'>
                    <a
                      href={project.github_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label='View source code'
                    >
                      <Github size={18} />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
