"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppWindow, ImageIcon, Move, UserRound, Wallpaper } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getCurrentUserProfile } from "@/lib/profile";
import { ProfileForm } from "./ProfileForm";
import { ProfileImageManager } from "./ProfileImageManager";
import { AdvancedAvatarEditor } from "./AdvancedAvatarEditor";
import { BackgroundManager } from "./BackgroundManager";
import { FaviconManager } from "./FaviconManager";

type ProfileSection = "details" | "photos" | "avatar" | "background" | "favicon";

const sections = [
  { id: "details", label: "Identity", description: "Name and professional headline", icon: UserRound },
  { id: "photos", label: "Profile photos", description: "Upload and choose an image", icon: ImageIcon },
  { id: "avatar", label: "Avatar crop", description: "Position and zoom", icon: Move },
  { id: "background", label: "Background", description: "Site background image", icon: Wallpaper },
  { id: "favicon", label: "Site icon", description: "Browser tab favicon", icon: AppWindow },
] as const;

export function ProfileManagement() {
  const { session } = useAuth();
  const [active, setActive] = useState<ProfileSection>("details");
  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: getCurrentUserProfile,
    enabled: !!session?.user?.id,
  });
  const current = sections.find((section) => section.id === active) || sections[0];

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Profile settings" className="h-fit rounded-xl border border-border bg-card p-2 lg:sticky lg:top-5">
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setActive(id)} aria-current={active === id ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active === id ? "bg-primary/12 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <Icon size={17} aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
      </nav>

      <section aria-labelledby="profile-setting-title" className="min-w-0 rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 id="profile-setting-title" className="text-lg font-semibold">{current.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
        </div>
        <div className="min-w-0 p-4 sm:p-6">
          {active === "details" && <ProfileForm />}
          {active === "photos" && <ProfileImageManager />}
          {active === "avatar" && <AdvancedAvatarEditor currentAvatarUrl={profile?.avatar_url || null} currentPosition={profile?.avatar_position} currentZoom={profile?.avatar_zoom} />}
          {active === "background" && <BackgroundManager />}
          {active === "favicon" && <FaviconManager />}
        </div>
      </section>
    </div>
  );
}
