import { Resume, HomePageData, AboutPageData } from "@/types/portfolio";

export const resumes: Record<string, Resume> = {
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
    projects: ["glassmorphic-dashboard", "ai-portfolio-generator"]
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
    projects: ["glassmorphic-dashboard"]
  }
};

export const homePageData: HomePageData = {
  name: "Alex Chen",
  tagline: "Full Stack Developer & UI/UX Designer crafting digital experiences with modern technologies and beautiful design",
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
      icon: "⚛️"
    },
    {
      name: "Backend",
      skills: ["Node.js", "Python", "GraphQL"],
      icon: "🔧"
    },
    {
      name: "Design",
      skills: ["Figma", "UI/UX", "Prototyping"],
      icon: "🎨"
    },
    {
      name: "Cloud",
      skills: ["AWS", "Docker", "CI/CD"],
      icon: "☁️"
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