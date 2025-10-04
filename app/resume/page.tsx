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
    queryFn: () => getProfileData(hostname),
    enabled: !!hostname,
  });

  const { data: resume, isLoading: isLoadingResume } = useQuery({
    queryKey: ["activeResume", hostname],
    queryFn: () => getActiveResume(hostname),
    enabled: !!hostname && !!profileData,
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["projects", hostname],
    queryFn: () => getProjects(hostname),
    enabled: !!hostname && !!profileData,
  });

  const { data: workHistory = [], isLoading: isLoadingWork } = useQuery({
    queryKey: ["work-experiences", hostname],
    queryFn: () => getVisibleWorkExperiences(hostname),
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
    <div className='min-h-screen relative pt-24 md:pt-40 pb-32 md:pb-12 px-6'>
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
          <Button
            onClick={handleDownload}
            size='lg'
            className='bg-primary hover:bg-primary/90'
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
            <GlassCard className='p-8'>
              <div className='text-center mb-6'>
                <h2 className='text-4xl font-bold mb-2'>{fullName}</h2>
                <h3 className='text-2xl text-primary mb-4'>{resume.title}</h3>
                <div className='flex flex-wrap justify-center gap-4 text-foreground/70'>
                  <div className='flex items-center'>
                    <Mail size={16} className='mr-2' />
                    {contactEmail}
                  </div>
                  {resume.location && (
                    <div className='flex items-center'>
                      <MapPin size={16} className='mr-2' />
                      {resume.location}
                    </div>
                  )}
                </div>
              </div>
              <p className='text-foreground/80 text-center max-w-3xl mx-auto leading-relaxed'>
                {resume.summary}
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
                    {workHistory.map((exp) => (
                      <div
                        key={exp.id}
                        className='border-l-2 border-primary/30 pl-6'
                      >
                        <div className='flex flex-wrap items-center justify-between mb-2'>
                          <h4 className='text-xl font-semibold'>
                            {exp.position}
                          </h4>
                          <div className='flex items-center text-foreground/60'>
                            <Calendar size={16} className='mr-1' />
                            {new Date(
                              exp.start_date
                            ).toLocaleDateString()} –{" "}
                            {exp.is_current || !exp.end_date
                              ? "Present"
                              : new Date(exp.end_date).toLocaleDateString()}
                          </div>
                        </div>
                        <p className='text-primary mb-1'>{exp.company}</p>
                        {exp.location && (
                          <p className='text-foreground/60 text-sm mb-2'>
                            {exp.location}
                          </p>
                        )}
                        <ul className='space-y-2 text-foreground/80'>
                          {exp.description?.map((item, i) => (
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
                    {resume.project_ids.map((projectId) => {
                      const project = projects?.find((p) => p.id === projectId);
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
                            {project.demo_url && (
                              <a
                                href={project.demo_url}
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
                    {resume.skills.map((skill) => (
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
                    {resume.education.map((edu, index) => (
                      <div key={index}>
                        <h4 className='font-semibold'>{edu.degree}</h4>
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
                  <GlassCard className='p-6'>
                    <h3 className='text-xl font-bold mb-4 text-primary'>
                      Certifications
                    </h3>
                    <div className='space-y-4'>
                      {resume.certifications.map((cert, index) => (
                        <div key={index}>
                          <h4 className='font-semibold flex items-center'>
                            <Award size={16} className='mr-2 text-primary' />
                            {cert.name}
                          </h4>
                          <p className='text-foreground/70'>{cert.issuer}</p>
                          <div className='flex items-center text-foreground/60 text-sm'>
                            <Calendar size={14} className='mr-1' />
                            {cert.date}
                            {cert.url && (
                              <a
                                href={cert.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='ml-auto text-primary hover:text-primary-glow flex items-center'
                              >
                                View <ExternalLink size={14} className='ml-1' />
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
