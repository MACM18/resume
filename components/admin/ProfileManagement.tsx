"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, ChevronDown, ChevronUp } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import { ProfileImageManager } from "./ProfileImageManager";
import { AdvancedAvatarEditor } from "./AdvancedAvatarEditor";
import { BackgroundManager } from "./BackgroundManager";
import dynamic from "next/dynamic";

// lazy load the GradientPicker (it's client-only)
const GradientPicker = dynamic(() => import("./GradientPicker"), {
  ssr: false,
});

import { FaviconManager } from "./FaviconManager";
import { normalizeDomain } from "@/lib/utils";
import { getCurrentUserProfile } from "@/lib/profile";
import { motion, AnimatePresence } from "framer-motion";

export function ProfileManagement() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [hostname, setHostname] = useState("");
  const [openSections, setOpenSections] = useState({
    domain: true,
    profile: true,
    images: false,
    avatarPosition: false,
    background: false,
    gradient: false,
    favicon: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const profile = await getCurrentUserProfile();
      return profile;
    },
    enabled: !!session,
  });

  const claimDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      if (!session) throw new Error("Not authenticated");

      const normalizedDomain = normalizeDomain(domain);

      const checkResponse = await fetch(
        `/api/profile/by-domain?domain=${encodeURIComponent(normalizedDomain)}`
      );
      if (checkResponse.ok) {
        const existing = await checkResponse.json();
        if (existing && existing.id && existing.user_id !== session.user?.id) {
          throw new Error("This domain is already claimed by another user.");
        }
      }

      const updateResponse = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: normalizedDomain }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || "Failed to claim domain");
      }
    },
    onSuccess: () => {
      toast.success(`Domain ${hostname} claimed successfully!`);
      queryClient.invalidateQueries({
        queryKey: ["profile", session?.user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["profileData", hostname] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(`Failed to claim domain: ${error.message}`);
      } else {
        toast.error("Failed to claim domain.");
      }
    },
  });

  const isDomainClaimed = profile?.domain === hostname;

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
          Profile & Domain
        </h2>
        <p className='text-foreground/60'>
          Manage your portfolio identity and assets
        </p>
      </div>

      <Section
        id='domain'
        title='Domain Setup'
        description='Connect this domain to your portfolio'
      >
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1 p-3 border border-foreground/20 rounded-lg bg-foreground/5 font-mono text-sm'>
            {hostname}
          </div>
          {isDomainClaimed ? (
            <div className='flex items-center text-green-500 font-medium'>
              ✓ Domain claimed
            </div>
          ) : (
            <Button
              onClick={() => claimDomainMutation.mutate(hostname)}
              disabled={claimDomainMutation.isPending}
              className='whitespace-nowrap'
            >
              <LinkIcon className='mr-2' size={16} />
              {claimDomainMutation.isPending ? "Claiming..." : "Claim Domain"}
            </Button>
          )}
        </div>
      </Section>

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

      <Section
        id={"gradient"}
        title='Background Gradient'
        description='Pick a subtle site-wide gradient overlay'
      >
        <GradientPicker />
      </Section>

      <Section id='favicon' title='Favicon' description='Upload your site icon'>
        <FaviconManager />
      </Section>
    </div>
  );
}
