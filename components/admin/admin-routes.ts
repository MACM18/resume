export type AdminIcon = "overview" | "home" | "about" | "projects" | "work" | "resumes" | "gallery" | "profile" | "appearance" | "account";
export type AdminItem = { path: string; label: string; description: string; icon: AdminIcon; preset: string };
export type AdminGroup = { label: string; items: AdminItem[] };

export const adminGroups: AdminGroup[] = [
  {
    label: "Workspace",
    items: [{ path: "/admin", label: "Overview", description: "Site status and next actions", icon: "overview", preset: "overview" }],
  },
  {
    label: "Content",
    items: [
      { path: "/admin/content/home", label: "Home page", description: "Landing page copy and sections", icon: "home", preset: "home" },
      { path: "/admin/content/about", label: "About page", description: "Story, skills and contact details", icon: "about", preset: "about" },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { path: "/admin/portfolio/projects", label: "Projects", description: "Case studies and publication", icon: "projects", preset: "projects" },
      { path: "/admin/portfolio/work", label: "Work experience", description: "Career timeline", icon: "work", preset: "work" },
      { path: "/admin/portfolio/resumes", label: "Resumes", description: "Versions, PDFs and active resume", icon: "resumes", preset: "resumes" },
    ],
  },
  {
    label: "Media",
    items: [{ path: "/admin/media/gallery", label: "Gallery", description: "Photos and albums", icon: "gallery", preset: "gallery" }],
  },
  {
    label: "Settings",
    items: [
      { path: "/admin/settings/profile", label: "Profile & assets", description: "Identity, avatar and site images", icon: "profile", preset: "profile" },
      { path: "/admin/settings/appearance", label: "Appearance", description: "Theme and display mode", icon: "appearance", preset: "theme" },
      { path: "/admin/settings/account", label: "Account", description: "Email and password", icon: "account", preset: "account" },
    ],
  },
];

export const adminItems: AdminItem[] = adminGroups.flatMap((group) => group.items);
export const legacyAdminPaths: Record<string, string> = {
  overview: "/admin",
  profile: "/admin/settings/profile",
  theme: "/admin/settings/appearance",
  account: "/admin/settings/account",
  home: "/admin/content/home",
  about: "/admin/content/about",
  projects: "/admin/portfolio/projects",
  work: "/admin/portfolio/work",
  resumes: "/admin/portfolio/resumes",
  gallery: "/admin/media/gallery",
};
