"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import { ProfileImageManager } from "./ProfileImageManager";
import { BackgroundManager } from "./BackgroundManager"; // Import the new component
import { FaviconManager } from "./FaviconManager";
import { normalizeDomain } from "@/lib/utils";
import { getCurrentUserProfile } from "@/lib/profile";

export function ProfileManagement() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [hostname, setHostname] = useState("");

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

      // Normalize domain for consistent storage and lookup
      const normalizedDomain = normalizeDomain(domain);

      // Check if domain is already taken via API
      const checkResponse = await fetch(
        `/api/profile/by-domain?domain=${encodeURIComponent(normalizedDomain)}`
      );
      if (checkResponse.ok) {
        const existing = await checkResponse.json();
        if (existing && existing.id && existing.user_id !== session.user?.id) {
          throw new Error("This domain is already claimed by another user.");
        }
      }

      // Update profile with new domain via API
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

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold text-primary mb-4'>Your Domain</h2>
        <div className='flex items-center gap-4'>
          <div className='flex-1 p-2 border border-glass-border rounded-md bg-glass-bg/20'>
            <code>{hostname}</code>
          </div>
          {isDomainClaimed ? (
            <p className='text-green-400'>
              This domain is linked to your profile.
            </p>
          ) : (
            <Button
              onClick={() => claimDomainMutation.mutate(hostname)}
              disabled={claimDomainMutation.isPending}
            >
              <LinkIcon className='mr-2' size={16} />
              {claimDomainMutation.isPending
                ? "Claiming..."
                : "Claim this Domain"}
            </Button>
          )}
        </div>
      </div>
      <div>
        <h2 className='text-2xl font-bold text-primary mb-4'>Your Profile</h2>
        <ProfileForm />
      </div>
      <div>
        <ProfileImageManager />
      </div>
      <div>
        <BackgroundManager /> {/* New Background Image Manager */}
      </div>
      <div>
        <FaviconManager />
      </div>
    </div>
  );
}
