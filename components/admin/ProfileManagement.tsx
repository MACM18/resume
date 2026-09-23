"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProfileForm } from "./ProfileForm";
import { ProfileImageManager } from "./ProfileImageManager";
import { AdvancedAvatarEditor } from "./AdvancedAvatarEditor";
import { BackgroundManager } from "./BackgroundManager";
import { FaviconManager } from "./FaviconManager";
import { getCurrentUserProfile } from "@/lib/profile";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ProfileManagement() {
  const { session } = useAuth();
  const [openSections, setOpenSections] = useState({
    profile: true,
    images: false,
    avatarPosition: false,
    background: false,
    favicon: false,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const profile = await getCurrentUserProfile();
      return profile;
    },
    enabled: !!session,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => {
      // If clicking the already-open section, close it
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      // Otherwise, close all others and open this one
      const allClosed = Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {} as typeof prev
      );
      return { ...allClosed, [section]: true };
    });
  };

  const Section = ({
    id,
    title,
    description,
    children,
  }: {
    id: keyof typeof openSections;
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div className='border border-foreground/10 rounded-xl overflow-hidden'>
      <button
        onClick={() => toggleSection(id)}
        className='w-full flex items-center justify-between p-4 md:p-6 bg-foreground/5 hover:bg-foreground/10 transition-colors'
      >
        <div className='text-left'>
          <h3 className='text-lg font-semibold'>{title}</h3>
          {description && (
            <p className='text-sm text-foreground/60 mt-1'>{description}</p>
          )}
        </div>
        {openSections[id] ? (
          <ChevronUp size={20} className='text-foreground/60' />
        ) : (
          <ChevronDown size={20} className='text-foreground/60' />
        )}
      </button>
      <AnimatePresence>
        {openSections[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className='overflow-hidden'
          >
            <div className='p-4 md:p-6 border-t border-foreground/10'>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className='space-y-4'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-bold mb-2'>
          Profile
        </h2>
        <p className='text-foreground/60'>
          Manage your portfolio identity and assets
        </p>
      </div>

      <Section
        id='profile'
        title='Basic Information'
        description='Your name and professional tagline'
      >
        <ProfileForm />
      </Section>

      <Section
        id='images'
        title='Profile Images'
        description='Upload and manage your profile photos'
      >
        <ProfileImageManager />
      </Section>

      <Section
        id='avatarPosition'
        title='Avatar Position & Zoom'
        description='Adjust how your avatar appears in the circle'
      >
        <AdvancedAvatarEditor
          currentAvatarUrl={profile?.avatar_url || null}
          currentPosition={profile?.avatar_position}
          currentZoom={profile?.avatar_zoom}
        />
      </Section>

      <Section
        id='background'
        title='Background Image'
        description='Set a custom background for your portfolio'
      >
        <BackgroundManager />
      </Section>

      <Section id='favicon' title='Favicon' description='Upload your site icon'>
        <FaviconManager />
      </Section>
    </div>
  );
}
