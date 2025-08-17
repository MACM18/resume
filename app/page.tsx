"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const HomePageSkeleton = () => (
  <div className="min-h-screen pt-24 pb-12 px-6 max-w-6xl mx-auto">
    <div className="text-center mb-16">
      <Skeleton className="h-20 w-3/4 mx-auto mb-6" />
      <Skeleton className="h-8 w-full max-w-3xl mx-auto mb-8" />
      <div className="flex justify-center gap-4">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-8 mb-16">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  </div>
);

export default function Page() {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profileData", hostname],
    queryFn: () => getProfileData(hostname),
    enabled: !!hostname,
  });

  if (isLoading || !hostname) {
    return <HomePageSkeleton />;
  }

  if (!profileData || !profileData.home_page_data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <GlassCard className="p-8">
          <h1 className="text-2xl font-bold">Welcome to Your Portfolio</h1>
          <p className="text-foreground/70 mt-2">
            This domain isn't linked to a profile yet. Log in as an admin to claim it.
          </p>
        </GlassCard>
      </div>
    );
  }

  const homePageData = {
    ...profileData.home_page_data,
    name: profileData.full_name,
    tagline: profileData.tagline,
  };

  return (
    <div className='min-h-screen relative pt-24 pb-32 md:pb-12 px-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className='text-6xl md:text-8xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent'>
              {homePageData.name}
            </h1>
            <p className='text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto'>
              {homePageData.tagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='flex flex-wrap justify-center gap-4 mb-12'
          >
            <Button
              asChild
              size='lg'
              className='bg-primary hover:bg-primary/90 text-primary-foreground'
            >
              <Link href={`/projects`}>
                View Projects <ArrowRight className='ml-2' size={20} />
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='border-glass-border/50 hover:border-primary/50'
            >
              <Link href={`/resume`}>Download Resume</Link>
            </Button>
          </motion.div>
        </div>
        {/* ... rest of the page content */}
      </div>
    </div>
  );
}