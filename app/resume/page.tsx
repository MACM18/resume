"use client";
import { motion } from "framer-motion";
import {
  Download,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  Loader2,
  Award, // New icon for certifications
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getActiveResume } from "@/lib/resumes";
import { getProjects } from "@/lib/projects";
import { getProfileData } from "@/lib/profile";
import { getVisibleWorkExperiences } from "@/lib/work-experiences";
import { Project } from "@/types/portfolio";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { formatDateRange, getEffectiveDomain } from "@/lib/utils";

const ResumePageSkeleton = () => (
  <div className='min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto'>
    <div className='text-center mb-12'>
      <Skeleton className='h-16 w-1/2 mx-auto mb-6' />
      <Skeleton className='h-12 w-48 mx-auto' />
    </div>
    <Skeleton className='h-48 w-full mb-8' />
    <div className='grid lg:grid-cols-3 gap-8'>
      <div className='lg:col-span-2 space-y-8'>
        <Skeleton className='h-96 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
      <div className='space-y-6'>
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-48 w-full' />
      </div>
    </div>
  </div>
);

const Resume = () => {
  const [hostname, setHostname] = useState("");
  const [isDownloadingUploaded, setIsDownloadingUploaded] = useState(false);

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

  const { data: resume, isLoading: isLoadingResume } = useQuery({
    queryKey: ["activeResume", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve(null);
      return getActiveResume(domain);
    },
    enabled: !!hostname && !!profileData,
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["projects", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve([] as Project[]);
      return getProjects(domain);
    },
    enabled: !!hostname && !!profileData,
  });

  const { data: workHistory = [], isLoading: isLoadingWork } = useQuery({
    queryKey: ["work-experiences", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve([]);
      return getVisibleWorkExperiences(domain);
    },
    enabled: !!hostname && !!profileData,
  });

  const generatePdfMutation = useMutation({
    mutationFn: async () => {
      const anonKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4YWhqYXB5YW1td3RzZG1vZWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTUxOTIsImV4cCI6MjA3MDk3MTE5Mn0.YOQo_BMjNFCHzAu_15foSa_c2J423fZTa0c4r3yzMTk";
      const response = await fetch(
        "https://dxahjapyammwtsdmoeah.supabase.co/functions/v1/generate-resume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            resume,
            profile: profileData,
            projects,
            workHistory,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Failed to generate PDF");
        } catch {
          throw new Error(errorText || "Failed to generate PDF");
        }
      }

      return response.blob();
    },
    onSuccess: (pdfBlob) => {
      if (!(pdfBlob instanceof Blob)) {
        toast.error("Failed to generate PDF: Invalid response from server.");
        console.error("Invalid response:", pdfBlob);
        return;
      }
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      const sanitizedFullName = profileData?.full_name
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-");
      a.download = `Resume-${
        sanitizedFullName || resume?.role || "download"
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded!");
    },
    onError: (error: Error | { message?: string }) => {
      const message = error?.message || "An unknown error occurred.";
      toast.error(`Failed to generate PDF: ${message}`);
    },
  });

  const downloadUploadedResume = async (url: string) => {
    setIsDownloadingUploaded(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      const sanitizedFullName = profileData?.full_name
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-");
      a.download = `Resume-${
        sanitizedFullName || resume?.role || "download"
      }.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success("Resume downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download resume");
    } finally {
      setIsDownloadingUploaded(false);
    }
  };

  const handleDownload = () => {
    if (!resume) return;
    if (resume.pdf_source === "generated") {
      generatePdfMutation.mutate();
    } else if (resume.resume_url) {
      downloadUploadedResume(resume.resume_url);
    } else {
      toast.error("No PDF available for download.");
    }
  };

  const isLoading =
    isLoadingProfile || isLoadingResume || isLoadingProjects || isLoadingWork;

  if (isLoading || !hostname) {
    return <ResumePageSkeleton />;
  }

  if (!profileData) {
    return <DomainNotClaimed />;
  }

  if (!resume) {
    return (
      <div className='min-h-screen relative pt-24 pb-12 px-6 flex items-center justify-center'>
        <GlassCard className='p-8 text-center'>
          <h1 className='text-2xl font-bold mb-4'>Resume Not Available</h1>
          <p className='text-foreground/70'>
            An active resume has not been set for this profile.
          </p>
        </GlassCard>
      </div>
    );
  }

  const fullName = profileData.full_name;
  const contactEmail = profileData.home_page_data.callToAction.email;

  return (
    <div className='min-h-screen relative pt-20 md:pt-32 pb-20 px-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12 relative'
        >
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-3xl -z-10' />
          <h1 className='text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'>
            Resume
          </h1>
          <Button
            onClick={handleDownload}
            size='lg'
            className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/20'
            disabled={
              generatePdfMutation.isPending ||
              isDownloadingUploaded ||
              (resume.pdf_source === "uploaded" && !resume.resume_url)
            }
          >
            {generatePdfMutation.isPending || isDownloadingUploaded ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Download className='mr-2' size={20} />
            )}
            {generatePdfMutation.isPending
              ? "Generating..."
              : isDownloadingUploaded
              ? "Downloading..."
              : "Download PDF"}
          </Button>
        </motion.div>

        {/* Resume Content */}
        <div className='space-y-8'>
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard
              variant='gradient'
              className='p-8 relative overflow-hidden'
            >
              <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent' />
              <div className='text-center mb-6'>
                <h2 className='text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent'>
                  {fullName}
                </h2>
                <h3 className='text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4'>
                  {resume.title}
                </h3>
                <div className='flex flex-wrap justify-center gap-4 text-foreground/70'>
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center'>
                      <Mail size={14} className='text-primary' />
                    </div>
                    {contactEmail}
                  </div>
                  {resume.location && (
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center'>
                        <MapPin size={14} className='text-secondary' />
                      </div>
                      {resume.location}
                    </div>
                  )}
                </div>
              </div>
              <p className='text-foreground/80 text-center max-w-3xl mx-auto leading-loose'>
                {resume.summary}
              </p>
            </GlassCard>
          </motion.div>

          <div className='grid lg:grid-cols-3 gap-8'>
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Experience */}
              {workHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <GlassCard variant='gradient' className='p-8'>
                    <div className='mb-6 flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center'>
                        <div className='w-5 h-5 rounded-lg bg-gradient-to-br from-primary to-primary/80' />
                      </div>
                      <h3 className='text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                        Professional Experience
                      </h3>
                    </div>
                    <div className='space-y-6'>
                      {workHistory.map((exp) => (
                        <div
                          key={exp.id}
                          className='border-l-2 border-gradient-to-b from-primary to-secondary pl-6 relative'
                        >
                          <div className='absolute -left-2 top-0 w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary' />
                          <div className='flex flex-wrap items-center justify-between mb-2'>
                            <h4 className='text-xl font-semibold'>
                              {exp.position}
                            </h4>
                            <div className='flex items-center gap-1.5 text-foreground/60 text-sm'>
                              <Calendar size={14} />
                              {formatDateRange(
                                exp.start_date,
                                exp.end_date || undefined,
                                exp.is_current
                              )}
                            </div>
                          </div>
                          <p className='bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-medium mb-1'>
                            {exp.company}
                          </p>
                          {exp.location && (
                            <p className='text-foreground/60 text-sm mb-3'>
                              {exp.location}
                            </p>
                          )}
                          <ul className='space-y-2 text-foreground/80'>
                            {exp.description?.map((item, i) => (
                              <li key={i} className='flex items-start'>
                                <span className='w-1.5 h-1.5 bg-gradient-to-br from-secondary to-accent rounded-full mt-2.5 mr-3 shrink-0' />
                                <span className='leading-relaxed'>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Featured Projects */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <GlassCard variant='gradient' className='p-8'>
                  <div className='mb-6 flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center'>
                      <div className='w-5 h-5 rounded-lg bg-gradient-to-br from-secondary to-secondary/80' />
                    </div>
                    <h3 className='text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent'>
                      Featured Projects
                    </h3>
                  </div>
                  <div className='space-y-4'>
                    {resume.project_ids.map((projectId) => {
                      const project = projects?.find((p) => p.id === projectId);
                      if (!project) return null;

                      return (
                        <div
                          key={projectId}
                          className='border border-glass-border/30 rounded-xl p-5 hover:border-primary/50 transition-all bg-gradient-to-br from-glass-bg/10 to-transparent'
                        >
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent'>
                              {project.title}
                            </h4>
                            {project.demo_url && (
                              <a
                                href={project.demo_url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center hover:from-primary/30 hover:to-primary/20 transition-all'
                              >
                                <ExternalLink
                                  size={14}
                                  className='text-primary'
                                />
                              </a>
                            )}
                          </div>
                          <p className='text-foreground/70 text-sm mb-4 leading-relaxed'>
                            {project.description}
                          </p>
                          <div className='flex flex-wrap gap-2'>
                            {project.tech.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className='px-2.5 py-1 text-xs rounded-full bg-gradient-to-r from-glass-bg/30 to-glass-bg/20 border border-glass-border/30 text-foreground/70'
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
                <GlassCard variant='gradient' className='p-6'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center'>
                      <div className='w-4 h-4 rounded bg-gradient-to-br from-accent to-accent/80' />
                    </div>
                    <h3 className='text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent'>
                      Skills
                    </h3>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {resume.skills.map((skill) => (
                      <span
                        key={skill}
                        className='px-3 py-2 text-sm rounded-full bg-gradient-to-r from-glass-bg/30 to-glass-bg/20 border border-glass-border/30 text-foreground/80 hover:border-accent/50 transition-all'
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
                <GlassCard variant='gradient' className='p-6'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center'>
                      <div className='w-4 h-4 rounded bg-gradient-to-br from-secondary to-secondary/80' />
                    </div>
                    <h3 className='text-xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent'>
                      Education
                    </h3>
                  </div>
                  <div className='space-y-4'>
                    {resume.education.map((edu, index) => (
                      <div
                        key={index}
                        className='border-l-2 border-secondary/30 pl-4'
                      >
                        <h4 className='font-semibold text-foreground'>
                          {edu.degree}
                        </h4>
                        <p className='text-foreground/70'>{edu.school}</p>
                        <p className='text-foreground/60 text-sm'>{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Certifications */}
              {resume.certifications && resume.certifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <GlassCard variant='gradient' className='p-6'>
                    <div className='mb-4 flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center'>
                        <Award size={16} className='text-primary' />
                      </div>
                      <h3 className='text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                        Certifications
                      </h3>
                    </div>
                    <div className='space-y-4'>
                      {resume.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className='border-l-2 border-primary/30 pl-4'
                        >
                          <h4 className='font-semibold flex items-center text-foreground'>
                            {cert.name}
                          </h4>
                          <p className='text-foreground/70 text-sm'>
                            {cert.issuer}
                          </p>
                          <div className='flex items-center justify-between text-foreground/60 text-sm mt-1'>
                            <div className='flex items-center gap-1'>
                              <Calendar size={12} />
                              {cert.date}
                            </div>
                            {cert.url && (
                              <a
                                href={cert.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-primary hover:text-primary-glow flex items-center gap-1'
                              >
                                View <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
