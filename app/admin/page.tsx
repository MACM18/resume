"use client";

import { useSupabase } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectManagement } from "@/components/admin/ProjectManagement";
import { ProfileManagement } from "@/components/admin/ProfileManagement";
import { HomePageForm } from "@/components/admin/HomePageForm";
import { AboutPageForm } from "@/components/admin/AboutPageForm";
import { ResumeManagement } from "@/components/admin/ResumeManagement";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminPage = () => {
  const { session } = useSupabase();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  const tabs = [
    { value: "profile", label: "Profile & Domain" },
    { value: "theme", label: "Theme" },
    { value: "home", label: "Home Page" },
    { value: "about", label: "About Page" },
    { value: "projects", label: "Projects" },
    { value: "resumes", label: "Resumes" },
  ];

  return (
    <div className="min-h-screen relative pt-24 pb-32 md:pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
          Admin Dashboard
        </h1>
        <GlassCard>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {isMobile ? (
              <div className="p-4">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full bg-glass-bg/20 border-glass-border">
                    <SelectValue placeholder="Select a section to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {tabs.map((tab) => (
                      <SelectItem key={tab.value} value={tab.value}>
                        {tab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <TabsList className="grid w-full grid-cols-6 bg-glass-bg/20">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}

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