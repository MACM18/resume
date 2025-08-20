export interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string;
  image?: string;
  tech: string[];
  demo_url?: string;
  github_url?: string;
  featured: boolean;
  published: boolean;
  user_id: string;
  created_at: string;
  key_features?: string[]; // New field for AI-generated key features
}

export interface Resume {
  id: string;
  role: string;
  title: string;
  summary: string;
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string[];
  }[];
  skills: string[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  project_ids: string[];
  resume_url: string | null;
  pdf_source: 'uploaded' | 'generated';
  user_id: string;
  created_at: string;
  certifications?: { // New field for certifications
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }[];
}

export interface HomePageData {
  name: string;
  tagline: string;
  socialLinks: {
    platform: string;
    icon: string;
    href: string;
    label: string;
  }[];
  experienceHighlights: {
    metric: string;
    title: string;
    subtitle: string;
    description: string;
  }[];
  technicalExpertise: {
    name: string;
    skills: string[];
  }[];
  achievements: {
    title: string;
    description: string;
    metric: string;
    label: string;
  }[];
  callToAction: {
    title: string;
    description: string;
    email: string;
  };
}

export interface AboutPageData {
  title: string;
  subtitle: string;
  story: string[];
  skills: {
    category: string;
    icon: string;
    items: string[];
  }[];
  callToAction: {
    title: string;
    description: string;
    email: string;
  };
}

export type Theme = Record<string, string>;

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  tagline: string;
  domain: string | null;
  home_page_data: HomePageData;
  about_page_data: AboutPageData;
  active_resume_role: string | null;
  theme: Theme | null;
  updated_at: string;
}