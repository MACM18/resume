"use client";

import { useSupabase } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function AdminPage() {
  const { session } = useSupabase();
  const router = useRouter();
  const [section, setSection] = useState("profile");

  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  if (!session) return null;

  return (
    <div className='min-h-screen relative pt-24 pb-32 md:pb-12 px-6'>
      <div className='mx-auto w-full max-w-6xl'>
        <div className='flex flex-col items-center justify-between mb-6'>
          <h1 className='text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent'>
            Admin Dashboard
          </h1>
          <div className='md:hidden'>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className='w-56 bg-glass-bg/20 border-glass-border'>
                <SelectValue placeholder='Select a section' />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_ITEMS.map((it) => (
                  <SelectItem key={it.value} value={it.value}>
                    {it.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-6 items-stretch'>
          <div className='hidden md:block sticky top-24 self-start z-20'>
            <AdminNav
              items={ADMIN_ITEMS.map((i) => ({
                value: i.value,
                label: i.label,
                icon: i.icon,
              }))}
              active={section}
              onSelect={setSection}
            />
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
    </div>
  );
}
