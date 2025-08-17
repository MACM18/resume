"use client";
import { motion } from "framer-motion";
import { Download, Mail, MapPin, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getActiveResume } from "@/lib/resumes";
import { getProjects } from "@/lib/projects";
import { getProfileData } from "@/lib/profile";
import { Project } from "@/types/portfolio";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";

const ResumePageSkeleton = () => (
  <div className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto">
    <div className="text-center mb-12">
      <Skeleton className="h-16 w-1/2 mx-auto mb-6" />
      <Skeleton className="h-12 w-48 mx-auto" />
    </div>
    <Skeleton className="h-48 w-full mb-8" />
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);

const Resume = () => {
  const [hostname, setHostname] = useState("");

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
    enabled: !!profileData,
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["projects", hostname],
    queryFn: () => getProjects(hostname),
    enabled: !!profileData,
  });

  const generatePdfMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-resume", {
        body: { resume, profile: profileData, projects },
        responseType: 'blob'
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (pdfBlob) => {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${resume?.role || 'download'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded!");
    },
    onError: (error: any) => {
      toast.error(`Failed to generate PDF: ${error.message}`);
    },
  });

  const handleDownload = () => {
    if (!resume) return;
    if (resume.pdf_source === 'generated') {
      generatePdfMutation.mutate();
    } else if (resume.resume_url) {
      window.open(resume.resume_url, '_blank');
    } else {
      toast.error("No PDF available for download.");
    }
  };

  const isLoading = isLoadingProfile || (profileData && (isLoadingResume || isLoadingProjects));

  if (isLoading) {
    return <ResumePageSkeleton />;
  }

  if (!profileData || !resume) {
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
    <div className='min-h-screen relative pt-24 pb-32 md:pb-12 px-6'>
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
            disabled={generatePdfMutation.isPending || (resume.pdf_source === 'uploaded' && !resume.resume_url)}
          >
            {generatePdfMutation.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Download className='mr-2' size={20} />
            )}
            {generatePdfMutation.isPending ? 'Generating...' : 'Download PDF'}
          </Button>
        </motion.div>
        {/* ... rest of the page content */}
      </div>
    </div>
  );
};

export default Resume;