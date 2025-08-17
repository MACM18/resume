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

const Projects = () => {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profileData", hostname],
    queryFn: () => getProfileData(hostname),
    enabled: !!hostname,
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects", hostname],
    queryFn: () => getProjects(hostname),
    enabled: !!profileData,
  });

  const isLoading = isLoadingProfile || (profileData && isLoadingProjects);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <GlassCard className="p-8">
          <h1 className="text-2xl font-bold">Projects Not Available</h1>
          <p className="text-foreground/70 mt-2">
            This page has not been configured yet.
          </p>
        </GlassCard>
      </div>
    );
  }

  const featuredProjects = projects?.filter((p) => p.featured) || [];
  const otherProjects = projects?.filter((p) => !p.featured) || [];

  return (
    <div className='min-h-screen relative pt-24 pb-32 md:pb-12 px-6'>
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
        {/* ... rest of the page content */}
      </div>
    </div>
  );
};

export default Projects;