"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import type { Profile, Project, Resume, WorkExperience } from "@/types/portfolio";

export default function ResumeDownloadClient({
  initialProfile,
  initialResume,
  initialProjects,
  initialWork,
}: {
  initialProfile: Profile;
  initialResume: Resume | null;
  initialProjects: Project[];
  initialWork: WorkExperience[];
}) {
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(Boolean(initialResume));
  const generationStarted = useRef(false);

  useEffect(() => {
    if (!initialResume || generationStarted.current) return;

    generationStarted.current = true;
    let cancelled = false;
    let objectUrl: string | null = null;

    const generatePdf = async () => {
      try {
        const response = await fetch("/api/generate-resume-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: initialResume,
            profile: initialProfile,
            projects: initialProjects,
            workExperiences: initialWork,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate the ATS resume");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setGeneratedPdfUrl(objectUrl);
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
        if (!cancelled) {
          setGenerationError("The ATS preview could not be generated. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    };

    void generatePdf();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [initialProfile, initialResume, initialProjects, initialWork]);

  const handleDownload = (url: string, filename: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  if (!initialResume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Resume data not found.</p>
      </div>
    );
  }

  const fileNameBase = (initialProfile.full_name || "Resume").replace(/\s+/g, "-");

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

              <div className="flex-1 bg-foreground/5 rounded-xl border border-foreground/10 overflow-hidden h-[800px] relative">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Generating your resume...</p>
                  </div>
                ) : generatedPdfUrl ? (
                  <iframe
                    src={`${generatedPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="absolute inset-0 w-full h-full border-none"
                    title="Generated Resume Preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                    <p className="text-foreground/40">
                      {generationError || "Failed to load preview. You can still try again later."}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

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
                {initialResume.resume_url && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(initialResume.resume_url!, `${fileNameBase}-Original.pdf`)}
                  >
                    <Download size={16} className="mr-2" /> Download
                  </Button>
                )}
              </div>

              <div className="flex-1 bg-foreground/5 rounded-xl border border-foreground/10 overflow-hidden h-[1000px] relative">
                {initialResume.resume_url ? (
                  <iframe
                    src={`${initialResume.resume_url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="absolute inset-0 w-full h-full border-none"
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
