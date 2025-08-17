"use client";

import { useSupabase } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectManagement } from "@/components/admin/ProjectManagement";
import { ProfileManagement } from "@/components/admin/ProfileManagement";
import { HomePageForm } from "@/components/admin/HomePageForm";
import { AboutPageForm } from "@/components/admin/AboutPageForm";
import { ResumeManagement } from "@/components/admin/ResumeManagement";
import { ThemeEditor } from "@/components/admin/ThemeEditor";

const AdminPage = () => {
  const { session } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen relative pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
          Admin Dashboard
        </h1>
        <GlassCard>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-glass-bg/20">
              <TabsTrigger value="profile">Profile & Domain</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="home">Home Page</TabsTrigger>
              <TabsTrigger value="about">About Page</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="resumes">Resumes</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="p-6">
              <ProfileManagement />
            </TabsContent>
            <TabsContent value="theme" className="p-6 max-h-[70vh] overflow-y-auto">
              <ThemeEditor />
            </TabsContent>
            <TabsContent value="home" className="p-6 max-h-[70vh] overflow-y-auto">
              <HomePageForm />
            </TabsContent>
            <TabsContent value="about" className="p-6 max-h-[70vh] overflow-y-auto">
              <AboutPageForm />
            </TabsContent>
            <TabsContent value="projects" className="p-6">
              <ProjectManagement />
            </TabsContent>
            <TabsContent value="resumes" className="p-6">
              <ResumeManagement />
            </TabsContent>
          </Tabs>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminPage;