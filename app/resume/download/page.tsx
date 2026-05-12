"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Loader2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { getActiveResume } from "@/lib/resumes";
import { getProjects } from "@/lib/projects";
import { getProfileData } from "@/lib/profile";
import { getVisibleWorkExperiences } from "@/lib/work-experiences";
import { getEffectiveDomain } from "@/lib/utils";
// import { toast } from "react-toastify";

export default function ResumeDownloadPage() {
  const [hostname, setHostname] = useState("");
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const { data: projects } = useQuery({
    queryKey: ["projects", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve([]);
      return getProjects(domain);
    },
    enabled: !!hostname && !!profileData,
  });

  const { data: workHistory = [] } = useQuery({
    queryKey: ["work-experiences", hostname],
    queryFn: () => {
      const domain = getEffectiveDomain(hostname);
      if (!domain) return Promise.resolve([]);
      return getVisibleWorkExperiences(domain);
    },
    enabled: !!hostname && !!profileData,
  });

  // Reset generated PDF when data changes
  useEffect(() => {
    setGeneratedPdfUrl(null);
  }, [resume, profileData, projects, workHistory]);

  // Generate the PDF on page load or when data changes
  useEffect(() => {
    if (resume && profileData && projects && !generatedPdfUrl && !isGenerating) {
      const generatePdf = async () => {
        setIsGenerating(true);
        try {
          const response = await fetch("/api/generate-resume-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume,
              profile: profileData,
              projects,
              workExperiences: workHistory,
            }),
          });

          if (!response.ok) throw new Error("Failed to generate PDF");

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setGeneratedPdfUrl(url);
        } catch (error) {
          console.error("Error generating PDF:", error);
        } finally {
          setIsGenerating(false);
        }
      };

      generatePdf();
    }

    return () => {
      if (generatedPdfUrl) URL.revokeObjectURL(generatedPdfUrl);
    };
  }, [resume, profileData, projects, workHistory, generatedPdfUrl, isGenerating]);

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isLoading = isLoadingProfile || isLoadingResume;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Resume data not found.</p>
      </div>
    );
  }

  const fileNameBase = (profileData?.full_name || "Resume").replace(/\s+/g, "-");

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/resume" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="mr-2" size={16} /> Back to Resume
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Download Your Resume</h1>
          <p className="text-foreground/60">Choose between the auto-generated ATS version or the original PDF.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Generated Resume */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="text-primary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">ATS-Friendly Version</h2>
                    <p className="text-xs text-foreground/50">Auto-generated from your profile</p>
                  </div>
                </div>
                {generatedPdfUrl && (
                  <Button
                    size="sm"
                    onClick={() => handleDownload(generatedPdfUrl, `${fileNameBase}-ATS.pdf`)}
                  >
                    <Download size={16} className="mr-2" /> Download
                  </Button>
                )}
              </div>

              <div className="flex-1 bg-foreground/5 rounded-xl border border-foreground/10 overflow-hidden min-h-[800px] relative">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Generating your resume...</p>
                  </div>
                ) : generatedPdfUrl ? (
                  <iframe
                    src={`${generatedPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-none"
                    title="Generated Resume Preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                    <p className="text-foreground/40">Failed to load preview. You can still try to download if available.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Uploaded Resume */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <FileText className="text-secondary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Original PDF</h2>
                    <p className="text-xs text-foreground/50">Your custom designed resume</p>
                  </div>
                </div>
                {resume.resume_url && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(resume.resume_url!, `${fileNameBase}-Original.pdf`)}
                  >
                    <Download size={16} className="mr-2" /> Download
                  </Button>
                )}
              </div>

              <div className="flex-1 bg-foreground/5 rounded-xl border border-foreground/10 overflow-hidden min-h-[800px] relative">
                {resume.resume_url ? (
                  <iframe
                    src={`${resume.resume_url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-none"
                    title="Uploaded Resume Preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-foreground/5">
                    <FileText className="text-foreground/10 mb-4" size={64} />
                    <h3 className="text-lg font-medium mb-2">No Original PDF</h3>
                    <p className="text-sm text-foreground/40 max-w-[240px]">
                      The user hasn&apos;t uploaded a custom PDF version of this resume yet.
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
