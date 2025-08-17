"use client";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Code, Palette, Zap, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProfileData } from "@/lib/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const iconMap = {
  Code,
  Palette,
  Zap,
  Heart,
};

const AboutPageSkeleton = () => (
  <div className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto">
    <div className="text-center mb-16">
      <Skeleton className="h-16 w-1/2 mx-auto mb-6" />
      <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
    </div>
    <Skeleton className="h-64 w-full mb-12" />
    <div className="grid md:grid-cols-2 gap-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  </div>
);

const About = () => {
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
    return <AboutPageSkeleton />;
  }

  if (!profileData || !profileData.about_page_data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <GlassCard className="p-8">
          <h1 className="text-2xl font-bold">About Page Not Available</h1>
          <p className="text-foreground/70 mt-2">
            This page has not been configured yet.
          </p>
        </GlassCard>
      </div>
    );
  }

  const aboutPageData = profileData.about_page_data;
  const contactEmail = profileData.home_page_data.callToAction.email;

  return (
    <div className='min-h-screen relative pt-24 pb-32 md:pb-12 px-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent'>
            {aboutPageData.title}
          </h1>
          <p className='text-xl text-foreground/80 max-w-2xl mx-auto'>
            {aboutPageData.subtitle}
          </p>
        </motion.div>
        {/* ... rest of the page content */}
      </div>
    </div>
  );
};

export default About;