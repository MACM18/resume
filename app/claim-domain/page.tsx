"use client";

import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { motion } from "framer-motion";
import { ClaimDomainForm } from "@/components/admin/ClaimDomainForm";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/lib/profile";
import { useSupabase } from "@/components/providers/AuthProvider";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const ClaimDomainPage = () => {
  const router = useRouter();
  const { session } = useSupabase();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
    enabled: !!session,
  });

  useEffect(() => {
    if (!isLoading && profile?.domain) {
      // If user already has a domain, send them to the admin page
      router.push("/admin");
    }
  }, [profile, isLoading, router]);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">One Last Step</h1>
          <p className="text-foreground/70 mb-8">
            Claim the domain where your portfolio will be published.
          </p>
          <ClaimDomainForm />
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ClaimDomainPage;