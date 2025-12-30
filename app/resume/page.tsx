"use client";
import { motion } from "framer-motion";
import {
  Download,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  Loader2,
  Award,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getActiveResume } from "@/lib/resumes";
import { getProjects } from "@/lib/projects";
import { getProfileData } from "@/lib/profile";
import { getVisibleWorkExperiences } from "@/lib/work-experiences";
import { Project } from "@/types/portfolio";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { DomainNotClaimed } from "@/components/DomainNotClaimed";
import { formatDateRange, getEffectiveDomain } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section-header";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AboutPageSkeleton } from "@/components/ui/loading-skeleton";

const ResumePageSkeleton = AboutPageSkeleton;

const Resume = () => {
  const [hostname, setHostname] = useState("");
  const [isDownloadingUploaded, setIsDownloadingUploaded] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

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
    <ErrorBoundary>
      <div className='min-h-screen relative pb-20'>
        {/* Hero Section */}
        <section className='pt-32 pb-12 px-6'>
          <div className='max-w-7xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-center max-w-3xl mx-auto mb-12'
            >
              <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight'>
                Resume
              </h1>
              <p className='text-xl md:text-2xl text-foreground/60 font-light mb-8'>
                {resume.title || resume.role}
              </p>
              <Button
                onClick={handleDownload}
                size='lg'
                className='px-8 py-6 text-lg'
                disabled={
                  generatePdfMutation.isPending ||
                  isDownloadingUploaded ||
                  (resume.pdf_source === "uploaded" && !resume.resume_url)
                }
              >
                {generatePdfMutation.isPending || isDownloadingUploaded ? (
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
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
          </div>
        </section>

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid lg:grid-cols-3 gap-8'>
            {/* Left Content - 2 columns */}
            <div className='lg:col-span-2 space-y-16'>
              {/* Personal Info */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <GlassCard variant='bordered' className='p-8 md:p-10'>
                  <div className='text-center mb-6'>
                    <h2 className='text-3xl md:text-4xl font-bold mb-2'>
                      {fullName}
                    </h2>
                    <h3 className='text-xl md:text-2xl text-primary mb-4'>
                      {resume.title}
                    </h3>
                    <div className='flex flex-wrap justify-center gap-4 text-sm text-foreground/70'>
                      <div className='flex items-center gap-2'>
                        <Mail size={16} className='text-primary' />
                        {contactEmail}
                      </div>
                      {resume.location && (
                        <div className='flex items-center gap-2'>
                          <MapPin size={16} className='text-primary' />
                          {resume.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className='text-foreground/70 text-center leading-relaxed'>
                    {resume.summary}
                  </p>
                </GlassCard>
              </motion.section>
              {/* Professional Experience */}
              {workHistory.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className='mb-8'>
                    <div className='flex items-center gap-3 mb-2'>
                      <Briefcase className='text-primary' size={20} />
                      <h3 className='text-3xl md:text-4xl font-bold'>
                        Professional Experience
                      </h3>
                    </div>
                    <div className='w-20 h-1 bg-primary ml-8' />
                  </div>

                  <div className='space-y-8'>
                    {workHistory.map((exp, index) => (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                      >
                        <GlassCard variant='minimal' className='p-6 md:p-8'>
                          <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2'>
                            <h4 className='text-xl md:text-2xl font-bold'>
                              {exp.position}
                            </h4>
                            <div className='flex items-center gap-1.5 text-foreground/60 text-sm'>
                              <Calendar size={14} />
                              <span className='whitespace-nowrap'>
                                {formatDateRange(
                                  exp.start_date,
                                  exp.end_date || undefined,
                                  exp.is_current
                                )}
                              </span>
                            </div>
                          </div>
                          <p className='text-primary font-medium mb-2'>
                            {exp.company}
                          </p>
                          {exp.location && (
                            <p className='text-foreground/60 text-sm mb-4 flex items-center gap-1'>
                              <MapPin size={14} />
                              {exp.location}
                            </p>
                          )}
                          <ul className='space-y-3 text-foreground/70'>
                            {exp.description?.map((item, i) => (
                              <li key={i} className='flex items-start gap-3'>
                                <span className='w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2' />
                                <span className='leading-relaxed'>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Featured Projects */}
              {resume.project_ids.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className='mb-8'>
                    <h3 className='text-3xl md:text-4xl font-bold mb-2'>
                      Featured Projects
                    </h3>
                    <div className='w-20 h-1 bg-primary' />
                  </div>

                  <div className='space-y-4'>
                    {resume.project_ids.map((projectId) => {
                      const project = projects?.find((p) => p.id === projectId);
                      if (!project) return null;

                      return (
                        <GlassCard
                          key={projectId}
                          variant='minimal'
                          className='p-6'
                          hover
                        >
                          <div className='flex items-start justify-between mb-3'>
                            <h4 className='text-lg font-semibold'>
                              {project.title}
                            </h4>
                            {project.demo_url && (
                              <a
                                href={project.demo_url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-primary hover:text-primary/80 transition-colors'
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                          <p className='text-foreground/70 text-sm mb-4 leading-relaxed'>
                            {project.description}
                          </p>
                          <div className='flex flex-wrap gap-2'>
                            {project.tech.slice(0, 5).map((tech) => (
                              <span
                                key={tech}
                                className='px-2.5 py-1 text-xs rounded-md bg-foreground/5 border border-foreground/10 text-foreground/70'
                              >
                                {tech}
                              </span>
                            ))}
                            {project.tech.length > 5 && (
                              <span className='px-2.5 py-1 text-xs text-foreground/60'>
                                +{project.tech.length - 5}
                              </span>
                            )}
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Right Sidebar */}
            <div className='space-y-6'>
              {/* PDF Preview */}
              {resume.resume_url && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <GlassCard variant='bordered' className='p-4 sticky top-24'>
                    <h3 className='text-lg font-bold mb-4'>Resume Preview</h3>
                    <div
                      className='aspect-[8.5/11] bg-foreground/5 rounded-lg overflow-hidden border border-foreground/10 cursor-pointer group relative'
                      onClick={() => setShowPdfModal(true)}
                    >
                      <iframe
                        src={`${resume.resume_url}#toolbar=0&navpanes=0&scrollbar=0`}
                        className='w-full h-full pointer-events-none'
                        title='Resume Preview'
                      />
                      <div className='absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100'>
                        <div className='bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium'>
                          Click to expand
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <GlassCard variant='minimal' className='p-6'>
                  <h3 className='text-lg font-bold mb-4'>Skills</h3>
                  <div className='flex flex-wrap gap-2'>
                    {resume.skills.map((skill) => (
                      <span
                        key={skill}
                        className='px-3 py-1.5 text-sm rounded-md bg-foreground/5 border border-foreground/10 text-foreground/80'
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Education */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <GlassCard variant='minimal' className='p-6'>
                  <div className='flex items-center gap-2 mb-4'>
                    <GraduationCap className='text-primary' size={18} />
                    <h3 className='text-lg font-bold'>Education</h3>
                  </div>
                  <div className='space-y-4'>
                    {resume.education.map((edu, index) => (
                      <div
                        key={index}
                        className='border-l-2 border-primary/30 pl-4'
                      >
                        <h4 className='font-semibold text-sm'>{edu.degree}</h4>
                        <p className='text-foreground/70 text-sm'>
                          {edu.school}
                        </p>
                        <div className='flex items-center gap-1 text-foreground/60 text-xs mt-1'>
                          <Calendar size={12} />
                          {edu.year}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Certifications */}
              {resume.certifications && resume.certifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <GlassCard variant='minimal' className='p-6'>
                    <div className='flex items-center gap-2 mb-4'>
                      <Award size={18} className='text-primary' />
                      <h3 className='text-lg font-bold'>Certifications</h3>
                    </div>
                    <div className='space-y-4'>
                      {resume.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className='border-l-2 border-primary/30 pl-4'
                        >
                          <h4 className='font-semibold text-sm'>{cert.name}</h4>
                          <p className='text-foreground/70 text-xs'>
                            {cert.issuer}
                          </p>
                          <div className='flex items-center justify-between text-foreground/60 text-xs mt-1'>
                            <div className='flex items-center gap-1'>
                              <Calendar size={12} />
                              {cert.date}
                            </div>
                            {cert.url && (
                              <a
                                href={cert.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-primary hover:text-primary/80 flex items-center gap-1'
                              >
                                View <ExternalLink size={10} />
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

        {/* PDF Modal */}
        {showPdfModal && resume.resume_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col'
            onClick={() => setShowPdfModal(false)}
          >
            <div className='flex items-center justify-between p-6 border-b border-foreground/10'>
              <h2 className='text-2xl font-bold'>Resume</h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowPdfModal(false)}
              >
                Close
              </Button>
            </div>
            <div className='flex-1 p-6' onClick={(e) => e.stopPropagation()}>
              <iframe
                src={resume.resume_url}
                className='w-full h-full rounded-xl border border-foreground/10'
                title='Resume Full View'
              />
            </div>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Resume;
