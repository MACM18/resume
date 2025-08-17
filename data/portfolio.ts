import { Project, Resume, HomePageData, AboutPageData } from "@/types/portfolio";

// This static data is used to seed the database for a new user.
export const projects: Omit<Project, 'user_id' | 'created_at'>[] = [
  {
    id: "glassmorphic-dashboard",
    title: "Glassmorphic Dashboard",
    description: "A modern analytics dashboard with a glassmorphism design.",
    long_description: "This project is a proof-of-concept for a modern analytics dashboard. It features a cutting-edge glassmorphism design, real-time data visualization, and a seamless user experience. The entire UI is built with reusable components and is fully responsive.",
    image: "https://raw.githubusercontent.com/ask-dyad/portfolio-template/main/public/project-1.png",
    tech: ["React", "TypeScript", "Framer Motion", "Tailwind CSS", "Recharts"],
    demo_url: "#",
    github_url: "#",
    featured: true,
    published: true
  },
  {
    id: "ai-portfolio-generator",
    title: "AI Portfolio Generator",
    description: "An AI-powered tool to generate professional portfolios in minutes.",
    long_description: "This tool leverages AI to help developers and designers create stunning portfolios with minimal effort. Users can input their information, and the AI will generate a complete, customizable portfolio website. It's built with Next.js for performance and scalability.",
    image: "https://raw.githubusercontent.com/ask-dyad/portfolio-template/main/public/project-2.png",
    tech: ["Next.js", "TypeScript", "OpenAI API", "Supabase", "Tailwind CSS"],
    demo_url: "#",
    github_url: "#",
    featured: false,
    published: true
  }
];

export const resumes: Record<string, Omit<Resume, 'user_id' | 'id' | 'created_at'>> = {
  developer: {
    role: "developer",
    title: "Full Stack Developer",
    summary: "Passionate full-stack developer with 5+ years of experience creating modern web applications using React, Node.js, and cloud technologies. Specialized in building scalable solutions with clean, maintainable code.",
    experience: [
      {
        company: "Tech Solutions Inc.",
        position: "Senior Full Stack Developer",
        duration: "2022 - Present",
        description: [
          "Led development of 3 major web applications serving 10k+ users",
          "Implemented CI/CD pipelines reducing deployment time by 60%",
          "Mentored junior developers and conducted code reviews"
        ]
      },
      {
        company: "StartupXYZ",
        position: "Frontend Developer",
        duration: "2020 - 2022",
        description: [
          "Built responsive React applications with TypeScript",
          "Optimized application performance resulting in 40% faster load times",
          "Collaborated with design team to implement pixel-perfect UIs"
        ]
      }
    ],
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker", "GraphQL", "PostgreSQL"],
    education: [
      {
        degree: "Bachelor of Computer Science",
        school: "University of Technology",
        year: "2020"
      }
    ],
    project_ids: ["glassmorphic-dashboard", "ai-portfolio-generator"],
    resume_url: null,
    pdf_source: "generated"
  },
  designer: {
    role: "designer",
    title: "UI/UX Designer",
    summary: "Creative UI/UX designer with a passion for creating intuitive and beautiful digital experiences. Specialized in design systems, user research, and modern design trends.",
    experience: [
      {
        company: "Design Studio Pro",
        position: "Senior UI/UX Designer",
        duration: "2021 - Present",
        description: [
          "Designed user interfaces for 15+ web and mobile applications",
          "Created comprehensive design systems used across multiple products",
          "Conducted user research and usability testing"
        ]
      }
    ],
    skills: ["Figma", "Adobe Creative Suite", "Prototyping", "User Research", "Design Systems", "HTML/CSS"],
    education: [
      {
        degree: "Bachelor of Fine Arts in Digital Design",
        school: "Art Institute",
        year: "2021"
      }
    ],
    project_ids: ["glassmorphic-dashboard"],
    resume_url: null,
    pdf_source: "generated"
  }
};

export const homePageData: Omit<HomePageData, 'name' | 'tagline'> = {
  socialLinks: [
    { platform: "github", icon: "Github", href: "https://github.com", label: "GitHub" },
    { platform: "linkedin", icon: "Linkedin", href: "https://linkedin.com", label: "LinkedIn" },
    { platform: "twitter", icon: "Twitter", href: "https://twitter.com", label: "Twitter" },
    { platform: "email", icon: "Mail", href: "mailto:hello@example.com", label: "Email" }
  ],
  experienceHighlights: [
    {
      metric: "5+",
      title: "Years Experience",
      subtitle: "Full-stack development",
      description: "Building scalable web applications with modern technologies and best practices"
    },
    {
      metric: "50+",
      title: "Projects Delivered",
      subtitle: "Successful launches",
      description: "From startups to enterprise solutions, delivering quality code and design"
    }
  ],
  technicalExpertise: [
    {
      name: "Frontend",
      skills: ["React", "TypeScript", "Next.js"],
    },
    {
      name: "Backend",
      skills: ["Node.js", "Python", "GraphQL"],
    },
    {
      name: "Design",
      skills: ["Figma", "UI/UX", "Prototyping"],
    },
    {
      name: "Cloud",
      skills: ["AWS", "Docker", "CI/CD"],
    }
  ],
  achievements: [
    {
      title: "Top Performer",
      description: "Recognized for exceptional code quality and delivery speed",
      metric: "98%",
      label: "Client Satisfaction"
    },
    {
      title: "Open Source",
      description: "Active contributor to popular React and TypeScript projects",
      metric: "15+",
      label: "Contributions"
    },
    {
      title: "Team Leadership",
      description: "Successfully led cross-functional teams on major projects",
      metric: "3",
      label: "Teams Led"
    }
  ],
  callToAction: {
    title: "Ready to Build Something Amazing?",
    description: "Let's collaborate on your next project. I bring technical expertise, creative vision, and a passion for excellence to every engagement.",
    email: "alex.chen@example.com"
  }
};

export const aboutPageData: AboutPageData = {
  title: "About Me",
  subtitle: "Passionate about creating digital experiences that make a difference",
  story: [
    "I'm a passionate full-stack developer and UI/UX designer with over 5 years of experience creating modern, scalable web applications. My journey began in computer science, but my passion for beautiful, functional design led me to specialize in the intersection of development and design.",
    "I believe that great software isn't just about clean code—it's about creating experiences that users love. Whether I'm building a complex backend system or crafting pixel-perfect user interfaces, I always keep the human element at the center of my work.",
    "When I'm not coding, you'll find me exploring new design trends, contributing to open-source projects, or mentoring junior developers. I'm always excited to take on new challenges and collaborate with teams that share my passion for innovation."
  ],
  skills: [
    {
      category: "Frontend",
      icon: "Code",
      items: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Framer Motion"]
    },
    {
      category: "Backend",
      icon: "Zap",
      items: ["Node.js", "Python", "PostgreSQL", "GraphQL", "AWS"]
    },
    {
      category: "Design",
      icon: "Palette",
      items: ["Figma", "Adobe Creative Suite", "UI/UX Design", "Prototyping"]
    },
    {
      category: "Other",
      icon: "Heart",
      items: ["Git", "Docker", "CI/CD", "Agile", "Team Leadership"]
    }
  ],
  callToAction: {
    title: "Let's Work Together",
    description: "I'm always open to discussing new opportunities, interesting projects, or just having a chat about technology and design.",
    email: "hello@example.com"
  }
};