"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Download, Mail, MapPin, Calendar, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resumes, projects } from "@/data/portfolio";

const Resume = () => {
  const params = useParams();
  const role = Array.isArray(params.role) ? params.role[0] : params.role;
  const [selectedRole, setSelectedRole] = useState(role || "developer");

  const currentResume = resumes[selectedRole];
  const availableRoles = Object.keys(resumes);

  if (!currentResume) {
    return (
      <div className='min-h-screen relative pt-24 pb-12 px-6 flex items-center justify-center'>
        <GlassCard className='p-8 text-center'>
          <h1 className='text-2xl font-bold mb-4'>Resume Not Found</h1>
          <p className='text-foreground/70'>
            The resume role you&apos;re looking for doesn&apos;t exist.
          </p>
        </GlassCard>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    console.log(`Downloading PDF resume for ${selectedRole}`);
    // For now, we'll just show a toast
    alert(`PDF download for ${currentResume.title} would start here!`);
  };

  return (
    <div className='min-h-screen relative pt-24 pb-12 px-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12'
        >
          <h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent'>
            Resume
          </h1>

          {/* Role Selector */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-8'>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className='w-48 bg-glass-bg/20 border-glass-border/30'>
                <SelectValue placeholder='Select role' />
              </SelectTrigger>
              <SelectContent className='bg-popover border-glass-border/30'>
                {availableRoles.map((roleKey) => (
                  <SelectItem key={roleKey} value={roleKey}>
                    {resumes[roleKey].title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleDownloadPDF}
              size='lg'
              className='bg-primary hover:bg-primary/90'
            >
              <Download className='mr-2' size={20} />
              Download PDF
            </Button>
          </div>
        </motion.div>

        {/* Resume Content */}
        <div className='space-y-8'>
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className='p-8'>
              <div className='text-center mb-6'>
                <h2 className='text-4xl font-bold mb-2'>Alex Chen</h2>
                <h3 className='text-2xl text-primary mb-4'>
                  {currentResume.title}
                </h3>
                <div className='flex flex-wrap justify-center gap-4 text-foreground/70'>
                  <div className='flex items-center'>
                    <Mail size={16} className='mr-2' />
                    alex.chen@example.com
                  </div>
                  <div className='flex items-center'>
                    <MapPin size={16} className='mr-2' />
                    San Francisco, CA
                  </div>
                </div>
              </div>
              <p className='text-foreground/80 text-center max-w-3xl mx-auto leading-relaxed'>
                {currentResume.summary}
              </p>
            </GlassCard>
          </motion.div>

          <div className='grid lg:grid-cols-3 gap-8'>
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Experience */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <GlassCard className='p-8'>
                  <h3 className='text-2xl font-bold mb-6 text-primary'>
                    Professional Experience
                  </h3>
                  <div className='space-y-6'>
                    {currentResume.experience.map((exp, index) => (
                      <div
                        key={index}
                        className='border-l-2 border-primary/30 pl-6'
                      >
                        <div className='flex flex-wrap items-center justify-between mb-2'>
                          <h4 className='text-xl font-semibold'>
                            {exp.position}
                          </h4>
                          <div className='flex items-center text-foreground/60'>
                            <Calendar size={16} className='mr-1' />
                            {exp.duration}
                          </div>
                        </div>
                        <p className='text-primary mb-3'>{exp.company}</p>
                        <ul className='space-y-2 text-foreground/80'>
                          {exp.description.map((item, i) => (
                            <li key={i} className='flex items-start'>
                              <span className='w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0' />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Featured Projects */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <GlassCard className='p-8'>
                  <h3 className='text-2xl font-bold mb-6 text-secondary'>
                    Featured Projects
                  </h3>
                  <div className='space-y-4'>
                    {currentResume.projects.map((projectId) => {
                      const project = projects.find((p) => p.id === projectId);
                      if (!project) return null;

                      return (
                        <div
                          key={projectId}
                          className='border border-glass-border/20 rounded-lg p-4'
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <h4 className='text-lg font-semibold'>
                              {project.title}
                            </h4>
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-primary hover:text-primary-glow'
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                          <p className='text-foreground/70 text-sm mb-3'>
                            {project.description}
                          </p>
                          <div className='flex flex-wrap gap-2'>
                            {project.tech.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className='px-2 py-1 text-xs rounded bg-glass-bg/20 text-foreground/60'
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <GlassCard className='p-6'>
                  <h3 className='text-xl font-bold mb-4 text-accent'>Skills</h3>
                  <div className='flex flex-wrap gap-2'>
                    {currentResume.skills.map((skill) => (
                      <span
                        key={skill}
                        className='px-3 py-2 text-sm rounded-full bg-glass-bg/20 border border-glass-border/30 text-foreground/80'
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Education */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <GlassCard className='p-6'>
                  <h3 className='text-xl font-bold mb-4 text-secondary'>
                    Education
                  </h3>
                  <div className='space-y-4'>
                    {currentResume.education.map((edu, index) => (
                      <div key={index}>
                        <h4 className='font-semibold'>{edu.degree}</h4>
                        <p className='text-foreground/70'>{edu.school}</p>
                        <p className='text-foreground/60 text-sm'>{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;