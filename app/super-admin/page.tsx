"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/lib/profile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { UserPlus } from "lucide-react";
import { UserInvitationForm } from "@/components/admin/UserInvitationForm";

const SuperAdminPage = () => {
  const router = useRouter();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
  });

  useEffect(() => {
    if (!isLoading && profile?.domain !== "www.macm.dev") {
      toast.error("Access Denied");
      router.push("/admin");
    }
  }, [profile, isLoading, router]);

  if (isLoading || profile?.domain !== "www.macm.dev") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-24 pb-32 md:pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
          Super Admin
        </h1>
        <GlassCard className="p-6">
          <div className="flex items-center mb-4">
            <UserPlus className="mr-3 text-primary" size={24} />
            <h2 className="text-2xl font-bold text-primary">
              Invite New User
            </h2>
          </div>
          <p className="text-foreground/70 mb-6">
            Send an invitation email to a new user and assign a domain for their portfolio.
          </p>
          <UserInvitationForm />
        </GlassCard>
      </div>
    </div>
  );
};

export default SuperAdminPage;