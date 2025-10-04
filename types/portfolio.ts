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

export interface UploadedResume {
  id: string;
  user_id: string;
  file_path: string;
  public_url?: string | null;
  original_filename: string;
  file_size?: number | null;
  created_at: string;
}

export interface Resume {
  id: string;
  role: string;
  title?: string;
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
  pdf_source: "uploaded" | "generated";
  uploaded_resume_id?: string | null; // Foreign key to uploaded_resumes
  user_id: string;
  created_at: string;
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }[];
  location?: string; // New field for resume location
}

export interface WorkExperience {
  id: string;
  user_id: string;
  company: string;
  position: string;
  location?: string | null;
  start_date: string; // ISO date string
  end_date?: string | null; // null when current
  is_current: boolean;
  visible: boolean; // controls public visibility
  description: string[]; // bullet points
  created_at: string;
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
  about_card_description?: string; // New field for the About Me card description
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
  background_image_url: string | null; // New field for background image
  favicon_url?: string | null; // Optional favicon URL
  contact_numbers?: {
    id: string;
    number: string;
    label: string;
    isActive: boolean;
    isPrimary: boolean;
  }[];
}
