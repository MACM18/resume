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
import { FaviconManager } from "./FaviconManager";
import { normalizeDomain } from "@/lib/utils";
import { getCurrentUserProfile } from "@/lib/profile";
import { motion, AnimatePresence } from "framer-motion";

export function ProfileManagement() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [hostname, setHostname] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [openSections, setOpenSections] = useState({
    domain: true,
    profile: true,
    images: false,
    avatarPosition: false,
    background: false,
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

  const isDomainClaimed = profile?.domains?.some(d => d.domain === hostname) || profile?.domain === hostname;

  const removeDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      // In a real app we'd have a specific endpoint to remove a domain,
      // but for this example we can keep it simple or implement it later.
      // Assuming we have a /api/profile/domains route
      const res = await fetch("/api/profile/domains", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) throw new Error("Failed to remove domain");
    },
    onSuccess: () => {
      toast.success("Domain removed");
      queryClient.invalidateQueries({ queryKey: ["profile", session?.user?.id] });
    },
    onError: () => toast.error("Failed to remove domain"),
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
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 p-3 border border-foreground/20 rounded-lg bg-foreground/5 font-mono text-sm flex items-center justify-between'>
              <span>Current Host: {hostname}</span>
              {isDomainClaimed ? (
                <span className='text-green-500 font-medium text-xs'>✓ Connected</span>
              ) : null}
            </div>
            {!isDomainClaimed && (
              <Button
                onClick={() => claimDomainMutation.mutate(hostname)}
                disabled={claimDomainMutation.isPending}
                className='whitespace-nowrap'
              >
                <LinkIcon className='mr-2' size={16} />
                {claimDomainMutation.isPending ? "Claiming..." : "Connect This Domain"}
              </Button>
            )}
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Connected Domains</h4>
            {profile?.domains && profile.domains.length > 0 ? (
              <ul className="space-y-2">
                {profile.domains.map((d) => (
                  <li key={d.domain} className="flex justify-between items-center p-3 border rounded-lg bg-background">
                    <div className="flex items-center gap-2">
                      <code className="text-sm">{d.domain}</code>
                      {d.isPrimary && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Primary</span>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeDomainMutation.mutate(d.domain)}
                      disabled={removeDomainMutation.isPending && removeDomainMutation.variables === d.domain}
                      className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Only using primary domain or none connected yet.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="subdomain.example.com" 
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1 p-2 border rounded-md text-sm"
            />
            <Button
              onClick={() => {
                if (newDomain) {
                  claimDomainMutation.mutate(newDomain);
                  setNewDomain("");
                }
              }}
              disabled={claimDomainMutation.isPending || !newDomain}
              variant="secondary"
            >
              Add Domain
            </Button>
          </div>
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

      <Section id='favicon' title='Favicon' description='Upload your site icon'>
        <FaviconManager />
      </Section>
    </div>
  );
}
