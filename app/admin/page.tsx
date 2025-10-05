"use client";

import { useSupabase } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ProjectManagement } from "@/components/admin/ProjectManagement";
import { ProfileManagement } from "@/components/admin/ProfileManagement";
import { HomePageForm } from "@/components/admin/HomePageForm";
import { AboutPageForm } from "@/components/admin/AboutPageForm";
import { ResumeManagement } from "@/components/admin/ResumeManagement";
import { ResumeManager } from "@/components/admin/ResumeManager";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { WorkExperienceManagement } from "@/components/admin/WorkExperienceManagement";
import {
  User,
  Palette,
  Home,
  Info,
  FolderKanban,
  Briefcase,
  FileText,
} from "lucide-react";

const ADMIN_ITEMS = [
  { value: "profile", label: "Profile & Domain", icon: User },
  { value: "theme", label: "Theme", icon: Palette },
  { value: "home", label: "Home Page", icon: Home },
  { value: "about", label: "About Page", icon: Info },
  { value: "projects", label: "Projects", icon: FolderKanban },
  { value: "work", label: "Work Experience", icon: Briefcase },
  { value: "resumes", label: "Resumes", icon: FileText },
] as const;

const AdminPage = () => {
  const { session } = useSupabase();
  const router = useRouter();
  const [section, setSection] = useState("profile");

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {ADMIN_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton
                        onClick={() => setSection(item.value)}
                        isActive={section === item.value}
                        aria-current={
                          section === item.value ? "page" : undefined
                        }
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className='min-h-screen relative pt-24 pb-32 md:pb-12 px-6'>
          <div className='max-w-4xl mx-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent'>
                Admin Dashboard
              </h1>
              <SidebarTrigger className='md:hidden' />
            </div>
            <GlassCard hover={false}>
              <div className='p-6'>
                {section === "profile" && <ProfileManagement />}
                {section === "theme" && (
                  <div className='max-h-[70vh] overflow-y-auto'>
                    <ThemeEditor />
                  </div>
                )}
                {section === "home" && (
                  <div className='max-h-[70vh] overflow-y-auto'>
                    <HomePageForm />
                  </div>
                )}
                {section === "about" && (
                  <div className='max-h-[70vh] overflow-y-auto'>
                    <AboutPageForm />
                  </div>
                )}
                {section === "projects" && <ProjectManagement />}
                {section === "work" && <WorkExperienceManagement />}
                {section === "resumes" && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <ResumeManagement />
                    </div>
                    <div>
                      <ResumeManager />
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminPage;
